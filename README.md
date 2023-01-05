# 소개

- [React, NextJS and NestJS: A Rapid Guide - Advanced](https://www.udemy.com/course/react-nestjs-advanced/) 강의의 레포지토리입니다. 다만 강의 내용과 일치하지는 않을 수 있기에, 참고만 부탁드립니다.
- 해당 강의를 들은 이유는 한국어 강의 중에는 중급 과정의 NestJS 강의를 찾기 어려웠기 때문입니다. sse, socket, admin이 포함된 api 구성 방법 등을 한국어 강의를 통해 배우기 어렵다고 생각하던 중 해당 강의를 찾았습니다.
- 해당 강의가 제가 원하는 부분을 얼마나 깊게 다루는지는 모르겠습니다. 우선 해당 강의를 바탕으로 프로젝트를 구성한 뒤 빈 부분은 구글링을 통해 완성시켜 보고자 합니다.

# 강의 내용 정리

## 섹션2 : Nest Admin

### 4. Database

- M1 mac 을 사용한다면, docker-compose.yaml 의 내용이 바뀌어야 합니다.

```yaml
version: '3.9'
services:
  backend:
    build: .
    ports:
      - 8000:3000
    volumes:
      - .:/app
    depends_on:
      - db

  db:
    platform: linux/amd64
    image: mysql:5.7.29
    restart: always
    environment:
      MYSQL_DATABASE: ambassador
      MYSQL_USER: root
      MYSQL_PASSWORD: root
      MYSQL_ROOT_PASSWORD: root
    volumes:
      - .dbdata:/var/lib/mysql
    ports:
      - 33066:3306
```

- db 아래에 platform 을 추가했습니다. [참고](https://unluckyjung.github.io/develop-setting/2021/03/27/M1-Docker-Mysql-Error/)
- mysql 버전을 5.7.22 에서 5.7.29 로 변경되었습니다. [참고](https://github.com/docker/for-mac/issues/6137)

### 8. Register

- [공식 문서](https://docs.nestjs.com/security/encryption-and-hashing)에는 bcrypt 사용이 기본으로 설정되어 있었다.
- 강의에서는 bcrypt 대신 bcryptjs 를 사용해야 한다. 그렇지 않을 경우 문제가 발생했다.
- ELF 문제
  - node 버전 문제인 것 같지만 확실하지는 않다. ELF 문제가 메인에 뜬다.
  - 원인: docker 를 통해 bcrypt 가 python 를 이용해서 그렇다고 한다. 순수 node 로는 처리가 안되는 코드가 있어서 그렇다고 한다.
  - 해결1: bcrypt 대신 bcryptjs 를 사용한다. 대신 보안문제는 감수해야 한다.
    - 사용하지 않음. 1) 더 좋은 라이브러리를 놔두고 구식을 쓰는게 해결책이 될 수는 없고. ( [같은 문제의식](https://velog.io/@devookim/docker%EC%97%90%EC%84%9C-bcrypt-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0) ) 2) 라이브러리 중 순수 js 만 쓰지 않는 라이브러리(sharp) 같은 건 쓸 수 없다는 소리이기 때문.
  - 해결2: 필요한 의존성 직접 설치
    - 아래 '해결책'에서 더 자세히 설명.
  - Dockerfile 및 yaml 파일 수정 후, `docker-compose up --build` 를 통해 image 를 새로 빌드 - 실행 하였다.
    - 관련 [문서](https://velog.io/@langssi/Dockerfile-docker-compose.yml-%EC%97%85%EB%8D%B0%EC%9D%B4%ED%8A%B8-%ED%9B%84-%EC%BB%A8%ED%85%8C%EC%9D%B4%EB%84%88-%EC%9E%AC%EC%8B%9C%EC%9E%91)
- Exec format error
  - 원인: yaml 에 있는 volumns 가 문제가 되었다. volumns 가 app 전체를 땡겨오다 보니 local의 `node_modules` 까지 이용 해 버리는 문제였다. python 도 그렇고 c++ 도 그렇고 맥이냐 리눅스냐에 따라 설치되는 게 다른데, OS 다른데 node_modules 를 같은걸 쓰려다 보니 에러가 나는 것 같았다.
  - 해결1: volumns 를 쓰지 않는다.
    - 사용하지 않음. 1) 물론 node_modules 를 땡겨오지 않는 건 좋지만, 동시에 'src' 내 파일들도 안땡겨오기 때문에 코드 수정이 즉각적으로 반영되지 않을 것이라는 고민. 2) volumns 도 세밀하게 쓰는 방법이 있읉텐데 이렇게 안되니 안쓴다는 건 납득하기 어려웠음. 차라리 volumns 부분을 공부하는 게 낫다고 판단.
  - 해결2: 검색 중 아래 해결책을 찾음.
- 해결책
  - 어떤 답변에서는 bcrypt 대신 bcryptjs 를 쓰라는... 뭐랄까 그렇게 하면 되기는 하지만 정답은 아닌 답변이 있었다.
  - 그래서 구글링 더 하다가 [해결책](https://www.richardkotze.com/top-tips/install-bcrypt-docker-image-exclude-host-node-modules)을 발견했다.
- 해결책
  - ELF: 이미지 생성 시 python3 를 설치하도록 했다.
  - Exec: anonymous volume 처리를 해줬다.
- 추가
  - ELF 와 Exec 모두 실제 이용 시 맞지 않는(?) 부분이 있었다.
    - ELF: 원문에서는 python 을 설치하도록 했지만, 현재 시점에서는 설치할 수 없었다. python3 를 대신 설치했다.
    - Exec: 강의가 설치하는 /app 위치 바로 뒤에 /node_modules 를 붙여 주었다.
      - [다른 글](https://ui.toast.com/weekly-pick/ko_20160823) 을 읽다가 생각이 떠올랐다.

### 10. Authenticated User

- class-transformer 와 reflect-metadata 조합을 통해 바깥으로 보여주기 싫은 데이터를 처리하는 방법을 배울 수 있었다. 아무리 찾아도 마땅한 게 없었는데 아주 최고다.

### 13. Ambassadors

- 시드 만드는 방법, [fakerjs](https://fakerjs.dev/guide/) 사용법을 배운다.
- seed 를 만들었는데, 절대경로를 읽지 못해 실행되지 않았다.
  - [문서](https://if1live.github.io/posts/use-absolute-path-in-typescript/) 를 참고하여 명령어를 만들었다.
  - 시드는 db 쓰고 있어서 외부에서 실행 안됨. `docker-compose exec backend sh` 로 도커 컨테이너에 들어간 뒤 `npm run seed:ambassadors` 로 실행시켜주자.

### 18. exposing fields

- class-transformer 를 통해 제공할 데이터(expose)와 제외할 데이터(exclude), 그리고 제공 시에만 보야줄 데이터를 만드는 법을 배웠다.

### 19. Links

- typeorm 의 기능을 이용하여 FK 를 연결하는 방법을 배움.
  - document 보다 심화된 내용이어서 실무에서도 적용할 수 있을 것으로 보인다.

### 20. Relations Without Foreign Keys

- "실무에서는 FK 연결 안해요. 하면 제약조건 많아서 그래요." 개발바닥 오픈채팅 방에서 나오던 말인데, 실습 해 보게 되었다.

```javascript
@OneToMany(() => Order, (order) => order.link, {
    createForeignKeyConstraints: false,
  })
orders: Order[];
```

`createForeginKeyConstraints` 를 `false` 로 주는 것이 핵심이다.
(양쪽에 해당 옵션을 넣어준다.)
(joinColumn 은 nestjs 에만 영향을 미치나보다(?) 넣어줘도 db 에는 반영되지 않는 것 같다.)

- fk 를 db가 아닌 코드레벨 단위에서 관리하게 되어 유연함을 확보할 수 있다. (는 이야기가 장점으로 소개되고는 한다.)

### 21. Shared Module

- 처음 NestJS 를 쓸 때 가장 애먹었던 부분... 이제는 익숙하다.
- 모듈을 공유하는 방법을 알려준다.
  - 예시로 드는게 JwtModule 인데, 이걸 Auth 로 땡기는 게 아니라 Shared 라는 Module 을 만들고, 거기에 JwtModule 을 넣는 식이다... 이러면 나중에 사이즈 커질수록 Shared 에 다른 게 붙을텐데 이렇게 하는게 맞는 건가...? 프로그램만 효율적으로 돌아간다면야 괜찮겠지만. 에러가 났을 때 어디서 문제가 생긴건지 확인하기 어려울 수 있어서 이렇게 하는 게 맞는건지 고민이 된다.

### 23. Multiple Routes

- multi controller 를 쓸거라 생각했는데 아니었다. http method decorator 에 들어가는 path 를 복수개로 쓸 때의 활용법에 관한 강의였다.
- endpoint 가 여러개일 때도 하나의 컨트롤러 함수로 처리해주고 싶을 때 이렇게 하는구나 생각했다.
  - endpoint 가 다른 건 req.path 로 찾아서 처리해주면 되는구나 생각했다.
  - multiple routes 는 내부 코드가 복잡해지면 점점 코드가 더러워 질 것 같다. 그래서 아주 좋은 방법인지는 모르겠지만 활용은 할 수 있을 것 같다. (어느정도 틀이 정해져있는 register 나 login 같은 부분?)

### 24. Scope

- scope 를 db 에서 관리하는게 아니라 코드레벨에서 관리할 때는 이렇게 할수도 있구나 생각했다.
  - Guard 쓸 때 role 에 넣고 확인하는 게 아니라 path 와 scope 조합으로 확인했다.
  - 다만 string을 enum 지정 안하고 쌩으로 쓰는건 조금 불..편..
  - 그리고 admin 인지 아닌지 확인할 때 path 를 쌩으로 넣어서 쓰는데, 이러면 path 수정할 때 로직 깨지지 않을까 생각도 했다.
    - passport 쓰는데 이유가 있다...

### 25. Revenue

```javascript
const { password, orders, ...data } = user;

return {
  ...data,
  revenue: user.revenue,
};
```

- 필요없는 데이터를 뺄 때 너무 sql 만 쓰려고 했던 건 아닌가 생각하게 되었다. 최적화 해야 할 때는 당연히 그렇게 해야겠지만, typeorm 에서 그렇게 데이터 솎아내는게 쉽지가 않았기 때문이다. 생산성 생각해서는 저렇게 처리하는 것도 고려는 해 볼만 할 듯.
