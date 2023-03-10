# 소개

- [React, NextJS and NestJS: A Rapid Guide - Advanced](https://www.udemy.com/course/react-nestjs-advanced/) 강의의 레포지토리입니다.
- 다만 시간이 지남에 따라, 혹은 사용 라이브러리의 변화에 따라 강의 내 코드와 레포의 코드가 일치하지 않을 수 있습니다. 이 점 유의하여 참고 부탁드립니다.
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
- mysql 버전을 5.7.22 에서 5.7.29 로 변경했습니다. [참고](https://github.com/docker/for-mac/issues/6137)

### 8. Register

- [공식 문서](https://docs.nestjs.com/security/encryption-and-hashing)에는 bcrypt 사용이 기본으로 설정되어 있었다.
- 강의에서는 bcrypt 대신 bcryptjs 를 사용해야 한다. 그렇지 않을 경우 문제가 발생했다.
- ELF 문제
  - 추측: node 버전 문제인 것 같지만 확실하지는 않다. ELF 문제가 메인에 뜬다.
  - 원인: docker 를 통해 bcrypt 가 python 를 이용해서 그렇다고 한다. 순수 node 로는 처리가 안되는 코드가 있어서 그렇다고 한다.
  - 해결1: bcrypt 대신 bcryptjs 를 사용한다. 대신 보안문제는 감수해야 한다.
    - 사용하지 않음. 1) 더 좋은 라이브러리를 놔두고 구식을 쓰는게 해결책이 될 수는 없고. ( [같은 문제의식](https://velog.io/@devookim/docker%EC%97%90%EC%84%9C-bcrypt-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0) ) 2) 라이브러리 중 순수 js 만 쓰지 않는 라이브러리(sharp) 같은 건 쓸 수 없다는 소리이기 때문.
  - 해결2: 필요한 의존성 직접 설치
    - 아래 '해결책'에서 더 자세히 설명.
  - Dockerfile 및 yaml 파일 수정 후, `docker-compose up --build` 를 통해 image 를 새로 빌드 - 실행 하였다. 관련 [문서](https://velog.io/@langssi/Dockerfile-docker-compose.yml-%EC%97%85%EB%8D%B0%EC%9D%B4%ED%8A%B8-%ED%9B%84-%EC%BB%A8%ED%85%8C%EC%9D%B4%EB%84%88-%EC%9E%AC%EC%8B%9C%EC%9E%91) 참고
- Exec format error
  - 원인: yaml 에 있는 volumns 가 문제가 되었다. volumns 가 app 전체를 땡겨오다 보니 local의 `node_modules` 까지 이용 해 버리는 문제였다.
    - python 도 그렇고 c++ 도 그렇고 맥이냐 리눅스냐에 따라 설치되는 게 다른데, OS 다른데 node_modules 를 같은걸 쓰려다 보니 에러가 나는 것 같았다.
  - 해결1: volumns 를 쓰지 않는다.
    - 사용하지 않음. 1) 물론 node_modules 를 땡겨오지 않는 건 좋지만, 동시에 'src' 내 파일들도 안땡겨오기 때문에 코드 수정이 즉각적으로 반영되지 않을 것이라는 고민. 2) volumes 도 세밀하게 쓰는 방법이 있읉텐데 이렇게 안되니 안쓴다는 건 납득하기 어려웠음. 차라리 volumes 부분을 공부하는 게 낫다고 판단.
- 해결책 - [참고](https://www.richardkotze.com/top-tips/install-bcrypt-docker-image-exclude-host-node-modules)
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

- `createForeginKeyConstraints` 를 `false` 로 주는 것이 핵심이다.

  - 양쪽에 해당 옵션을 넣어준다.
  - joinColumn 은 nestjs 에만 영향을 미치나보다(?) 넣어줘도 db 에는 반영되지 않는 것 같다.

- fk 를 db가 아닌 코드레벨 단위에서 관리하게 되어 유연함을 확보할 수 있다. (는 이야기가 장점으로 소개되고는 한다.)

### 21. Shared Module

- 처음 NestJS 를 쓸 때 가장 애먹었던 부분. 이제는 익숙하다.
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

### 27. Redis

- 언젠가 써봐야지 하던 걸 이 강의에서 쓰게 되었다. 좋다!
- 강의와는 달리 @types/cache-manager 안해도 되는것처럼 [공식문서](https://docs.nestjs.com/techniques/caching#in-memory-cache)에 나와있다. 타입을 패키지 안에 넣어준 듯?
  - cache-manager-redis-store 가 Node-redis 4버전을 지원하지 않는 문제가 있다고 한다. (nestjs [공식문서](https://docs.nestjs.com/techniques/caching#different-stores) 및 [github issue](https://github.com/dabroek/node-cache-manager-redis-store/issues/40) 참고)
  - `npm i --save cache-manager-redis-store` [참고](https://www.npmjs.com/package/cache-manager-redis-store)
  - `npm i cache-manager@4.1.0` 5버전 올라가면서 문법 바뀌었다고 한다. [참고](https://velog.io/@chss3339/redis-%EC%97%90%EB%9F%AC-TypeError-store.get-is-not-a-function-NestJs-cache-manager). 4버전으로 바꿔주자...

```javascript
import { CacheModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import * as rs from 'redis';

@Module({
  imports: [
    JwtModule.register({
      secret: 'bad_hard_coding_in_module.',
      signOptions: { expiresIn: '1d' },
    }),
    CacheModule.register({
      store: rs.redisStore,
      host: 'localhost',
      port: 6379,
      legacyMode: true,
    }),
  ],
  exports: [JwtModule, CacheModule],
})
export class SharedModule {}
```

- 에러가 나서 ioredis 도 써보고 redis 버전도 바꾸는 등 이것저것 하다가, cache-manager-redis-store 대신 redis 에서 redisStore 를 가져와 문제를 해결했다. 해결 된 걸까...?

### 28. Caching Products

```javascript
  @CacheKey('products_frontend')
  @CacheTTL(30 * 60)
  @UseInterceptors(CacheInterceptor)
  @Get(`ambassador/products/frontend`)
  async frontend() {
    return this.productService.find();
  }

  @Get(`ambassador/products/backend`)
  async backend() {
    let products = await this.cacheManager.get(`products_backend`);

    if (!products) {
      products = await this.productService.find({});

      await this.cacheManager.set(`products_backend`, products, 1800);
    }

    return products;
  }
```

- redis 를 사용해 cache 를 구성하는 두 가지 방법을 배울 수 있다.

### 29. Event Emitters

- cache 에 데이터를 넣으면, 해당 데이터 목록이 갱신될 때마다 cache 를 지워줘야 한다. 근데 그건 프로덕트 사이즈가 커질수록 어려워진다.
  - 그래서 `event emitter` 를 쓰게 된다. [참고](https://docs.nestjs.com/techniques/events#events)
  - `npm i --save @nestjs/event-emitter`
- 캐싱을 지워줘야 할 때는 emit 으로 이벤트 발생만 알려주고, 처리는 listener 를 따로둬서 거기서 하게.
  - 그리고 listener 도 서비스의 일종이기 때문에 provider 에 넣어야 작동한다. 안넣으면 오류는 안나는데 이벤트 받아서 동작하지를 않음.

### 30. Searching Products

- query 를 어떻게 처리할지 궁금했는데 잘되었다. 특히 단어의 경우 앞뒤로 %를 붙여야 해서 처리가 까다로웠기 때문이다.
  - typeorm 과 연동 안해서 아쉬움.

### 32. Paginating Products

- 로직 정도만 알려준다. 나머지 영역은 typeorm 에서 알아서 해라 그건가.
  - 예전에는 pagination function 을 만들어서 썼는데... typeorm pagination 관련 라이브러리 코드를 좀 봐야겠다.

### 34. Createing Links

- fk 없이도 연결한 다른 테이블의 id를 이용할 수 있었다.
  - 다만 이렇게 했을 때 user 가 원하는 것보다 더 많은 정보를 가지고 오는데, 이런 문제는 어떻게 해결할지 궁금하다.

### 36 - 37. redis 고급기능 이용 (추후 확인)

- nestjs 의 미지원 문제가 있었음.
  - cache manager, redis version, type/redis type 등등 꼬인게 많은데 해결하지 못했음.
- 자체적으로 해결하기 어려워 우선 건너뛰고 강의를 다 들은 뒤 해결하기로 결정.

---

## 섹션 4. Nest Checkout

### 38. checkout endpoint

- GET /api/checkout/links/{code}
- POST /api/checkout/orders
- POST /api/checkout/orders/confirm

### 39. Getting Link Data

- 기존 작업의 반복. password 같은 정보가 반환되지 않도록 `@UseInterceptors(ClassSerializerInterceptor)` 를 데코레이터로 씌워준다.
  - 인터셉터가 relation 된 데이터까지 검사해서 제외할 수 있을지 궁금했는데 확인할 수 있었다.
  - 데이터가 리턴 될 때 검사하기 때문에, 리턴되기 전에는 password 와 같은 민감정보도 활용할 수 있다.

### 40. Creating orders

- 오래된 강의라는 걸 느낄 수 있는 파트
  - Order 데이터를 만들 때 new Order 를 생성하고 거기에 하나씩 데이터를 주입한다. 근데 Order 에는 데이터만 있는게 아니라 메소드가 같이 있어서, save 를 하면 에러가 난다. 이게 Typeorm 0.3 이전에는 되었다는 건가 그런 생각이 들었다.

### 41. Transaction

- 트랜잭션을 적용해야 하는 곳의 기준을 설명해준다.
  - 쿼리가 여러개 들어가서 잘 가다가 중간에 끊기면 에러 나는 곳.
- 민감정보에 트랜잭션 적용해야 하나 싶었는데, 생각해보니 상식적으로 쿼리가 여러개인 곳, 그리고 이전 쿼리가 이후 쿼리에 영향을 미치는 곳에 적용하는 게 맞는 것 같다.
- 그리고 여지없이 문제가 터진다. 옛날에는 entity 클래스 안에 method 써도 에러가 안 났구나... 지금은 나는데 말이다. entity 구조와 영향받는 모든 곳을 뜯어고쳐야 하는 상황이다. 머리가 아프다.
  - 제로초님의 강의 내용 중 transaction 을 다룬 부분을 통해, `query.manager.getRepository` 를 쓰면 원하는 동작을 만들 수 있음을 확인했다. 근데 그러면 뭐하나... 중간에 에러내서 뻑내도 이전과정이 롤백이 안된다. 무엇이 문제인 것인지 아주 혼란하다 혼란해. 이 부분도 일단 스킵.
  - 멍청한 건 나였구연... getRepository 를 쓰면 중간에 에러가 났을 때 롤백을 해준다. 나는 id 가 자꾸 늘어나니까 데이터가 들어갔다고 생각했는데 막상 DB도 까고 멍개님 조언대로 log 도 찍어보니 이런 것을 확인할 수 있었다. 너무 민망하다... 제로초와 멍개는 신이야! (나는 어...음...)
    - 멍개님과 나눈 [이야기](https://blog.naver.com/pjt3591oo/222927333364) (댓글 확인)

#### transaction 공통 코드를 intercepter 로 분리하기

- 참고 글 : [링크](https://hou27.tistory.com/entry/NestJS-Transaction-Interceptor-%EC%A0%81%EC%9A%A9%ED%95%98%EA%B8%B0)
  - 안 보일때는 엄청 안보이다가 문제를 해결하고 나니 보이기 시작하는 글.
  - 문제의식에 꽤나 동의해서 구현 해 볼 예정.

### 42. Stripe (추후 다룸)

- stripe 연동 부분을 다룬다. 지금 필요한 급한 부분은 아니니 건너뛴다. (어차피 연결할 때마다 해당 PG의 도큐먼트를 봐야 한다.)

### 43. Configure

- 하드코딩하던 설정들을 .env 로 분리하는 작업을 한다.
  - 민감정보가 github 같은 퍼블릭한 곳에 올라가지 않게 하는 것은 기본적인 보안이다.
- 강의 내용이 부족해서 제로초 강의와 공식문서를 참고했다.
  - 제로초 강의의 경우에도 env 로 설정하는 정도만 하고 넘어가서 공식문서 + 검색을 통해 작동하는 configure (joi 적용) 을 완성했다.
  - configure 같은 경우 한 번 잘 다져놓으면 오래도록 쓸 수 있으니, 배울 때 조금 빡빡하게 배워두는 게 좋을 듯 하다.
- cross-env 설정을 적용. docker 통해 작동 확인.

#### 번외 - joi

- Joi는 validation schema 를 지원한다.
  - unknown env 가 들어오면 에러를 내게 하고 싶었는데, npm 관련 이슈가 있어서 그러지 못했다. 추후 해답을 찾아야 할 문제로 보인다.
  - Joi 를 적용하면 들어온 데이터가 없거나, 데이터를 지정된 형태(예를 들면 boolean) 으로의 변환에 실패할 경우 에러를 내 준다.
