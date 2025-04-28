# C# 基础

## 发布

#### 发布单体程序

`dotnet publish -r win10-x64 -p:PublishSingleFile=true`

## 历史

### .NET Standard

<https://learn.microsoft.com/en-us/dotnet/standard/net-standard?tabs=net-standard-1-0>

<https://devblogs.microsoft.com/dotnet/the-future-of-net-standard/>

## 坑

### Release模式下编译，Linux Docker环境运行起来中文乱码

原理是因为VS2022生成的Dockerfile编译是拷贝了源代码到容器内编译，而如果本机的代码文件编码为GB2312，当时拷过去的时候文件已经乱码，因此编译为二进制文件还是乱码，执行的时候自然也是乱码。

另外还有CRCF的问题，如果是sh脚本，在linux下就运行不正常。

## 命令

| command                                                 | function                                       | remark                                                                                                                                                |
|---------------------------------------------------------|------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| dotnet publish -c Release -r linux-arm --self-contained | 编译出目标平台linux-arm的可运行程序            | change linux-arm with the runtime that is appropriate for your case if you install the .NET runtime in your container, you can avoid --self-contained |
| dotnet restore \\xx.csproj –packages .\\packages        | 还原指定项目所需依赖，并将依赖包保存到指定目录 |                                                                                                                                                       |
|                                                         |                                                |                                                                                                                                                       |
|                                                         |                                                |                                                                                                                                                       |
|                                                         |                                                |                                                                                                                                                       |

### 问题

#### RestoreTask failed but no log
本地编译成功但是在容器环境进行`dotnet restore`还原时还原失败，这时是因为改了依赖，发现有一个包引用过`Dapr.Client v1.14`觉得没必要多次引用，然后把引用去掉了，但会导致这个谜之问题。还原后问题消失。

## Project

### Shared Project

In a Class Library, when code is compiled, assemblies (dlls) are generated for each library. But with Shared Project it will not contain any header information so when you have a Shared Project reference it will be compiled as part of the parent application. There will not be separate dlls created.

This can be useful when you want to create separate assemblies that target specific platforms but still have code that should be shared.

### csproj文件

\<ProduceReferenceAssembly\>false

\</ProduceReferenceAssembly\>//不生成ref文件夹中的引用dll

\<Deterministic\>false\</Deterministic\>//确定性编译开关，关闭后可以使用自动版本号(即直接在prosperity项目属性设置的package中使用\*)（assemblyInfo文件在net5.0文件夹中）

## App domain

<https://stackoverflow.com/questions/3623358/two-types-not-equal-that-should-be>

如果类所在两个app domain不一样，那么可能会出现理论上相等的两个type却无法equal的情况。比如You likely have two copies of the DLL containing that type - one loaded by the main program and one loaded by one of the Assembly.Load\*(...) methods，一个是主程序本身加载的类，还有一个是被Assembly.load方法加载dll得来的类，这时会发现它们的类类型实际上却不相等。

Try displaying / comparing the properties:

a.Assembly.Equals(b.Assembly)

and

a.Assembly.Location.Equals(b.Assembly.Location) 