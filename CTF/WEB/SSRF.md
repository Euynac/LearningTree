

[了解SSRF,这一篇就足够了 - 先知社区 (aliyun.com)](https://xz.aliyun.com/t/2115)
[SSRF漏洞用到的其他协议（dict协议，file协议） - My_Dreams - 博客园 (cnblogs.com)](https://www.cnblogs.com/zzjdbk/p/12970919.html)
[Gopher协议原理和限制介绍——Gopher协议支持发出GET、POST请求（类似协议转换）：可以先截获get请求包和post请求包，在构成符合gopher协议的请求_11898275的技术博客_51CTO博客](https://blog.51cto.com/u_11908275/6392927)

SSRF(`Server-Side Request Forgery`, 服务器端请求伪造) 是一种由攻击者构造形成由服务端发起请求的一个安全漏洞。一般情况下，SSRF攻击的目标是从外网无法访问的内部系统。（正是因为它是由服务端发起的，所以它能够请求到与它相连而与外网隔离的内部系统）

# 协议

## Gopher

`gopher`协议是一个古老且强大的协议，是一种信息查找系统，可以理解为是`http`协议的前身，它可以实现多个数据包整合发送。通过`gopher`协议可以攻击内网的 `FTP`、`Telnet`、`Redis`、`Memcache`，也可以进行 `GET`、`POST` 请求。

在`WWW`出现之前，`Gopher`是`Internet`上最主要的信息检索工具，Gopher站点也是最主要的站点，使用`tcp70`端口。

#### 协议格式

```sh
gopher://<host>:<port>/<gopher-path>_<TCP数据流>
# <port>默认为70
# 发起多条请求每条要用回车换行去隔开使用%0d%0a隔开，如果多个参数，参数之间的&也需要进行URL编码
```

#### 限制

|语言|支持情况|
|---|---|
|PHP|`--wite-curlwrappers`且php版本至少为5.3|
|Java|小于JDK1.7|
|Curl|低版本不支持|
|Perl|支持|
|ASP.NET|小于版本3|

几点局限性：
- 大部分 PHP 并不会开启 fopen 的 gopher wrapper
- file_get_contents 的 gopher 协议不能 URLencode
- file_get_contents 关于 Gopher 的 302 跳转有 bug，导致利用失败
- PHP 的 curl 默认不 follow 302 跳转
- curl/libcurl 7.43 上 gopher 协议存在 bug（%00 截断），经测试 7.49 可用
## File
基本形式：`file://host/path`
> If _host_ is omitted, it is taken to be **localhost**, the machine from which the URL is being interpreted. 所以一般就会是用 `file:///path`这种形式

可以读取服务器文件，常用于源码泄露。