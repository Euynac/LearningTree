# C# 故障排除

## 常见问题

### Assembly

`Assembly.GetCallingAssembly()`如果在lambada表达式中一定要注意了，它就不是外层的assembly了，而是这个函数来源的assembly。

比如：

```cs
services.AddMediatR(cfg=>
{
    cfg.RegisterServicesFromAssembly(callingAssembly);
});
```

这里就不能在括号内获取，而要放在外部先获取。

### System.Text.Json

#### 默认不会序列化Field

#### 某些Deserialize后变成default

因为属性必须是public set方法。或者用init，或用[JsonInclude]

<https://stackoverflow.com/a/67206063/18731746>

默认是大小写敏感的，需要设置option insensitive

.NET 7后新增JsonRequired

#### 默认不会序列化Tuple

因为它默认不会序列化field相关的，只会序列化properties。而Tuple是两个public field，所以不会序列化。

需要设置IncludeFields = true

### Struct

#### KeyValuePair

它是Struct，所以它的DefaultValue是strcut(default\<Key\>, default\<Value\>)

## 重启应用

```cs
// 为什么不用Application.Restart()呢，因为在在 .NET Framework 里，它会继承环境变量，启动多个进程，很快会内存溢出
Process.Start(Application.ExecutablePath);
Environment.Exit(0);
``` 