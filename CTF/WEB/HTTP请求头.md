# HTTP请求头
请求头（Request Headers）是HTTP协议中用于传递关于请求的额外信息的部分。

#### 请求头
##### User-Agent 用户代理
携带当前的用户代理信息，一般包含浏览器、浏览器内核和操作系统的版本型号信息。它和Server头是对应的，一个是表达服务器信息，一个是表达客户端信息。服务器可以根据用户代理信息统计出网页服务的浏览器、操作系统的使用占比情况，服务器也可以根据UA的信息来定制不一样的内容。

##### Cache-Control 缓存控制行为
控制缓存的行为，如是否允许缓存、缓存的有效期等。
##### Accept
客户端告诉服务器，客户端能够处理的媒体类型（例如，text/html、application/json等）。

##### Authorization
用于身份验证的凭证，如Bearer令牌或Basic认证。

##### Content-Type
当发送POST或PUT请求时，此头部用于指示请求体的数据类型（例如，application/json、application/x-www-form-urlencoded等）。

##### Referer
标识发起请求的页面的URL，通常用于分析用户如何到达当前页面。

> 提示得从某某网站访问，可修改此请求头。

##### Host
指定请求的域名或IP地址和端口号。对于每个HTTP请求，这是必需的。

##### X-Forwarded-For
用来说明从哪里来的，一般用来内网伪装

> 提示得从某IP访问等

##### Cookie
HTTP请求发送时，会把保存在该请求域名下的全部cookie值一块儿发送给web服务器。

> 若提示说身份为admin才可访问的，可将Cookie改为admin尝试

#### 响应头
