# 모여런

## paas-ta 배포 방법

### 서버 초기화

```shell
$ kubectl delete -f k8s/main-server-service.yaml,k8s/mysql-service.yaml,k8s/redis-service.yaml,k8s/main-server-deployment.yaml,k8s/mysql-deployment.yaml,k8s/redis-pod.yaml,k8s/mongo-deployment.yaml,k8s/mongo-service.yaml
```

### 서버 실행 방법

```shell
# 1. mysql, redis, mongo paas-ta에 올린다.
$ kubectl apply -f k8s/mysql-deployment.yaml,k8s/redis-pod.yaml,k8s/mongo-deployment.yaml,k8s/redis-service.yaml,k8s/mysql-service.yaml,k8s/mongo-service.yaml

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
$ kubectl apply -f k8s/main-server-deployment.yaml,k8s/main-server-service.yaml
```
