# Android 逆向

安卓手机基本是`ARM`架构`CPU`

## 安卓CPU架构
1. `armeabi`: 第5代、第6代的`ARM`处理器，早期的手机用的比较多。
2. `armeabi-v7a`: 第7代及以上的 `ARM` 处理器（32位）。
3. `arm64-v8a`: 第8代、64位`ARM`处理器，2016年之后中高端的手机，比如骁龙8系列，麒麟9系列，联发科1000+等。
4. `x86`: 平板、模拟器用得比较多。
5. `x86_64`: 64位的平板。

## `Arm`汇编与`x86`汇编的区别

`classes.dex`经过`java`的`dxv`虚拟机解析。
`java`调`C`语言（`.so`），托管语言容易反编译？

## `Dalvik`虚拟机

安卓系统里的`Java`虚拟机（`Dalvik`）与传统意义上的`Java`虚拟机不兼容。

`Dalvik` 是 `google` 专门为 `Android` 操作系统设计的一个虚拟机，经过深度优化，有以下特点：

1. 专用的`DEX`可执行文件格式，体积更小，执行速度更快。
2. 基于寄存器架构，并拥有一套完整的指令系统。
3. 提供了对象生命周期管理、堆栈管理、线程管理、安全和异常管理以及垃圾回收等重要功能。
4. 所有的`Android`程序都运行在`Android`系统进程里，每个进程对应着一个`Dalvik`虚拟机实例。

## `Smail`代码
`Dalvik`虚拟机拥有专属的`DEX`可执行文件格式和指令集代码。`Smali`和`baksmali`则是针对`DEX`执行文件格式的汇编器和反汇编器，反汇编后`DEX`文件会产生`.smali`后缀的代码文件，`Smali`代码拥有特定的格式与语法，`Smali`语言是对`Dalvik`虚拟机字节码的一种解释，它实现了`DEX`格式所有功能（注解、调试信息、行号等）。

`Smali`提供反汇编功能的同时，也提供了打包反汇编代码重新生成`DEX`的功能，因此`Smali`被广泛地用于`APP`广告注入、汉化和破解、`ROM`定制等方面。

## `DEX`
`Dex`是`Dalvik`虚拟机的可执行文件，`Dex`文件与标准的`Class`文件在结构设计上有着本质上的区别。标准的`Java`程序在经过编译后，还需要通过`dx`工具将在编译过程中所生成的数个`Class`文件整合成一个`Dex`文件。`Dex`文件是传统`Jar`文件大小的50%左右。并且每个`apk`文件中包含一个`classes.dex`，是`Dalvik`可执行文件。

## `ADB`
连上安卓系统，就相当于`ssh`连上`linux`一样。
`ADB` 全称 `Android Debug Bridge`，译作`Android` 调试桥。 `ADB`是一种功能多样的命令行工具，可让您与设备进行通信。`ADB` 命令可用于执行各种设备操作（例如安装和调试应用），并提供对 `Unix shell`（可用来在设备上运行各种命令）的访问权限。它是一种客户端-服务器程序，对我们以后进行安卓开发与设备系统安装方面有极大的用处。

```sh
adb connect host:port # 连接安卓模拟器
adb devices # 列出已连接的设备
adb -s 设备号 shell # 连上shell
```

## 软件

### 脱壳

和`PE`文件脱壳不一样，`PE`文件的壳运行完后就解密了整个文件到内存，`EOP`？
然后`dump`出来。
安卓壳是加载整个到内存，卡好时间点`dump`。

#### `BlackDex`
开源软件，脱壳失败可能是安卓版本过高。

#### `MT`管理器

安卓中的`app`，可以对`apk`进行重打包、签名。

### `Hook`
对某个方法或参数进行`hook`，支持使用`frida`或`xposed`进行。
比如可以将某个方法实现变为自己传入的代码片段。

[凡墙总是门](https://kevinspider.github.io/)

#### `Frida`
`Frida`是个轻量级别的`hook`框架，是`Python API`，但`JavaScript`调试逻辑

```sh
# 使用编写好的HOOK脚本
frida -UF -l exp.js
```

```sh
# 连上设备，查看设备cpu架构
> adb shell
* daemon started successfully
> root@aosp: getprop ro.product.cpu.abi
x86

# 根据cpu版本及frida版本去下载相应frida-server
https://github.com/frida/frida/releases

# 通过adb push frida server文件推到手机的/data/local/tmp目录下，并给予777权限，然后运行server
> adb push frida-serverx86 /data/local/tmp
> frida-serverx86: 1 file pushed. 6.7 MB/s (28209380 bytes in 3.992s) E:\frida
> adb shell
> root@aosp:/ # cd /
> root@aosp:/ # cd data/local/tmp/
> root@aosp:/data/local/tmp # chmod 777 frida-serverx86
> root@aosp:/data/local/tmp # ./frida-serverx86
WARNING: linker: ./frida-serverx86: unused DT entry: type 0x6ffffef5 arg 0x1c60

# 再检查是否配置成功
frida-ps -U
```

### 反编译

#### `Jadx`

反编译`apk`回`java`代码，可以以更自然的形式观看代码。
新版本搜索文本可以在资源和注解里面搜索。但是新版本某些`apk`却无法反编译（`jadx`问题）。

如果`apk`没壳，理论上都能反汇编成功。
还有`Jeb`、`GDA`，这两个不仅支持反编译`java`，也支持动态调试。

对于`Java`调`C`语言层里面的方法，反编译回的`java`代码只有方法定义（有`native`关键字），没有具体实现，需要去找到相应的`so`包进行`IDA`反汇编（`IDA`的64位和32位是指反汇编的目标架构）。

![](../../../attachments/Pasted%20image%2020230904112652.png)

比如这里就是需要去`apk`压缩包中的`lib`文件找到相应的`so`文件（动态链接库）。注意不同架构的`so`文件可能不太一样。

`IDA` 还原`JNI`函数方法名，用于显示调用的具体函数名称

[IDA 还原JNI函数方法名 的三种方法 - CSDN博客](https://blog.csdn.net/yb493071294/article/details/80378730)

![](../../../attachments/Pasted%20image%2020230904172641.png)

#### `Android Killer`

反编译`apk`回`Smali`代码，通过`Smali`语法对`apk`文件在汇编层面进行更改，修改完成后还可以重新编译、签名回`apk`文件。

![](../../../attachments/Pasted%20image%2020230904101145.png)

如果编译报错，比如某`png`文件报错，可以把那个文件删了（资源文件不影响）

## 代码

入口类（通常是`MainActivity`）中有`OnCreate`方法（相当于`init`）
也可以通过`AndroidManifest.xml`查看。

![](../../../attachments/Pasted%20image%2020230904095851.png)

