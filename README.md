# 모여런

## paas-ta 배포 방법

> 모여런은 paas-ta에서 제공하는 k8s 환경에 배포되어 있습니다.

### 서버 초기화

```shell
# 서버 전체 초기화
$ kubectl delete -f ./MoyeoRun_K8s

# Main & Noti 서버 초기화
$ kubectl delete -f ./MoyeoRun_K8s/noti-server-deployment.yaml,./MoyeoRun_K8s/main-server-deployment.yaml,./MoyeoRun_K8s/noti-server-service.yaml,./MoyeoRun_K8s/main-server-service.yaml
$ kubectl delete -f ./MoyeoRun_K8s/main-server-deployment.yaml,./MoyeoRun_K8s/main-server-service.yaml
```

### 서버 실행 방법

```shell
# 1. 이미지를 빌드한다.
$ docker build -t dnatuna/moyeorun-main-server:<tag version> ./MoyeoRun_Main
$ docker build -t dnatuna/moyeorun-noti-server:<tag version> ./MoyeoRun_Noti

# 2. 이미지를 docker hub에 올린다.
$ docker push dnatuna/moyeorun-main-server:<tag version>
$ docker push dnatuna/moyeorun-noti-server:<tag version>

# 3. MoyeoRun_K8s에 존재하는 서버 deployment에 이미지 태그를 알맞게 수정한다.

# 3. .env.prod를 paas-ta에 등록한다.
$ kubectl delete secrets/main-secrets
$ kubectl delete secrets/noti-secrets
$ kubectl create secret generic main-secrets --from-env-file=./MoyeoRun_Main/.env.prod
$ kubectl create secret generic noti-secrets --from-env-file=./MoyeoRun_Noti/.env.prod

# 4. mysql, redis, mongo paas-ta에 올린다.
$ kubectl apply -f ./MoyeoRun_K8s

# 5. Main & Noti 서버만 업데이트 시
$ kubectl apply -f ./MoyeoRun_K8s/noti-server-deployment.yaml,./MoyeoRun_K8s/main-server-deployment.yaml,./MoyeoRun_K8s/noti-server-service.yaml,./MoyeoRun_K8s/main-server-service.yaml
```
