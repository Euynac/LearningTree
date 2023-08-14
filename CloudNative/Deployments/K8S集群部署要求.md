# 节点要求

1. 同步时钟服务器时间
2. 永久关闭 Selinux
3. 永久关闭虚拟内存交换
4. 永久关闭防火墙
5. 创建resolv.conf 文件，并配置 DNS 服务器 IP 地址。
6. 执行“vi /etc/security/limits.conf”修改系统最大句柄数限制,在文件中添加“* soft nofile 65535”和“* hard nofile 65535”。再重启服务器。
![](../../attachments/Pasted%20image%2020230814163237.png)
7.  将五个服务器中“/etc/yum.repos.d/openEuler.repo”重命名备份，然 后将“配 置文 件 \openEuler.repo ” 拷贝 到5个 服务器 的“/etc/yum.repos.d”路径下。
# 防火墙配置

> OpenEuler

- 运行 `systemctl stop firewalld.service` 命令来停止防火墙服务。
- 运行 `systemctl disable firewalld.service` 命令来禁用防火墙服务的自动启动。
- 运行 `systemctl status firewalld.service` 命令来查看防火墙服务的状态，确认已经关闭。

# 时钟配置
多服务器之间通信要保持时钟一致，特别是内网无法连接外部时间时。
## 服务端配置

1. vi /etc/chrony.conf

2. 在配置文件里添加以下配置

   server xxx.xx.xx.xx(服务端 IP) iburst (本机配置,⾃⼰既是服务端⼜是客⼾端) 允许所有连接
   allow
![](../../attachments/Pasted%20image%2020230814155326.png)
3. 按顺序执行以下语句

修改时区与同步设置

`timedatectl set-timezone 'Asia/Shanghai' timedatectl set-ntp 1`

重启服务

`systemctl enable chronyd systemctl restart chronyd 查看状态`

`systemctl status chronyd`

![](../../attachments/Pasted%20image%2020230814155551.png)

## 客户端配置

> **客户端同步时钟前必须关闭防火墙及 selinux**

1. vi /etc/chrony.conf 修改server
    
    server 188.2.93.120 iburst （IP 为时钟服务器 ip）
    

![](../../attachments/Pasted%20image%2020230814155526.png)

1. systemctl enable chronyd (3)systemctl restart chronyd 查看状态
    
2. systemctl status chronyd
    
3. 最后输入“timedatectl”命令，看到如下图所示则时钟同步成功。

![](../../attachments/Pasted%20image%2020230814155516.png)