
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

#### Cannot access a disposed context instance. A common cause of this error is disposing a context instance that was resolved from dependency injection and then later trying to use the same context instance elsewhere in your application.'
Repository中的DbContext不可以`using`，直接交由ABP框架管理生命周期。
```cs
await using var context = await _repository.GetDbContextAsync(); //导致错误
//直接使用
var context = await _repository.GetDbContextAsync();

```

而且Repository依赖UnitOfWork：
对于不是ApplicationService等默认开启了UnitOfWork的，需要手动增加UnitOfWork标签。比如在EventHandler中。注意要使用virtual才会生效。
```cs
[UnitOfWork]
public virtual async Task HandleEventAsync(MyEto eventData)

//还有手动的方式
using (var uow = _unitOfWorkManager.Begin()
{
    var client = await clientCredentialRepository.SingleOrDefaultAsync(x => x.ClientId == client_id);
    await uow.CompleteAsync();
}
```

### Repository中的基类属性为null没有注册
只能通过Abp Module进行注册，不能简单地绕过它的module使用AddAssembly方法进行自动注册，否则会带来很多蜜汁问题。

### 注册问题
没有引用合适的Module
```
The requested service 'Volo.Abp.DependencyInjection.ObjectAccessor`1[[Microsoft.AspNetCore.Builder.IApplicationBuilder, Microsoft.AspNetCore.Http.Abstractions, Version=7.0.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60]]' has not been registered
```
