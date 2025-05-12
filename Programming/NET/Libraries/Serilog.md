



## 问题排查

### Serilog死锁 写大日志会出现该问题
[Console logging sometimes causes application to hang · Issue #84 · serilog/serilog-sinks-console](https://github.com/serilog/serilog-sinks-console/issues/84)

### 二次构建写不出日志

两次建立需要手动关闭Serilog的Sink，否则如文件形式的将会被占用导致无日志输出。

```cs
    internal static void RegisterSharedLog(WebApplicationBuilder builder, UnifiedServiceConfig config, bool isFirstCreate = false)
    {
        var logBuilder = new LoggerConfiguration()
            .ReadFrom.Configuration(builder.Configuration);
        if (!isFirstCreate)
        {
            Log.CloseAndFlush(); //巨坑：两次建立需要手动关闭Serilog的Sink，否则如文件形式的将会被占用导致无日志输出。
        }

#if DEBUG
        Log.Logger = CreateLogger(config, logBuilder, true, isFirstCreate);
#else
            Log.Logger = CreateLogger(config, logBuilder, false, isFirstCreate);
#endif
    }
```