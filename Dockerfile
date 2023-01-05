FROM node:18-alpine

WORKDIR /app

# 패키지 설치
COPY ["package.json", "package-lock.json", "./"]
RUN ["npm", "install"]

COPY . .

RUN apk add --no-cache make gcc g++ python3 &&\
   npm install &&\
   npm rebuild bcrypt --build-from-source && \
   apk del make gcc g++ python3

# 빌드
CMD npm run start:dev