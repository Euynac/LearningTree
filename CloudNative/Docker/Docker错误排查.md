# Docker错误排查

## COPY找不到文件

首先要弄清楚 `context` 原理：
dockerfile的context是 `docker -f xxxx.dockerfile -t tagname <context>` 中 `context` 参数。
docker-compose中的context设置是
```yaml
flight-service-api:
  image: local-test/flight-service-api
  build:
    context: ../
    dockerfile: ./configs/dockerfiles/FlightServiceAPI.dockerfile
```
docker-compose以及dockerfile支持`.dockerignore`，但注意它只能在`context`所在目录下，因此要确定是否COPY的文件目录被忽略了，导致找不到文件。
而后COPY的目录都是相当于设定的上下文开始的，也是最外层，再往context的上一层就不行了。

> volumn中挂载的是**按照实际目录相对路径**来的，而不是Context的目录。

## docker.errors.DockerException: Error while fetching server API version: ('Connection aborted.', FileNotFoundError(2, 'No such file or directory'))

原因是 docker 没有启动

开启docker: `systemctl start docker`

查看docker 进程 `ps -ef | grep docker`

最后执行`docker-compose up -d`

## win10 docker启动后检查版本报错

```log
Docker.Core.Backend.BackendException:

Error response from daemon: open \.\pipe\docker_engine_linux: The system cannot find the file specified.
```

在win10 命令行提示符执行：

```sh
net stop com.docker.service
net start com.docker.service
```

## Failed to get D-Bus connection: Operation not permitted
centos无法使用systemctl等，需要创建容器的时候，使用特权模式。

`Docker`的设计理念是在容器里面不运行后台服务，容器本身就是宿主机上的一个独立的主进程，也可以间接的理解为就是容器里运行服务的应用进程。一个容器的生命周期是围绕这个主进程存在的，所以正确的使用容器方法是将里面的服务运行在前台。

再说到`systemd`，这个套件已经成为主流`Linux`发行版（比如`CentOS7`、`Ubuntu14+`）默认的服务管理，取代了传统的`SystemV`风格服务管理。`systemd`维护系统服务程序，它需要特权去会访问`Linux`内核。而容器并不是一个完整的操作系统，只有一个文件系统，而且默认启动只是普通用户这样的权限访问`Linux`内核，也就是没有特权，所以自然就用不了！

因此，请遵守容器设计原则，一个容器里运行一个前台服务！

我就想这样运行，难道解决不了吗？

答：可以，以特权模式创建镜像。

```sh
# 创建容器：
docker run -d -it --name xxxx --privileged=true {Image ID} /sbin/init

# 还有说是/user/sbin/init，不知道是哪个

# 进入容器：
docker exec -it centos7 /bin/bash
```

这样可以使用systemctl启动服务了。

## Docker-in-Docker问题，daemon时不时挂掉
搭建jenkins时直接使用jenkins容器中的docker，导致进行docker build等推送时常出现`ERROR: Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?`的错误
分析日志后发现可能是由于存储驱动问题，回退到`vfs`这种不稳定的驱动，会导致镜像构建和容器运行时性能低下、磁盘占用暴增，最终可能因资源不足引发连锁问题。
```
time="2025-04-01T09:09:02.013354925+08:00" level=error msg="failed to mount overlay: invalid argument" storage-driver=overlay2
time="2025-04-01T09:09:02.013431016+08:00" level=error msg="exec: \"fuse-overlayfs\": executable file not found in $PATH" storage-driver=fuse-overlayfs
time="2025-04-01T09:09:02.223953127+08:00" level=info msg="Docker daemon" storage-driver=vfs
```

