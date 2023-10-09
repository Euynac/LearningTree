
# 简介
ABP 是 ASP.NET Boilerplate的全称，意味着它是一种代码层面的最佳实践的框架：
1. 实现DDD的领域设计概念，以经典分层结构实现。
2. 模块化设计。(Modular)
3. 实现了诸多的基础设施层，提供了开箱即用的模板机制。
4. 也提供前端的解决方案。
5. 支持多租户架构（Multi-Tenancy）
6. 支持微服务架构。

[[Abp vNext 源码分析] - 文章目录 - MyZony - 博客园 (cnblogs.com)](https://www.cnblogs.com/myzony/p/10722506.html)


# 数据库

### Unit Of Work
[Getting Started AspNetCore Application | Documentation Center | ABP.IO](https://docs.abp.io/en/abp/latest/Getting-Started-AspNetCore-Application)


# 错误排查

### Repository中的基类属性为null没有注册
只能通过Abp Module进行注册，不能简单地绕过它的module使用AddAssembly方法进行自动注册，否则会带来很多蜜汁问题。

### 注册问题
没有引用合适的Module
```
The requested service 'Volo.Abp.DependencyInjection.ObjectAccessor`1[[Microsoft.AspNetCore.Builder.IApplicationBuilder, Microsoft.AspNetCore.Http.Abstractions, Version=7.0.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60]]' has not been registered
```
