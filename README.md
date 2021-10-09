# 모여런

## paas-ta 배포 방법

### 서버 초기화

```shell
$ kubectl delete -f main-server-service.yaml,mysql-service.yaml,redis-service.yaml,main-server-deployment.yaml,mysql-deployment.yaml,redis-pod.yaml,mongo-deployment.yaml,mongo-service.yaml
```

### 서버 실행 방법

```shell
# 1. mysql, redis, mongo paas-ta에 올린다.
$ kubectl apply -f mysql-deployment.yaml,redis-pod.yaml,mongo-deployment.yaml,redis-service.yaml,mysql-service.yaml,mongo-service.yaml

# 2. .env.prod를 수정한다.
DATABASE_URL=
REDIS_URL=
MONGO_URL=

# 3. 이미지를 빌드한다.
$ docker build -t dnatuna/moyearun-main-server:<tag version> .

# 4. 이미지를 docker hub에 올린다.
$ docker push dnatuna/moyearun-main-server:<tag version>

# 5. .env.prod를 paas-ta에 등록한다.
$ kubectl delete secrets/server-secrets
$ kubectl create secret generic server-secrets --from-env-file=./.env.prod

#. 6. main-server를 paas-ta에 올린다.
$ kubectl apply -f main-server-deployment.yaml,main-server-service.yaml
```
