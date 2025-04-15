# 概念

模块化的基础设施库，以`ASP.NET Core`为基础，尽量解耦基础设施间的依赖，无需引入繁重的框架

MoModule作为库的核心注册机制
每个Library有自己的MoModule，该Module中含有依赖注入的方式以及配置ASP.NET Core中间件等具体实现，并包含Option的设置

使用原生的方式注册Module，每个Module的方式都一样：
```cs
services.AddMoModuleAuthorization(Action<ModuleOptionAuthorization> option)
```

其中注册方法返回值为ModuleGuide，用于指引用户进一步配置模块相关功能
```cs
public class ModuleGuideAuthorization
{
    public void AddPermissionBit<TEnum>(string claimTypeDefinition) where TEnum : struct, Enum
    {
        MoModule.ConfigureExtraServices<ModuleAuthorization>(services =>
        {
            var checker = new PermissionBitChecker<TEnum>(claimTypeDefinition);
            PermissionBitCheckerManager.AddChecker(checker);
            services.AddSingleton<IPermissionBitChecker<TEnum>, PermissionBitChecker<TEnum>>(_ => checker);
        });
    }
}
```



# 设计

实现MoDomainTypeFinder用于获取当前应用程序相关程序集及搜索，可设置业务程序集。
用于Core扫描相关程序集所有类型进行自动注册、项目单元发现等，提高整个框架的性能。

整个Services注册仅扫描一次业务程序集

```cs
AddService()
{
    Module.Register<TModule>(Action(option=>option));
}
```