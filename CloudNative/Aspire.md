# Aspire

## 问题排查

### 启动出现Requesting HTTP version 2.0 

一般是由于电脑使用了环境变量 `HTTP_PROXY` 以及 `HTTPS_PROXY` 导致的，`.NET HTTP Client`会使用此环境变量作为代理。Alternatively, set NO_PROXY="localhost,127.0.0.1" in environment. Restart the app.

> 清除环境变量后需要重启IDE生效

```log
fail: Aspire.Hosting.Dashboard.ServiceClient.DashboardClient[0]
      Error #6 watching resources.
      Grpc.Core.RpcException: Status(StatusCode="Internal", Detail="Error starting gRPC call. HttpRequestException: Requesting HTTP version 2.0 with version policy RequestVersionExact while unable to establish HTTP/2 connection.", DebugException="System.Net.Http.HttpRequestException: Requesting HTTP version 2.0 with version policy RequestVersionExact while unable to establish HTTP/2 connection.")
       ---> System.Net.Http.HttpRequestException: Requesting HTTP version 2.0 with version policy RequestVersionExact while unable to establish HTTP/2 connection.
         at System.Net.Http.HttpConnectionPool.ThrowGetVersionException(HttpRequestMessage request, Int32 desiredVersion, Exception inner)
         at System.Net.Http.HttpConnectionPool.SendWithVersionDetectionAndRetryAsync(HttpRequestMessage request, Boolean async, Boolean doRequestAuth, CancellationToken cancellationToken)
         at System.Net.Http.DiagnosticsHandler.SendAsyncCore(HttpRequestMessage request, Boolean async, CancellationToken cancellationToken)
         at System.Net.Http.RedirectHandler.SendAsync(HttpRequestMessage request, Boolean async, CancellationToken cancellationToken)
         at Grpc.Net.Client.Balancer.Internal.BalancerHttpHandler.SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
         at Grpc.Net.Client.Internal.GrpcCall`2.RunCall(HttpRequestMessage request, Nullable`1 timeout)
         --- End of inner exception stack trace ---
         at Grpc.Net.Client.Internal.GrpcCall`2.GetResponseHeadersCoreAsync()
         at Grpc.Net.Client.Internal.Retry.RetryCallBase`2.GetResponseHeadersCoreAsync()
         at Aspire.Dashboard.ServiceClient.DashboardClient.IsUnimplemented(AsyncDuplexStreamingCall`2 call) in /_/src/Aspire.Dashboard/ServiceClient/DashboardClient.cs:line 511
         at Aspire.Dashboard.ServiceClient.DashboardClient.WatchInteractionsAsync(RetryContext retryContext, CancellationToken cancellationToken) in /_/src/Aspire.Dashboard/ServiceClient/DashboardClient.cs:line 437
         at Aspire.Dashboard.ServiceClient.DashboardClient.WatchWithRecoveryAsync(Func`3 action, CancellationToken cancellationToken) in /_/src/Aspire.Dashboard/ServiceClient/DashboardClient.cs:line 321
```



### dapr服务间调用失败，使用的APIPA Address(169.254.*)

```
"failed to invoke, id: dev-service-system-api, err: failed to invoke target dev-service-system-api after 3 retries. Error: rpc error: code = Unavailable desc = connection error: desc = "transport: Error while dialing: dial tcp 169.254.94.247:49445: connectex: A socket operation was attempted to an unreachable network.""
```

`dapr version: 1.16.1` `aspire: 9.1`

期间使用了 `consul` 替代，发现可以解决这个问题：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: config
spec:
  nameResolution:
    component: "consul"
    configuration:
      client:
        address: "127.0.0.1:8500"
      selfRegister: false
      checks:
        - name: "Dapr Health Status"
          checkID: "daprHealth:${APP_ID}"
          interval: "15s"
          http: "http://${HOST_ADDRESS}:${DAPR_HTTP_PORT}/v1.0/healthz"
      tags:
        - "dapr"
        - "fips"
      meta:
        DAPR_METRICS_PORT: "${DAPR_METRICS_PORT}"
        DAPR_PROFILE_PORT: "${DAPR_PROFILE_PORT}"
      daprPortMetaKey: "DAPR_PORT"
      queryOptions:
        useCache: true
```

注意一定要使用 `${HOST_ADDRESS}`，否则又使用了 `169.254.*`的ip。
但是 `consul` 的坏处是注册销毁后注册信息没有清空，导致多个实例，后续dapr起来时会随机使用一个内部的ip和端口。

后来通过升级`aspire`以及其 `dapr` 相关包，切换回默认模式后正常
