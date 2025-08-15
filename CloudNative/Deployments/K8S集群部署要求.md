# K8S集群部署要求

## 节点要求

1. 同步时钟服务器时间
2. 永久关闭 `SELinux`
3. 永久关闭虚拟内存交换
4. 永久关闭防火墙
5. 创建 `/etc/resolv.conf` 文件，并配置 `DNS` 服务器 `IP` 地址。
6. 执行 `vi /etc/security/limits.conf` 修改系统最大句柄数限制，在文件中添加 `* soft nofile 65535` 和 `* hard nofile 65535`。再重启服务器。
![](../../attachments/Pasted%20image%2020230814163237.png)
7. 将五个服务器中 `/etc/yum.repos.d/openEuler.repo` 重命名备份，然后将配置文件 `openEuler.repo` 拷贝到5个服务器的 `/etc/yum.repos.d` 路径下。
这是配置 `yum` 仓库地址
注意这个目录下不要有多个 `.repo` 文件，它似乎只会识别一个去处理。
验证是否配置成功可以尝试 `yum list`

8. 在服务器分别执行 `dnf clean all`，`dnf makecache` 命令
`dnf clean all` 和 `dnf makecache` 命令是与 `DNF` 包管理器相关的命令，用于在基于 `RPM` 的 `Linux` 发行版上安装、更新和删除软件包。以下是它们的功能说明：

- `dnf clean all` 删除从仓库元数据生成的所有缓存文件。这有助于解决因损坏或过时的元数据引起的包安装问题。它还通过删除不必要的文件来释放一些磁盘空间
- `dnf makecache` 下载并缓存已启用仓库的元数据。这可以通过避免不必要的下载来加速包安装过程。它还确保元数据是最新的，并与远程仓库保持一致

9. 执行 `yum install -y conntrack socat tar`

`Conntrack` 是一个 `Linux` 内核模块，可以跟踪网络连接。它允许内核跟踪所有当前活动的网络连接，并提供通过用户空间接口操作它们的方法。
`Socat` 是一个命令行工具，可以建立两个双向字节流并在它们之间传输数据。它可以用于各种目的，如调试、测试和网络探索。它经常用作 `Linux` 系统中 `netcat` 工具的替代品。

10. 重启集群每个节点的服务器。


## 防火墙配置

> `openEuler`

- 运行 `systemctl stop firewalld.service` 命令来停止防火墙服务。
- 运行 `systemctl disable firewalld.service` 命令来禁用防火墙服务的自动启动。
- 运行 `systemctl status firewalld.service` 命令来查看防火墙服务的状态，确认已经关闭。

## 时钟配置

多服务器之间通信要保持时钟一致，特别是内网无法连接外部时间时。

### 服务端配置

1. `vi /etc/chrony.conf`

2. 在配置文件里添加以下配置

   ```
   server xxx.xx.xx.xx(服务端 IP) iburst (本机配置,自己既是服务端又是客户端) 
   allow
   ```

![](../../attachments/Pasted%20image%2020230814155326.png)

3. 按顺序执行以下语句

修改时区与同步设置：

```bash
timedatectl set-timezone 'Asia/Shanghai'
timedatectl set-ntp 1
```

重启服务：

```bash
systemctl enable chronyd
systemctl restart chronyd
```

查看状态：

```bash
systemctl status chronyd
```

![](../../attachments/Pasted%20image%2020230814155551.png)

### 客户端配置

> **客户端同步时钟前必须关闭防火墙及 `SELinux`**

1. `vi /etc/chrony.conf` 修改 `server`

   ```
   server 188.22.94.120 iburst （IP 为时钟服务器 ip）
   ```

![](../../attachments/Pasted%20image%2020240616173908.png)

2. 启用和重启服务：

   ```bash
   systemctl enable chronyd
   systemctl restart chronyd
   ```

3. 查看状态：

   ```bash
   systemctl status chronyd
   ```

4. 最后输入 `timedatectl` 命令，看到如下图所示则时钟同步成功。

![](../../attachments/Pasted%20image%2020230814155516.png)



## DNS服务器配置

配置好后可以使用 `dig www.xxx.com` 命令，随便输入一个网站，它会读取 `/etc/resolv.conf` 下 `nameserver` 的配置然后尝试发送请求解析，如果有回应，说明 `DNS` 配置正确。
`resolv.conf` 文件内容如下：

```bash
nameserver 188.xxx.xxx.xxx
```

可以运行 `systemctl restart NetworkManager` 命令重启使其强制生效。
## 系统资源限制配置

`Linux` 中定义的系统句柄最大数量的默认值取决于您所指的句柄类型。有不同类型的句柄，如文件描述符、进程、套接字、内存映射等。每种都有不同的限制和不同的更改方法。

例如，每个进程的文件描述符最大数量可以通过使用命令 `ulimit -n` 来检查。默认值通常是 1024，但可以通过编辑 `/etc/security/limits.conf` 文件来更改。系统的文件描述符最大数量可以通过使用命令 `cat /proc/sys/fs/file-max` 来检查。默认值取决于可用内存的数量，但可以通过使用命令 `sysctl fs.file-max=number` 来更改。

另一个例子是每个用户的最大进程数，可以通过使用命令 `ulimit -u` 来检查。默认值通常是 4096，但可以通过编辑 `/etc/security/limits.conf` 文件来更改。系统的最大进程数可以通过使用命令 `cat /proc/sys/kernel/pid_max` 来检查。默认值通常是 32768，但可以通过使用命令 `sysctl kernel.pid_max=number` 来更改。

第三个例子是系统的 `TCP/IP` 连接最大数量，可以通过使用命令 `cat /proc/sys/net/ipv4/ip_local_port_range` 来检查。默认值通常是 32768 到 61000，但可以通过使用命令 `sysctl net.ipv4.ip_local_port_range="min max"` 来更改。还有其他影响 `TCP/IP` 连接的参数，如 `net.ipv4.tcp_fin_timeout`、`net.ipv4.tcp_tw_recycle` 和 `net.ipv4.tcp_tw_reuse`。

第四个例子是每个进程的内存映射最大数量，可以通过使用命令 `cat /proc/sys/vm/max_map_count` 来检查。默认值通常是 65530，但可以通过使用命令 `sysctl vm.max_map_count=number` 来更改。

这些只是 `Linux` 中系统句柄及其限制的一些例子。可能还有其他类型的句柄具有不同的限制和更改方法。您可以通过在网上搜索或阅读 `Linux` 文档来找到有关它们的更多信息。

## openEuler 软件源

可参考 [搭建 repo 服务器 (openeuler.org)](https://docs.openeuler.org/zh/docs/22.03_LTS/docs/Administration/%E6%90%AD%E5%BB%BArepo%E6%9C%8D%E5%8A%A1%E5%99%A8.html)

1. 将 `openEuler-22.03-LTS-everything-x86_64-dvd.iso` 镜像拷贝到服务器的 `root` 目录下。

2. 按顺序执行以下命令：

   ```bash
   mkdir -p /mnt/iso

（ 2    ） mount      openEuler-22.03-LTS-everything-x86_64-dvd.iso

/mnt/iso/

（3）mkdir /opt/openeuler_repo/

（3） cp -r /mnt/iso/* /opt/openeuler_repo/

（4）   im /etc/yum.repos.d/openEuler.repo

3. 在 `openEuler.repo` 文件里写入以下内容：


   ```ini
   [base] 
   name=base
   baseurl=file:///opt/openeuler_repo
   enabled=1
   gpgcheck=1
   gpgkey=file:///opt/openeuler_repo/RPM-GPG-KEY-openEuler
   ```


4. 执行 `yum -y install nginx` 安装 `nginx`，将 `/etc/nginx/nginx.conf` 文件重命名备份，然后将 `nginx.conf` 拷贝到 `/etc/nginx` 路径下。

`nginx.conf` 文件内容修改如下：

```nginx
user  nginx;
worker_processes  auto;                          # 建议设置为core-1
error_log  /var/log/nginx/error.log  warn;       # log存放位置
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;
    sendfile        on;
    keepalive_timeout  65;

    server {
        listen       80;
        server_name  localhost;                 # 服务器名（url）
        client_max_body_size 4G;
        root         /usr/share/nginx/repo;                 # 服务默认目录

        location / {
            autoindex            on;            # 开启访问目录下层文件，这里一定要记得开，不然会有403Forbidden问题
            autoindex_exact_size on;
            autoindex_localtime  on; 
        }

    }
}
```

可以用软链接方式将 `repo` 文件夹链接到 `nginx` 目录下：

```bash
ln -s /opt/openeuler_repo /usr/share/nginx/repo
```

5. 依次执行以下命令启动 `nginx`：

   ```bash
   systemctl enable nginx
   systemctl start nginx
   systemctl status nginx
   ```

6. 打开浏览器访问本机 `IP` 地址，出现下图则部署成功。
