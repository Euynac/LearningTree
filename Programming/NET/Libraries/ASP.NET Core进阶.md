# ASP.NET Core 进阶

在 ASP.NET Core 中，`ApplicationPartManager` 的核心作用是通过 ​**​Features（特性）​**​ 实现应用程序资源的动态发现和加载。这些 Feature 是用于组织应用程序元数据的​**​逻辑分组​**​，它们由 `ApplicationPartManager` 自动生成，开发者可以通过其 API 访问这些元数据。

### Features 的核心作用

1. ​**​运行时发现资源​**​  
    动态扫描 `ApplicationPart`（程序集、项目等）中的 MVC 相关组件（如控制器、视图组件、Tag Helpers）。
2. ​**​支持插件式架构​**​  
    允许动态加载外部程序集并集成其 MVC 组件。
3. ​**​优化启动性能​**​  
    避免在每次请求时反射扫描程序集，而是在启动时一次性缓存元数据。

---

### 常见的 Features 类型及其作用

以下是 `ApplicationPartManager` 管理的核心 Features：

| 特性类型 (Feature)             | 包含内容                            | 作用                                                    |
| -------------------------- | ------------------------------- | ----------------------------------------------------- |
| `ControllerFeature`        | 所有控制器的 `Type` 信息                | 注册控制器到路由系统，使框架识别请求的 Controller 类。                     |
| `TagHelperFeature`         | 所有 Tag Helpers 的 `Type` 信息      | 使 Razor 视图能识别和使用自定义 Tag Helpers（如 `<my-custom-tag>`）。 |
| `ViewComponentFeature`     | 所有视图组件（View Components）的 `Type` | 允许在视图中通过 `@await Component.InvokeAsync(...)` 调用组件。    |


---

### 工作机制

1. ​**​填充 Feature​**​  
    通过 `ApplicationPartManager.PopulateFeature<TFeature>()` 方法获取特定类型的 Feature 数据：
    
    ```cs
    var controllerFeature = new ControllerFeature();
    applicationPartManager.PopulateFeature(controllerFeature);
    // controllerFeature.Controllers 包含所有控制器类型
    ```
    
2. ​**​与 MVC 集成​**​  
    MVC 框架在启动时自动使用 `ApplicationPartManager` 发现并注册控制器、Tag Helpers 等组件：
    
    ```cs
    services.AddControllersWithViews()
        .ConfigureApplicationPartManager(apm =>
        {
            apm.ApplicationParts.Add(new AssemblyPart(pluginAssembly)); // 添加外部程序集
            apm.FeatureProviders.Add(new CustomFeatureProvider());       // 自定义发现逻辑
        });
    ```