# Visual Studio

## 文件编码与代码规范

文件编码可以在这里检查：
![](../attachments/Pasted%20image%2020230802171032.png)
![](../attachments/Pasted%20image%2020230802171059.png)

如果没发现这个选项，需要进行自定义：
![](../attachments/Pasted%20image%2020230802174653.png)

`VS2022` 之后，可以设置编辑器的默认 `encoding`。在 `Solution` 或 `Project` 下添加 `.editorconfig` 文件
![](../attachments/Pasted%20image%2020230802171236.png)
然后在其中添加
```editorconfig
[*]
charset = utf-8
```

添加后，后续增加的新文件应都是 `UTF-8` 格式的了。

`.editorconfig` 文件还可以定义代码规范，和 `ReSharper` 的规范共存：
![](../attachments/Pasted%20image%2020230802175133.png)

## 离线下载

### 教程
[Create an offline installation - Visual Studio (Windows) | Microsoft Learn](https://learn.microsoft.com/en-us/visualstudio/install/create-an-offline-installation-of-visual-studio?view=vs-2022)

### 下载 bootstrapper vs_enterprise.exe
[Create a network-based installation - Visual Studio (Windows) | Microsoft Learn](https://learn.microsoft.com/en-us/visualstudio/install/create-a-network-installation-of-visual-studio?view=vs-2022#download-the-visual-studio-bootstrapper-to-create-the-layout)

```shell
# 使用 bootstrapper 进行运行命令 create local layout
vs_enterprise.exe --layout D:\VS2022\vslayout --add Microsoft.VisualStudio.Workload.ManagedDesktop --add Microsoft.VisualStudio.Workload.NetWeb --add Microsoft.VisualStudio.Component.Git --includeRecommended --lang en-US zh-CN

# 更新 layout 到最新版本
vs_enterprise.exe --layout D:\VS2022\vslayout

# --lang 在安装时无效
# --fix 可以检验 vslayout 是否有包是损坏的

# 到内网机器下，一定要使用同一条命令安装，而且启动 bootstrapper 换成了 vslayout 里面的
D:\VS2022\vslayout\vs_enterprise.exe --noweb --add Microsoft.VisualStudio.Workload.ManagedDesktop --add Microsoft.VisualStudio.Workload.NetWeb --add Microsoft.VisualStudio.Component.Git --includeRecommended
# 指定路径安装：--installPath d:\VS2021
```

## CLI

`Windows` 下设置 `dotnet cli` 工具语言为英文：`set DOTNET_CLI_UI_LANGUAGE=en`

`Linux` 下设置系统语言为英文即可同步变为英文：`export LANG=en_US.UTF-8`

## 插件推荐

`Dracula official` 主题

`Clean Bin and Obj` 快速清理 `obj` 和 `bin` 文件夹，以解决改变项目名带来的多项目间依赖缓存问题。不过这个插件清空解决方案不好使，可以单独对项目清理。
[Clean Bin and Obj - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=dobrynin.cleanbinandobj&ssr=false#overview)

`Debug Single Thread` 多线程时单线程调试

`Multiline Search and Replace` 多行替换、搜索

[File Path On Footer - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=ShemeerNS.FilePathOnFooter)
可以在打开的文件下面显示文件所在地址，快速打开相关文件夹等

### Folder To Solution Folder
直接添加物理文件夹成为相应的 `Solution Folder`，不用再一个一个对比。

### SwitchStartupProject

能够保存不同的 `Startup Project` 的设置。
[SwitchStartupProject for VS 2022 - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=vs-publisher-141975.SwitchStartupProjectForVS2022)

### Better Comments VS2022

将指定格式的注释不同颜色高亮

### Encoding normalize tool
专门解决 `GB2312` 等中文编码问题，提供项目级自动检测不一致编码转换。

#### 通过系统设置启用全局 UTF-8 支持

1. **打开系统设置**：
    - 按 `Win + S` 搜索 **"区域设置"** → 选择 **"区域管理设置"**（或直接打开 **控制面板 > 时钟和区域 > 区域**）。
2. **启用 UTF-8 Beta 功能**：
    - 在区域设置界面，点击 **"管理"** 选项卡 → **"更改系统区域设置"**。
    - 勾选 **"Beta版: 使用 Unicode UTF-8 提供全球语言支持"** → 点击 **确定** → 重启电脑。
    - ⚠️ 注意：此设置可能导致部分老旧程序显示乱码，若出现问题可取消勾选。

### Visual Commander

`Visual Commander` 可以用 `C#` 编码设定强大的功能（类似于 `Word`、`PPT` 的宏）
[Visual Commander](https://vlasovstudio.com/visual-commander/)

复制当前行的行数及方法名到剪切板：
```csharp
EnvDTE.TextSelection ts = DTE.ActiveWindow.Selection as EnvDTE.TextSelection;

if (ts == null)
  return;

EnvDTE.CodeFunction func = ts.ActivePoint.CodeElement[vsCMElement.vsCMElementFunction]
            as EnvDTE.CodeFunction;

if (func == null)
  return;

string result = DTE.ActiveWindow.Document.FullName + System.Environment.NewLine +
  "Line " + ts.CurrentLine + System.Environment.NewLine +
  func.FullName;

System.Windows.Clipboard.SetText(result);
```

## Stack Trace Explorer（堆栈信息高亮）

[Stack Trace Explorer 2022 - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=SamirBoulema.StackTraceExplorer2022)

可以将粘贴进的 `Stack Trace` 高亮并启动路由功能
其实来源于 `ReSharper`，默认快捷键为 `Ctrl+E,T`
当前插件的快捷键去这里看 `View - Other Windows - Stack Trace Explorer`

实测不如 `ReSharper` 的。

## 注释高亮

以 `BUG` 开头的注释会高亮

另外还可以安装 `Better Comments` 插件

## 语法高亮

如果语法高亮出现问题，方法等仍然是白色的，可以尝试：
This happens when you set `Color Theme: Use system setting`
Set `Color Theme: Dark` - or `Color Theme: Blue`

### 正则

三种方式让正则表达式高亮
```csharp
// language=regex

var str = @"[A-Z]\d+";

MyMethod(/* language=regex */ @"[A-Z]\d+");
```

不过目前不支持 `$"{}"`，只能是纯 `string`

`.NET 7` 新增方法上的正则高亮支持

[Regular expression improvements in .NET 7 - .NET Blog](https://devblogs.microsoft.com/dotnet/regular-expression-improvements-in-dotnet-7)

```csharp
void MyMethod([StringSyntax(StringSyntaxAttribute.Regex)] string regex);
```

## Enable and disable package restore in Visual Studio

[NuGet Package Restore | Microsoft Learn](https://learn.microsoft.com/en-us/nuget/consume-packages/package-restore#enable-and-disable-package-restore-in-visual-studio)

## Code Intelligence

[Visual Studio keyboard shortcut to display IntelliSense - Stack Overflow](https://stackoverflow.com/questions/3640544/visual-studio-keyboard-shortcut-to-display-intellisense)

## StackTrace

When you instantiate the `StackTrace`, use the following:

`StackTrace callStack = new StackTrace(1, true);`

The "true" parameter is telling it to include such things as `LineNumbers`, etc.

`PDB` can be generated for `Release` as well as for `Debug`.

`Project → Properties → Build → Advanced → Debug Info`

## Multiple startup project

In `Solution Explorer`, select the solution (the top node).

Choose the solution node's context (right-click) menu and then choose `Properties`. The `Solution Property Pages` dialog box appears.

![Graphical user interface, table Description automatically generated](../attachments/0b5138a97665abbeb9547d2e24e0c722.png)

`Solution Property Pages`

Expand the `Common Properties` node, and choose `Startup Project`.

Choose the `Multiple Startup Projects` option and set the appropriate actions.

## 反编译

`ILSpy`

针对 `VS` 自带反编译方案的不足，这里推荐使用 `ILSpy`，通过 `VS` 扩展市场 [Extensions for Visual Studio family of products | Visual Studio Marketplace](https://marketplace.visualstudio.com/vs) 离线下载，安装成功后在 `VS` `工具->ILSpy` 打开，然后通过菜单栏定位到要查看的程序集，打开后可查看程序集的结构，命名空间，类等所有对象的定义与源码

如果想阻止别人反编译你的源码，可为你的程序集加上 `SuppresslIdasmAttribute` 属性

# 项目配置

## 解决方案统一配置项目

`project` 的 `xml` 中可以使用 `Import` 方式导入一个统一的 `xml` 文件：

`common.xml`:
```xml
<Project xmlns="http://schemas.microsoft.com/developer/msbuild/2003">
	<PropertyGroup>
		<TargetFramework>net7.0</TargetFramework>
		<SatelliteResourceLanguages>en;zh-Hans</SatelliteResourceLanguages>
	</PropertyGroup>
</Project>
```

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

	<Import Project="..\..\..\..\common.xml"></Import>
    <PropertyGroup>
        
        <Nullable>enable</Nullable>
        <ImplicitUsings>enable</ImplicitUsings>
        <UserSecretsId>575a2d7c-be72-40ea-bf82-2ece95e5ad68</UserSecretsId>
        <DockerDefaultTargetOS>Linux</DockerDefaultTargetOS>
        <DockerfileContext>..\..\..\..</DockerfileContext>
        <DockerComposeProjectPath>..\..\..\..\docker-compose.dcproj</DockerComposeProjectPath>
        <GenerateDocumentationFile>true</GenerateDocumentationFile>
        <NoWarn>1591</NoWarn>
    </PropertyGroup>
```

## ASP.NET Core 项目编译下的多语言文件夹

通过 `SatelliteResourceLanguages` 可以指定需要的。不指定会全部都有。。。
```xml
<SatelliteResourceLanguages>en;zh-Hans</SatelliteResourceLanguages>
```

## CopyToOutputDirectory 但复制到特定目录下

使用 `<Link>` 可以实现复制到特定输出目录
```xml
<ItemGroup>
	<Content Include="config.json">
		<Link>Config\config.json</Link>
		<CopyToOutputDirectory>Always</CopyToOutputDirectory>
	</Content>
</ItemGroup>
```

## 项目修改后没有自动构建
在 `Visual Studio 2022` 里，调试时若项目有更改却未自动构建，可按下面的步骤来解决：

### 1. 检查"选项"设置
确保 `Visual Studio` 已开启自动构建功能。具体步骤如下：
- 点击菜单栏中的"工具"，接着选择"选项"。
- 在"选项"对话框里，展开"项目和解决方案"，然后选择"生成并运行"。
- 在"运行时，若项目过期"选项中，要保证选中"始终构建"或者"提示构建"。

### 2. 检查项目配置
要保证项目配置无误，具体步骤如下：
- 点击菜单栏中的"生成"，然后选择"配置管理器"。
- 确保"活动解决方案配置"设为"调试"，"活动解决方案平台"设为适合你项目的平台（例如 `x86` 或者 `x64`）。
- 检查每个项目的"生成"列是否被勾选。

# 发布

容器发布

```xml
<?xml version="1.0" encoding="utf-8"?>
<!--
https://go.microsoft.com/fwlink/?LinkID=208121.
-->
<Project>
  <PropertyGroup>
    <WebPublishMethod>Container</WebPublishMethod>
    <ContainerPublishMethod>NetSdk</ContainerPublishMethod>
    <ContainerRepository>username/test</ContainerRepository>
    <RegistryUrl>index.docker.io</RegistryUrl>
    <UserName>9kit</UserName>
    <PublishImageTag>latest</PublishImageTag>
    <PublishProvider>ContainerRegistry</PublishProvider>
    <LastUsedBuildConfiguration>Release</LastUsedBuildConfiguration>
    <LastUsedPlatform>Any CPU</LastUsedPlatform>
    <RuntimeIdentifier>linux-x64</RuntimeIdentifier>
    <ProjectGuid>9f221ded-210c-4907-be8a-7d0d489f9f70</ProjectGuid>
    <_IsDockerfilePresent>true</_IsDockerfilePresent>
    <_TargetId>NetSdkDockerContainerRegistry</_TargetId>
  </PropertyGroup>
</Project>
```

如果发布失败或没反应，直接拷出 `output` 中的命令自己执行看看报错

# 模板

## 项目模板

[dotnet new uninstall - .NET CLI | Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-new-uninstall)

显示拥有的项目模板：
`dotnet new uninstall` 
它也顺便告诉你如何卸载拥有的项目模板。
还有使用插件形式安装的是在 `Extensions` 中进行卸载，需要以管理员权限启动 `VS`
![](../attachments/Pasted%20image%2020231113101056.png)

创建和导入：
[Create multi-project templates - Visual Studio (Windows) | Microsoft Learn](https://learn.microsoft.com/en-us/visualstudio/ide/how-to-create-multi-project-templates?view=vs-2022)

导入自定义的模板目前要手动找到相应目录，并拷贝 `.zip` 进去。
目录默认在（设置的文档目录）：
`D:\Documents\Visual Studio 2022\Templates\ProjectTemplates`
但也可能读取的是：
`C:\Users\<Name>\Documents\Visual Studio 2022\Templates\ProjectTemplates`
具体可以自己生成一个，勾上自动导入，然后通过 `everything` 等工具找到实际目录。

模板 `xml` 文件的属性：[Visual Studio Template Schema Reference - Visual Studio (Windows) | Microsoft Learn](https://learn.microsoft.com/en-us/visualstudio/extensibility/visual-studio-template-schema-reference?view=vs-2022)

> 有个 `bug`，用 `windows` 自带的 `zip` 压缩的文件 `VS` 无法识别。

# 调试

## 设置

`Ctrl+ALT+E` 打开 `Exception Setting`，这里设置 `Debug` 时是否捕捉异常并停止提示。

比如一些异步的方法、`Task` 中引发的异常，默认是不捕获异常的，需要将 `Common Language Runtime Exception` 勾上。

**多进程调试**

In `Visual Studio` you can set multiple startup projects to run/debug two projects at once:

Right click on the solution in the `Solution Explorer` and select `Properties`.

Under `Common Properties\Startup Project` select `Multiple startup projects` and set the `Action` to be `Start` for the two projects that you want to debug.

解决方案属性 -> 多个启动项目

![电脑萤幕的截图 描述已自动生成](../attachments/e65d34b03eae060ab5c231e2780469d1.png)

## 断点

行号上 `Ctrl+Mouse Left Click` 可以快速插入临时断点。 

## 即时调试（Debug.Immediate）

- 即时调试窗口：命中断点后 `Ctrl+ALT+I`

    可输入参数，实例化对象，常量，也可执行方法或函数

    ![电子设备的屏幕 描述已自动生成](../attachments/1bffabf753c0392c3520a8248c0ce74a.gif)

- 特殊参数
    - `$retrunValue`：方法返回值
    - `$exception`：未捕获的异常

        ![电脑萤幕画面 描述已自动生成](../attachments/3d9d66c3d38b5e5891805466c6bf4816.gif)

## 多线程调试

安装 `Debug Single Thread` 插件仅调试单个线程。

- 三个调试操作窗口
    - 线程 `[Ctrl+Shift+H]`
    - 并行堆栈
    - 并行监视 `[Ctrl+Shift+D]`
- 三种操作方法
    - 标记
        标记线程后，在并行监视窗口中显示标记线程，其他线程如果无断点则不会跳进

    - 冻结
        冻结线程后停止工作，此方法不适用于有多线程同步操作的

    - 添加断点
        - 条件表达式：参数
        - 筛选器：线程名称或者线程 `Id`

            ![截图里有图片 描述已自动生成](../attachments/6fab81425b78a47bfbcfff7aa846bf09.png)

## 远程测试调试

测试 -> 测试资源管理器

- `Docker Desktop`：基于 `WSL/WSL2`
    - `Windows`
    - `Linux`
- `WSL/WSL2`
    - `Ubuntu`
    - 其他 `Linux` 发行版
- `SSH`
- 远程 `Windows`
- 远程 `Linux`

    ![图形用户界面, 文本, 应用程序 描述已自动生成](../attachments/806b136d6916f36720ab524d59906f68.png)

## 调试外部 dll

[Presentation options for compiled code | ReSharper Documentation](https://www.jetbrains.com/help/resharper/Code_Presentation_Options.html)
[Debug modules that have no debug information (PDB) | ReSharper Documentation](https://www.jetbrains.com/help/resharper/Debugging_Without_Source_Code.html)

- In the debug mode, open the `Visual Studio's Modules` window (`Debug | Windows | Modules`), select one of several modules, right-click the selection, and choose `Load Symbols with ReSharper Decompiler`.

关闭勾选 `Just My Code`。加载所有 `dll` 之后，打断点会提示代码对不上。这时设置断点可以调试对不上的代码。

### 拥有 pdb 文件时
可使用原生 `Visual Studio` 加载符号，但需要手动创建一个目录，使用 `everything` 复制所有 `pdb` 文件（一般就在 `nuget` 目录下）到该文件夹，在 `Options->Debugging->Symbols->Symbol file locations` 中添加该目录

## 调试打印类信息

默认情况下，如果有重写 `ToString()`，则使用该方法在 `Debugger` 中显示。
还可以通过 `[DebuggerDisplay]` 进行配置
[Display custom info using DebuggerDisplay - Visual Studio (Windows) | Microsoft Learn](https://learn.microsoft.com/en-us/visualstudio/debugger/using-the-debuggerdisplay-attribute?view=vs-2022)

## 应用程序处于中断模式（The application is in break mode）
下了断点在自己代码里但发现中断模式，在通过 `dapr` 插件启动微服务调试时遇到，这种情况可能是那个无法命中断点的程序的 `dll` 较旧，需要重新 `build` 一下。

## 调试 Generator 或 EFCore 等非常规程序入口点
call `Debugger.Launch()` in your code. The just-in-time debugger should prompt you to attach a debugger when it hits that line.
`Debugger.Break()` 也可以尝试

# 快捷操作

所有快捷键均可在工具 -> 选项 -> 键盘中自定义

注意，它还区分优先级，即，`Global` 优先级最小，其次是各个子窗口。如果子窗口有相应的设置，则 `Global` 的可能导致无效，注意检查。

代码窗口是 `Text Editor` 而不是 `C# Editor`

## 个人定义

`Alt + C` `Collapse all`（在 `Solution Explore` 界面）

![Title: fig:](../attachments/bae11f3d5036aabc8e6911587026bfff.png)
`SoulutionExplorer.SyncWithActiveDocument`
默认快捷键 `Ctrl+[,S`（个人建议改成 `Ctrl+W，Ctrl+W`，表示 `Where`）

### Resharper 相关

`Ctrl + R , C` `Change Signatrue` (`TextEditor`)

`Ctrl + Arrow Down` `ReSharper_GotoPrevMember` (`TextEditor`)

## 代码操作

`Ctrl+F12` `Go to Implementation`（转到接口实现）。

## 切换

`Ctrl+Tab` 快速在已打开的文件中切换

## W 类窗口

`Window` 类所以先按 `W`

打开错误列表 `Ctrl+W, E` (`ErrorList`)

打开解决方案窗口 `Ctrl+W, S` (`Solution`)

打开输出窗口 `Ctrl+W, O` (`Output`)

`Git Changes` 窗口建议改为 `Ctrl+W, G` (`Git`)

`Package Manage Console` 建议改为 `Ctrl+W, C` (`Console`) `View.PackageManagerConsole`

`Bookmark` 窗口 `Ctrl+W, B` (`Bookmark`)

## K 类代码

### Intelligence

列出当前可选成员 `Ctrl+K, L` (`List`)

当前快速信息（比如出现红线、蓝线等有提示，一般要用鼠标移上去的） `Ctrl+K, I` (`Info`)

### 注释

注释当前行/选中行 `Ctrl+ K, C` (`Cancel`)

取消注释 `Ctrl+K, U` (`Undo cancel`)

### 格式化

格式化当前行/选中行：`Ctrl + K, F` (`Format`)

格式化当前文档：`Ctrl + K, D` (`Document`)

### 书签

书签设置在行号上，而不是代码上。如果修改代码，书签会保留在行号上，不会随代码移动。

当前行设置/删除书签 `Ctrl+K, K`

转到下一个书签 `Ctrl + K, N` (`Next`)

## 其他

### 全文搜索

[![](../attachments/3a4da5d726a60914579c20b555b267df.png)] 默认快捷键 `Ctrl+T`(`Go To`) 可根据文件名称，类名称，方法名称全搜索

![电子设备的屏幕 描述已自动生成](../attachments/ac8a1ef40d84035bb50ed78443b77ee7.gif)

### 快速定位活动文件

[![](../attachments/36206c5edebb7bcbce3d264bab464531.png)] 默认快捷键 `Ctrl+[,S`（个人建议改成 `Ctrl+W，Ctrl+W`，表示 `Where`）如果发现会自动跟踪当前文件，去设置里面关闭 `Track Active Item in Solution Explorer`

![电脑的屏幕截图 描述已自动生成](../attachments/3f16e5f798883588e52433d2202c0017.gif)

### 多行编辑

- `Alt+鼠标拖选`
    - `Alt+Shift+方向键`

        ![文本 描述已自动生成](../attachments/8de332850a989919e180a6b5e6729632.gif)

### 多光标同时编辑

`Ctrl+Alt+鼠标点击`要编辑的位置

![文本 描述已自动生成](../attachments/0fa9cbfac79bca665079eb4f704a6dad.gif)

### 整行上下移动

`Alt+上下方向键`

![文本 描述已自动生成](../attachments/caf9cc12bacfc56d1d637869e5b3b7c9.gif)

整个方法块折叠以后也可以上下移动

### 历史粘贴

`Ctrl+Shift+V` 打开粘贴板历史内容，点击粘贴

![图形用户界面, 文本, 应用程序 描述已自动生成](../attachments/5052e72105bf683d6650d3de22438dd5.png)

## 增强配置

### 开启内联参数提示

![](https://furion.net/img/vs1.png) ![](https://furion.net/img/vs2.png)

### 开启全局智能提示

![](https://furion.net/img/vs3.png) ![](https://furion.net/img/vs4.png)

### 实时显示诊断错误

在过去，我们需要写完代码编译才能知道具体的错误，最新版的 `Visual Studio` 支持 **内联诊断错误**，开启如下：

![](https://furion.net/img/vs7.png) ![](https://furion.net/img/vs8.png)

### 中文智能提示

打开网站 [.NET IntelliSense 本地化包下载](https://dotnet.microsoft.com/zh-cn/download/intellisense) 下载对应的语言版本。

配置教程

如果配置了不能显示中文，可以查看此篇教程 [Visual Studio 2019 中文智能提示配置教程](https://blog.csdn.net/sD7O95O/article/details/103776077)

关于 `NET6+` 的中文智能提示

因为官方不再提供本地化包了，详情可查看相关 Issue [.NET 6 中文智能提示问题](https://github.com/dotnet/docs/issues/27283)

**推荐使用 `islocalizer` 工具库：[IntelliSense Localizer](https://github.com/stratosblue/IntelliSenseLocalizer) ✨✨**

![](https://furion.net/img/vs5.png) ![](https://furion.net/img/vs6.png)