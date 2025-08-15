# Actor

`Actor`的`method`是异步的，所以接口必须以`Task`或`Task<…>`为返回值。

## 状态管理

`Actor` 使用`Dapr runtime`在`component`配置的`statestore.yaml`中间件作为状态存储。

需要`actorStateStore`值设置为`true`。

```yaml
- name: actorStateStore
  value: "true"
```

`.NET SDK` `actor`中使用

`this.StateManager.SetStateAsync("StateKey(state name)",stateObj);`

去设置当前`actor`需要保存的状态，即使`actor host`挂了、`Dapr runtime`挂了，在下次启动，拿到同一个`actor`时也仍能还原回保存的状态。

如`Redis`作为`state service`，

其`key`格式为

`<App ID>||<Actor type>||<Actor id>||<state key>`

每次调用`actor`的`method`后，实际上`actor host`会隐式的调用当前`actor`的`this.StateManager.SaveStateAsync();` 去检查当前`actor`状态是否进行了变更，进而进行保存。

## 使用方式

```cs
var actor = new ActorId(guid);
//强类型模式，目前使用的是DataContract，很多地方不太好用
var proxy = ActorProxy.Create<IFlightActor>(actor, nameof(FlightActor));
return await proxy.AlterFlight(alterEvent.AlterItem);
//推荐使用json动态代理模式
var dynamicProxy = ActorProxy.Create(actor, nameof(FlightActor));
var data = await dynamicProxy.InvokeMethodAsync<FlightAlterItem, bool>(nameof(FlightActor.ReceiveAlterItem),alterEvent.AlterItem);
return data;
```

## 序列化

使用`[IgnoreDataMember]`忽略格式化？

`Strongly Type`的是使用`DataContract`

可采用`Weakly Type`，是使用`System.Text.Json`格式化。

`Actors uses DataContract serializer (XML) for "remoting" method invocation (the choice of DCS is not configurable).`

`Actors uses System.Text.Json (JSON) for "non-remoting" method invocation (neither the choice of S.T.J nor the options passed to it are configurable).`

`non-remoting`其实就是指的动态代理的`non-strong type`写法，而`remoting`则是用`strong type`。

`Actors uses System.Text.Json (JSON) for state storage (the serializer and options have a replaceable abstraction).`

[相关议题](https://github.com/dapr/dotnet-sdk/issues/476)

## 跨命名空间

目前的`Actor`并没有跨命名空间调用的能力，它的注册方式默认是通过`Actor`所处类型名注册的，比如`FlightActor`类，就会注册为`FlightActor`，这里的是没有带命名空间前缀的注册，因此也是作用于全局。

虽然作用于全局，但处于`K8S`不同命名空间下也不能访问到`ActorHost`。
[Unhandled exception. Dapr.DaprApiException: error invoke actor method: failed to invoke target 10.39.1.36:50002 after 3 retries · Issue #5090 · dapr/dapr (github.com)](https://github.com/dapr/dapr/issues/5090)

### 命名空间Actor

> 现在1.14支持跨命名空间的`Actor`了

Each namespaced actor deployment **must** use its own separate state store.