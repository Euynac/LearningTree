# 语法

#### @
错误抑制，可以抑制函数错误输出。
[Web小白的CTF自学笔记（5）——PHP基础 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/688362521)



# 弱类型

![](../../attachments/Pasted%20image%2020230911233713.png)
> 1. 注意 `php8.0` 之后，字符串不再自动转为数字与数字比较。
> 2. 里面`"php"`指的是字符串
> 3. 下面都指的是`php7及以下`

弱类型中，最容易忽视的是：
```php
var_dump("admin"==0); //true
var_dump("1admin"==1); //true 与数字比较时，自动转化前面的字符串数字为数字，碰到其他字符结束
var_dump("admin1"==1); //false
var_dump("admin1"==0); //true
var_dump("0e123124"=="0e44912"); //true 科学计数法时(0e开头) 视为相等，php8也适用
```

# 哈希绕过
`md5(array())`将等于 `null`，因为函数接收了非有效参数输入。


# php.ini安全配置

## 临时设置

可以使用`ini_set()`函数在脚本里面临时开启某个设置。但是注意并不是所有的设置都可以，比如`allow_url_include`就不行。

具体：[PHP: List of php.ini directives - Manual](https://www.php.net/manual/en/ini.list.php)

#### 输出错误信息
```php
if(!ini_get('display_errors')) 
{
    ini_set('display_errors', 'On');
}
error_reporting(E_ALL);
```



## 常用配置
#### allow_url_include
The term "allow_url_include" refers to a PHP setting that controls whether or not remote file inclusion is allowed. When set to "On", it allows PHP scripts to include files from remote locations using a URL. This can be useful for accessing resources or libraries hosted on other servers, but it can also pose a security risk if not used carefully.
#### allow_url_fopen
determines whether PHP is allowed to open remote files using functions like `file_get_contents()` or `fopen()` with a URL path.

#### magic_quotes_gpc
"magic_quotes_gpc" is a security feature in PHP that automatically adds escape characters to certain characters in user input data, such as quotes and backslashes, to prevent SQL injection attacks. However, this feature is now deprecated and should not be relied upon as the sole means of preventing such attacks. Therefore, it is recommended to turn it off and use other security measures, such as prepared statements and input validation.

#### short_open_tag
短标签允许使用` <? ?> `来代替` <?php ?> `来开启和结束 PHP 代码段。原本`<? ?>`内内容不解析的，现在也会尝试解析了。

# 伪协议(Pseudo Protocols)
也被称为流包装器（`wrapper`），这些伪协议以`php://`开头，后面跟着一些参数，用于指定要执行的操作或需要访问的资源。
伪协议表明这些协议并不是一个真实的外部协议，例如`http`或`ftp`。`PHP`伪协议的出现是为了提供一个统一的、简洁的接口来处理不同的数据流。这些伪协议可以被看作是一种桥梁，它们允许开发者使用常规的文件操作函数来处理各种不同的数据流。


> 吐槽：似乎中国才称伪协议。看官方解释：
> [PHP: php:// - Manual](https://www.php.net/manual/en/wrappers.php.php)
> [PHP: Supported Protocols and Wrappers - Manual](https://www.php.net/manual/en/wrappers.php)

[文件包含&PHP伪协议利用_file_get_contents()支持的协议_红云谈安全的博客-CSDN博客](https://blog.csdn.net/qq_51524329/article/details/121439731)

## php://input

> 条件：`allow_url_include = On` 时，可以在诸如`include()`函数中执行命令

提供了一个方式来 读取HTTP请求体的原始内容。

注意，使用POST方法请求体时，必须按照`enctype`的格式进行传参，不然读取为空。（抓包发现原来是Hackbar问题，格式不对并没有传参）
比如`application/x-www-form-urlencoded`，要么就直接用`raw`，也就是`Content-Type: text/plain`

```php
<?php
# 尝试通过 php://input 协议获取原始 POST 数据
$raw_data = file_get_contents('php://input');
var_dump($raw_data);

echo '</br>';

# 经 PHP 整理的 POST 数据，是个数组
var_dump($_POST);
```


## php://filter

> 条件：无

可用来定义接下来输入和输出流（I/O streams），也即数据流，可以是某个文件（xx.php）或某个url（http://www.baidu.com），然后可以在访问数据流之前进行「过滤」，并指定过滤方式。

过滤器语法：`php://filter/[read=或write=]filter-name[|other-filter-name]/resource=xxxx`, 其中`read=`可选。多个过滤器用`|`分隔，按从左到右的方式过滤。

> read定义的是输入流，write定义的是输出流，具体看某个函数所需参数是输入流还是输出流

以下是各种过滤器[PHP: 可用过滤器列表 - Manual](https://www.php.net/manual/zh/filters.php)
- `string.toupper`
- `string.tolower`
- `string.rot13`
- `convert.base64-encode`
- `convert.iconv.<in-charset>.<out-charset>` 将数据流的内容按照「指定字符编码」来转。
- `string.strip_tags` 将形如`<>`的xml标签去除。注意这是读取文件后，执行前就去除。

> string.tolower等过滤器是执行渲染后再tolower或toupper，不带过滤器也是先执行。
> convert.base64-encode是将源文件内容整体编码

```php
# string.rot13似乎只对 <...> 块中的内容进行rot13？而且<...>中的内容可以回显到网页源码中。可能这就是因为php是基于标签的脚本语言
123
<?php
    echo "hello"
?>
<name>杨过</name>
123
# 结果为
123
<?cuc
    rpub "uryyb"
?>
<anzr>杨过</anzr>
123
```

### convert.iconv过滤器
与`iconv ( string $in_charset , string $out_charset , string $str ) : string`函数作用一致。
但是这里有个妙用，首先得知道两种编码：`UCS-2LE`和`UCS-2BE`
UCS代表Universal Character Set（通用字符集），2代表是两个字节的等宽编码，UCS-2LE用于将Unicode字符存储为16位字节序列。UCS-2LE中的LE表示"Little Endian"，表示低位字节在前面，高位字节在后面。而BE代表big-endian（大端序）。在其中第一个字节存储高阶字节，第二个字节存储低阶字节。
那么对常规unicode字符进行这样的转换，就相当于对字符串每两位进行反转。所以注意得是偶数字符串，否则将会转换失败。

### 示例
```php
######### read过滤器应用于接收输入流参数的函数

# 等同于readfile('http://www.baidu.com');
readfile('php://filter/resource=http://www.baidu.com');

# 转大写输出
readfile('php://filter/read=string.toupper/resource=index.php');

# include源码泄露
include("php://filter/convert.base64-encode/resource=index.php");

# 通过 php://input 协议获取原始 POST 数据
file_get_contents('php://input');

######### write过滤器应用于接收输入流参数的函数
file_put_contents('php://filter/write=string.tolower/resource=result.txt','hello text');

```

## 其他协议

#### file:// 

> 条件： 无

访问本地文件系统。可以`file:///etc/passwd`

#### data://

> 条件：`allow_url_fopen`,`allow_url_include`均为`on`

 数据（RFC 2397）
 这是一个输入流执行的协议，它可以向服务器输入数据，而服务器也会执行。常用代码如下：
 `http://127.0.0.1/include.php?file=data://text/plain,<?php%20phpinfo();?>`
`text/plain;base64`: 若纯文本没用可用base64编码


```php
# 测试发现只要条件满足，这就会执行代码
include($_GET['a']);
```



#### zip://

zip://协议可以用来访问服务器中的压缩包，无论压缩包里面的文件是什么类型的都可以执行。也就是说如果服务器禁止我们上传php文件那么我们可以把php文件改后缀然后压缩再上传，然后用zip协议访问。要利用zip协议时一般要结合文件上传与文件包含两个漏洞

一般的代码为`?file=zip:///php.zip#phpinfo.jpg`
其中的`#`表示的是`php.zip`的子文件名。

其他还有类似的压缩协议：
- `compress.bzip2://` 要压缩成bzip2格式
- `compress.zlib://` 要压缩成zlib格式
- `phar://` 也可以访问zip包，但访问子文件使用`/`: `?file=phar:///phpinfo.zip/phpinfo.txt`

```



http:// — 访问 HTTP(s) 网址

ftp:// — 访问 FTP(s) URLs

zlib:// — 压缩流

glob:// — 查找匹配的文件路径模式

phar:// — PHP 归档

ssh2:// — Secure Shell 2

rar:// — RAR

ogg:// — 音频流

expect:// — 处理交互式的流

```



[关于 CTF 中 php 考点与绕过那些事的总结_ctf php-CSDN博客](https://blog.csdn.net/Myon5/article/details/136455078)
# 绕过

## 函数绕过

### array_search
array_search(value,array,strict) 函数用于在数组中搜索指定的值，如果找到则返回其键（默认键是数组下标，但是如果是字典则返回它的key），否则返回 false。
如果第三个参数不传，默认为false，其实就是使用`==`的方式去遍历数组，这时候就可以使用弱类型的绕过了。

### base64_decode
base64编码中只包含64个可打印字符，而PHP在解码base64时，**遇到不在其中的字符时，将会跳过这些字符**，仅将合法字符组成一个新的字符串进行解码。
所以，一个正常的base64_decode实际上可以理解为如下两个步骤：
```php
$_GET['content'] = preg_replace('/[^a-z0-9A-Z+/]/s', '', $_GET['content']);
base64_decode($_GET['content']);
```
当`$content`被加上了`<?php exit; ?>`以后，我们可以使用`php://filter/write=convert.base64-decode` 来**首先对其解码**。在解码的过程中，字符`<、?、;、>、空格`等一共有7个字符不符合base64编码的字符范围将被忽略，所以最终被解码的字符仅有phpexit和我们传入的其他字符。
phpexit一共7个字符，**因为base64算法解码时是4个byte一组**，所以给他增加1个a一共8个字符。这样，phpexita被正常解码，而后面我们传入的webshell的base64内容也被正常解码。结果就是`<?php exit; ?>`没有了。



# 参考资料

[PHP Tricks | HackTricks](https://book.hacktricks.xyz/network-services-pentesting/pentesting-web/php-tricks-esp)