# ASP.NET Core

## MVC架构

##### URL结构

一般：http://host:port/controller(控制器)/action(方法)

##### Model传值方式

`ViewData`、`ViewBag`、`TempData`、`Model`传值，后台传数据到前台，前台绑定数据

##### Session 会话 与 Cookies储存在用户本地终端上的数据

`Session`是在服务端保存的一个数据结构，用来跟踪用户的状态，这个数据可以保存在集群、数据库、文件中；

`Cookie`是客户端保存用户信息的一种机制，用来记录用户的一些信息，也是实现`Session`的一种方式。用户验证这种场合一般会用`Session`

`HTTP`协议是无状态的协议，所以服务端需要记录用户的状态时，就需要用某种机制来识具体的用户，这个机制就是`Session`，标识用户并跟踪，一般放在服务器内存，使用缓存服务等。运行依赖`session_id`，然后`id`在`cookies`中，若是`cookies`禁用，`session`失效，但会使用`url`重写实现传递。`JSESSIONID`只是`tomcat`的对`sessionid`的叫法

> 现在过时，现在一般都使用`access_token`等，类似`session_id`

`ASP.NET`中是在`HttpContext`中，但已经不是标配，不能直接使用，需要进行配置：添加中间件以及服务实例


![](../../../attachments/bdae182ae9aaadcca0078c5c3b06d53d.png)

`ASP.NET Core`核心理念之一：pay-for-what-you-use 按需加载，要啥配置啥，不是原来`ASP.NET`的全家桶了。所以简约、高效。

##### Token机制

使用`Identity Server4`

![](../../../attachments/3959373c4405b4c5c8b5c8868c0f2ff8.png)

用户先通过登陆获取`token`，然后每次请求都带有`token`，请求到达`Gateway`之后会直接通过一种加密验证机制验证`token`是否有效，所以`Gateway`能够实现鉴权授权的效果。

## 控制台程序为什么变成了网站（原理）

`HTTP`协议是请求响应模型，浏览器访问端口传递数据，请求要进入到代码的话，需要有一个东西负责监听请求然后解析为`HTTPContext`，然后发给`MVC`程序。

`ASP.NET Core`里的这个东西叫做`Kestrel`，是精简高效的`HttpServer`，以包形式提供，自身无法单独运行。内部封装了对`libuv`的调用，作为I/O的底层，屏蔽各系统底层实现的差异，无需依赖`IIS`等，基于`.NET Core CLR`，是一个独立的程序了，因此做到了跨平台。

![](../../../attachments/3e8e8733a93c779fc76ae9ae67957e5e.png)

### 创建服务器的入口

![](../../../attachments/a2e479eab331baa8198eac676c06dcc8.png)

要对`Kestrel`进行配置，需要在`appsettings.json`中添加`Kestrel`节点，因为源代码中有这一操作

![](../../../attachments/4ae1eddf2b05c8f8304e1d76dbf9699d.png)

#### Startup类

是`Kestrel`服务器和`MVC`的关联配置。

`Configure`方法是配置`Http`请求的`pipeline`（管道），即`Http`请求的处理过程。即使`Configure`里面的所有中间件服务注释，仍然会成功运行，响应404，因为源码中的`ApplicatinBuilder`管道`Build`里面写了一个默认中间件404。

若只留一个：

![](../../../attachments/203f926689fdf61ffc567ca87fcfb895.png)

那么也会成功响应，且任何请求都返回Hello World！侧面证明这是从请求层面完整的响应处理。

所以`MVC`框架需要自行设计。即设计管道

![](../../../attachments/7428b44f963b9287676299420b772122.png)

### 管道模型（中间件、洋葱）

![](../../../attachments/12b37270a4895a56a909c087ff6e1d59.png)

拼接管道原理（如何洋葱般的拼接一系列的`delegate`）

![](../../../attachments/3c92b63ad6240174976af6fc0392e391.png)

![](../../../attachments/fedf7e3d0bbff1ea70bb09384d43c370.png)

## 开发

使用`VS`开发的时候，`properties`里面的`launchSetting.json`文件配置的`IISExpress`启动、作为脚本命令行的程序启动，都是为开发服务的，在正式环境上是无效的。

- 可以使用**`IIS`**等**服务器**进行托管：

项目右键进行发布然后用`IIS`指向发布的文件夹即可, 不发布无法部署，直接指向则失败，因为没有对`IIS`与`Kestrel`之间的监听转发关系做配置，即缺少了发布时自动生成的`web.config`文件（见下图）

- 可以基于控制台**自托管**（因为内置了`Kestrel`服务器）：

编译运行之后，在`Debug`下的`netcoreapp3.1`文件夹里面使用`cmd`，然后使用`dotnet xxxxx（完整程序集名称）.dll --urls=http://*:8888 --ip="127.0.0.1" --port=8888`。它就会开始监听这个端口。若是编译不是发布，网站能够访问但是里面的资源、样式等一般会无法访问因为路径不对，因为`wwwroot`文件夹内文件没有自动拷入。

若是要调整静态资源文件路径，在`Startup.cs`文件中配置`UseStaticFiles`

![](../../../attachments/673e5b07657f0163f11944a3e5f76007.png)

使用`IIS`托管的原理：

![](../../../attachments/a60c1db6a78a1d0ef3add50f71294bae.png)

### 使用Configuration

<https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/?view=aspnetcore-7.0>

`builder.Configuration`实际上是按下图优先度读取配置（越前面的优先度越高）：

![A screenshot of a computer program Description automatically generated with medium confidence](../../../attachments/dd66a8e1cc5290aee6acf3387a1e0db9.png)

![A screenshot of a computer program Description automatically generated with medium confidence](../../../attachments/af719732f655b9529c2a3cd0ff5b4452.png)

具体怎么选择看环境：

[Use multiple environments in ASP.NET Core | Microsoft Learn](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/environments?view=aspnetcore-8.0)
Secrets and passwords should not be stored for production environments in the configuration files.

Consider using services like key vault on azure or database encrypted configurations or build server variables that will override the environment specific secrets.

还可以注册配置类（这就叫`Options Pattern`了，将配置转化为强类型配置）

```csharp
builder.Services.Configure<FooSettings>(builder.Configuration);
```

[c# - What is the difference between services.Configure() and services.AddOptions\<T\>().Bind() when loading configuration in ASP.NET Core? - Stack Overflow](https://stackoverflow.com/questions/55762813/what-is-the-difference-between-services-configure-and-services-addoptionst)

具体：

[Options pattern in ASP.NET Core | Microsoft Learn](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/options?view=aspnetcore-7.0#options-validation)

在服务中就可以`IOption<FooSettings>`来获取配置了

注意，`IOption`是只读取一次的。

`IOptionSnapshot`类似于`Scope`，下一次请求会重新读取配置。（无法注册到单例生命周期服务）

`IOptionsMonitor`则会即时读取配置。

通用读环境变量：

`Environment.GetEnvironmentVariable`

可以自己再弄一个`IConfiguration`字典，配置类相关接口，使用提供或自定义的`Configuration provider`加载配置。

- `IConfiguration`: Represents a set of key/value application configuration properties.

- `IConfigurationRoot`: Represents the root of an IConfiguration hierarchy.

- `IConfigurationSection`: Represents a section of application configuration values.

工厂模式创建`ConfigurationRoot`

```csharp
IConfigurationRoot config = new ConfigurationBuilder()
.AddJsonFile("appsettings.json")
.AddEnvironmentVariables()
.Build();
```

### 使用内置IOC

抽象 实现 注册 使用

要用`IoC`最好全程都用`IoC` (Inversion of Control)

抽象是写一个接口，实现是实现这个接口。注册是在`Startup`的`ConfigureServices`里注册对接口服务的实现，然后在`controller`中依赖注入，即写一个`private readonly`接口成员，在构造函数里增加一个接口实例参数，然后赋值。

好处：

①去掉对于细节的依赖，方便拓展，减小影响范围，只需要改`startup`文件换一个接口实现实例，甚至可以转移到对配置文件的依赖，只需要修改配置文件。（解耦）

②假如没有`IoC`，一种服务如果依赖于其他的服务，比如服务D构造需要服务C，服务C构造需要服务B，服务B构造需要服务A，而且要知道全部实例细节。工程量巨大。但是`IoC`能够屏蔽细节，对象依赖注入（`DI`），要服务D就直接拿服务D，不必关心如何构造。 （屏蔽对象的实现细节）

③生命周期管理、`AOP`面向切面编程（Aspect Oriented Programming）

`ASP.NET Core`中的内置`IoC`容器是`Microsoft.Externsions.DependencyInjection`中的`ServiceCollection`，可以单独使用，但功能有一定局限性（比如只支持构造函数注入），可以换用第三方容器比如`autofac`。

三种生命周期：

- **`AddTransient`**：瞬时生命周期，每次使用都是会构造一个全新的实例。

- **`AddSingleton`**：单例，进程唯一实例（仅适用于需要单例的比如链接池、配置文件等，摒弃传统单例，即能够用`IOC`容器实现单例就不要自己写了）

- **`AddScoped`**：作用域单例，实际上是`container`对象`.CreateScope()`创建出来的一个"子容器"，所以作用域不同。同一个容器就同一个实例。不过在`ASP.NET Core`中，变成了一个请求一个实例，不同请求不同实例，因为一次请求底层构造了一个子容器实例，一次请求的意思就是一次`http`请求，第二次发同一个请求也算不同请求了。一次请求相同的情况是注册的服务用到多次的时候，注入进去的服务是同一个实例。

![](../../../attachments/fc35966aaa4228489b7f58a18df9583d.png)

#### 手动获取依赖
[Why You Shouldn't Call BuildServiceProvider in .NET Development | by Damien Vande Kerckhove | Medium](https://medium.com/@damien.vandekerckhove/why-you-shouldnt-call-buildserviceprovider-in-net-development-8e25f680d529)
单例不可提前获取

[ServiceProviderServiceExtensions.GetService\<T\>(IServiceProvider) Method (Microsoft.Extensions.DependencyInjection) | Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.dependencyinjection.serviceproviderserviceextensions.getservice?view=dotnet-plat-ext-7.0)

[c# - Resolving instances with ASP.NET Core DI from within ConfigureServices - Stack Overflow](https://stackoverflow.com/questions/32459670/resolving-instances-with-asp-net-core-di-from-within-configureservices)

![](../../../attachments/52aaeffa8b35a671feeb2d02d37675c3.png)

#### 使用第三方IOC容器（例 Autofac）

在`ASP.NET Core`的`Program`入口中的`CreateHostBuilder`中使用`UseServiceProviderFactory`替换`IOC`容器，然后`Startup`中的`ConfigureService`可以不再使用，而是另外写一个新的，比如`autofac`容器就可以写：`ConfigureContainer(ContainerBuilder xxx)`。

##### 注册服务并创建容器

通过创建 `ContainerBuilder` 来注册组件(类)并且告诉容器哪些组件暴露了哪些服务（接口）。

```csharp
//在委托注册中使用 As<T>()，会明确哪个接口服务使用了哪个注册，并成为了LimitType（只能用As过的服务）。另外其实autofac自动会推断注册的服务支持哪些，As就会限制死（？未验证）
builder.RegisterType<ConsoleLogger>().AsSelf().As<ILogger>().As<IXXXX>;//通过类型注册一个或多个服务，AsSelf是暴露自身的服务（即自身）
builder.RegisterType(typeof(ConfigReader));//是使用依赖注入来构建这个类（比如这个类构造函数有接口用于注入，autofac会去查找容器内注册过的服务用于生成这个ConfigReader）
//组件生命周期
builder.RegisterType<XXX>().InstancePerDependency();//这是默认选项，每次需要服务都会返回一个新实例
builder.RegisterType<XXX>().SingleInstance();//单例（组件将会一直存在）
builder.RegisterType<XXX>().InstancePerLifetimeScope();//在特定的 ILifetimeScope 中请求服务，只返回一个实例
builder.RegisterType<XXX>().InstancePerMatchingLifetimeScope("x");//叫做x的Scope都是同一个实例（就像给子容器命名，同名的都是同一个实例）
//通过实例注册ITextwriter服务
var output = new StringWriter();
builder.RegisterInstance(output).As<ITextWriter>();
//通过Lambda表达式注册，在 Resolve() 调用性能提升10倍
builder.Register(c => new UserSession(DateTime.Now.AddMinutes(25)));//（这是构造函数参数注入）
//如果不止一个组件暴露了相同的服务, Autofac将使用最后注册的组件作为服务的提供方,除非使用PreserveExistingDefaults()
builder.RegisterType<ConsoleLogger>().As<ILogger>();
builder.RegisterType<FileLogger>().As<ILogger>().PreserveExistingDefaults();
```

`IOC`容器最好是单例的。

组件的生命周期与注册时定义有关，一般与容器的生命周期挂钩。为了充分利用自动的明确性释放, 你的组件必须实现 `IDisposable`. 你可以按需注册你的组件然后在组件解析的生命周期的结尾, 组件的 `Dispose()` 方法将会被调用。如果不想让`autofac`控制组件的自动释放行为，注册服务时使用`ExternallyOwned()`，即可以被外部所有者拥有的方式注册组件，它何时释放取决于你

##### 解析服务

在注册完组件并暴露相应的服务后，你可以从创建的`IOC`单例容器或其子生命周期中解析服务（`Resolve()`方法）。

```csharp
//通过创建子容器（从生命周期中）解析服务，最好不要从根容器解析服务，可能会造成内存泄露
using(var scope = container.BeginLifetimeScope())
{
	var service = scope.Resolve<IService>();
}
```

#### AOP面向切面编程

使用`ASP.NET Core`中的`Filter`来实现`AOP`思想（是使用的特性实现），比如有`IActionFilter`（在`action`执行前、执行后；`controller`调用前调用后，全局…前后?添加方法）、`IResultFilter`（结果前结果后）、`ExceptionFilterAttribute`（捕捉`action`、`controller`、全局发生的异常），特性`Attribute`有三种注册方式，`action`注册，控制器注册，全局注册。执行顺序是类似于中间件的管道模型，就像是"面向环形编程"：灵活扩展，随取随用

![](../../../attachments/c9639c64a512e42b4c48c1b082e6961b.png)

前两种是在方法或类上添加特性，第三种是在`Startup`里的`Configure`里使用`Filters.Add`添加`filter`特性类进行全局注册。

若是`filter`要依赖注入，但特性用一般方法是无法实现依赖注入的，`filter`的注入有四种方式：

`Filter`类的写法和控制器的依赖注入一样

①全局注册：这种方式会自动注入，

②`ServiceFilter`（一般的）：`action`、`controller`注册的特性使用`[ServiceFilter(typeof(Filter))]`而不是`[Filter]`。然后在`Startup`里的`ConfigureService`里注册那个类（只有一个参数，不是接口对应实例类两个参数，是让它注意一下自己自动依赖注入实例化一下）。

③`TypeFilter`（方便的） 与`ServiceFilter`类似，不同的是不需要再去`ConfigureService`里面注册

④`IFilterFactory`（个性化扩展） 这一种其实就是自己实现一遍`ServiceFilter`，也是要去`ConfigureService`注册。举例`CustomFilterFactoryAttribute`

2、3、4的依赖注入都是基于`FilterFactory`，所以若是自行实现的其他`Filter`的`Attribute`需要实现`IFilterMetadata`接口，不然无法依赖注入

![](../../../attachments/8b8fb09b586ae7f9fac248e21e89e762.png)

![](../../../attachments/bda55ea17258fce1dbe049a9af81fc9b.png)

使用第三方的`IoC`的`AOP`实现，这是对一个依赖注入的类进行拓展，当其他类依赖注入这个类并调用的时候，会进行相应的`AOP`，因此这个实现了深入一个方法内部、业务逻辑层进行`AOP`，这种深入的一般都需要用第三方`IoC`容器实现：

![](../../../attachments/8a7bad07b38c3e3833489c25c2d9cfa4.png)

![](../../../attachments/a53559fbf1d5133bcec3147d5a122937.png)

## 构建RESTful API

`MVC`映射为`RESTful API`，

`Model`，负责处理程序数据的逻辑

`View`，程序里负责展示数据的部分，那么`API`中的角色就是数据或资源的展示，比如使用`Json`。

`Controller`，负责`View`和`Model`之间的交互。如果仅需要通过`ASP.NET Core`进行`Web API`编程，控制器类只需继承`ControllerBase`类即可，提供`API`相关支持，不需要继承`Controller`，因为`Controller`里面添加了对视图层的支持，适用于`MVC Web`应用程序而不是`Web API`。然后类加上特性`[ApiController]`

非强制但有优点：

①要求使用`Attribute`属性路由，即不能在`Startup`里面配置路由信息而是在`Controller`类中`Action`单独配置。

②验证`Model`含有错误信息时自动`HTTP 400`响应

③推断参数绑定源

④`Multipart/form-data`请求推断

⑤错误状态代码的问题详细信息

数据获取是先写`IService`接口来抽象`Model`的获取然后用一个类继承接口来进行`Model`的获取处理，最后在`Controller`里面依赖注入，使用服务来获取资源，这样才能满足`IOC`。

`ControllerBase`父类里面有针对于`HTTP`返回码的方法，`Ok(资源)`、`NotFound()`

### 属性路由

`Controller`类里面的`action`方法上写上`[HttpGet]`等可以限制只能使用`Get`方法来使用此`action`。然后`[HttpGet("{id}")]`也可以获取到后面的`id`值然后在`action`里面使用

但是若是没有在`Startup`里面配置路由，那么得改用属性路由即`[HttpGet("api/xxx/{id}")]`，即`url`模板，若是一个`controller`类里面的`action`开头都是`api/xxx`，那么可以提取出来，直接在类上再加一个特性`[Route("api/xxx")]`，这样`action`上的`url`模板就不必再写`api/xxx`了。

还有一种可以`[Route("api/[controller]")]`就是类名删去`Controller`之后的名字(需要满足`Controller`命名规范才行)，这样可以做到即使`controller`类名更改，`api`也会变动。

`action`除了用`[HttpGet(xxx)]`来写路由模板，也可以通过`[HttpGet]`再加`[Route("xxx")]`来写

`api`消费者可以在`Header`请求头中写`Media Type`比如`application/json`或`application/xml`来表明自己期望返回的数据格式。如果填写的是服务端没有支持的类型，最好是返回`406 Not Acceptable`（但默认`ASP.NET Core`会返回默认的处理格式，需要配置`Controller`才能自动返回`406`）。与之相对应的请求头中写的`Content-Type Header`就是表明输入格式，`api`消费者给的消息是什么格式的，提醒服务端用那个格式来解析。`ASP.NET Core`里输入输出配置就是`output/input formatters`，默认情况下使用`json`作为输入和输出的格式化器。

配置`Controller`是在`ConfigureServices`中`AddControllers`里面的

![](../../../attachments/0252006edb66793b48cd7d28986f37f6.png)

3.0后的写法是

![](../../../attachments/49e84ec96386e1f127eab9c383da38ee.png)

使用`POST`新建资源

![](../../../attachments/704c88ffd020df2925a8de244c3443ab.png)

### API属性/字段映射

| Attribute    | 功能                               | 备注                                                                  |
|--------------|------------------------------------|-----------------------------------------------------------------------|
| `[FromBody]`   | `body`头中，`json`序列化，只能有一个   | 默认按照参数名匹配，如果不一致，使用`attribute`内的`Name`属性指明，下同。 |
| `[FromQuery]`  | `/api/controller/get?id=1&name=John` |                                                                       |
| `[FromRoute]`  | `/parameter/value/parameter2/value2` |                                                                       |
| `[FromHeader]` |                                    |                                                                       |

### 外部Model和数据库Model

即数据库映射的`Entity Model`和`api`里面需要面向外部的`model`（可理解为`viewmodel`视图模型），所以它们应该分开，这样数据库更新后，`api`不会频繁受影响，能够更加健壮、可靠、更易于进化。这种面向外部`model`也可以叫做数据传输对象（`DTO`)(Data Transfer Object)。`System.ComponentModel.DataAnnotations`中有很多对于`Model`的验证限制。

另外发现`ASP.NET Core`中的`Dto`类（`Model`）在用于`Controller`中的`body`自动进行`json`反序列化时，默认是都不可为`null`的，如果传过来的`json`字段少了，会直接响应错误`json`。这种情况`Dto`类里面的字段需要加`?`，没错，`string`类也要加`?`才代表这字段可`null`，`json`不必传输。

#### AutoMapper

能够自动映射`object`到另一个`object`。专门为`ASP.NET Core`服务的一个扩展服务是在`AutoMapper.Externsions.Microsoft.DependencyInjection`中，是，在`Startup`中注册服务`AddAutoMapper(xxxx程序集);` 会去程序集中扫描`automapper`配置文件。配置文件的写法是新建一个继承`Profile`（`AutoMapper`中的）的类

配置：

![](../../../attachments/ea175c1b79b4b90075b4e35162d8b12e.png)

使用（这里是用了依赖注入`IMapper`）：

![](../../../attachments/18e0d70af4f7b88d3eba625d3b28ed5c.png)

**功能**

①支持直接`map`到配置过的目标类型的集合类：`IEnumerable`、`ICollection`、`IList`、`List`、`Arrays`

`mapper.Map<IEnumerable<XXX>（目标类型）>(源类型);`

②处理空集合，源类型中的集合类型为`null`，则会自动映射到目标类型为空集合而不是`null`。

③方法到属性映射，可以直接像配置映射到属性一样映射到方法，只要返回值一致，不需要其他配置。

④自定义映射，当目标类型和源类型属性名或类型不一致，需要做一些转换时，使用自定义映射

```csharp
var config = new MapperConfiguration(cfg =>
{
cfg.CreateMap<Employee, EmployeeDto>()
.ForMember("EmployeeID", opt => opt.MapFrom(src => src.ID))
.ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => src.Name))
.ForMember(dest => dest.JoinYear, opt => opt.MapFrom(src => src.JoinTime.Year));
});
```

例子是`ID`和`EmployeeID`、`EmployeeName`和`Name`属性名不同，`JoinTime`和`JoinYear`不仅属性名不同，属性类型也不同。

其实用法就是`ForMember(目标字段对象，其值的来源/映射方法（可以用方法计算因为是labmada）)`

⑤嵌套映射，只要注册过的类型的映射，那么源类型里面的注册过的类型就会相应的自动映射。

**其他配置**

①可见性（`ShouldMapProperty`）

默认情况下，`AutoMapper`仅映射`public`成员，但其实它是可以映射到`private`属性的。需要注意的是，这里属性必须添加`private set`，省略`set`是不行的。

②全局属性/字段过滤（`ShouldMapField`）

默认情况下，`AutoMapper`尝试映射每个公共属性/字段。

### 返回类型

`Controller`返回类型一般是`Task<IActionResult>`，实际上明确写出来就是`Task<ActionResult<T>>`，这种明确的好处是用一些第三方的`api`文档生成器的时候自动生成更详细的文档比如返回类型的属性，比如`Swashbuckle`的`Swagger`文档。

### API文档（使用Swagger）

`ASP.NET Core`安装`Swagger`，是`Swashbuckle.AspNetCore`包中的。

#### 配置Swagger

`Startup`的`configureService`中添加

```csharp
services.AddSwaggerGen(c =>
{
c.SwaggerDoc("v1", new OpenApiInfo {Title = "Koubot API", Version = "1.0"}); //OpenApiInfo会对API文档增加说明信息
c.IncludeXmlComments(System.IO.Path.Combine(AppContext.BaseDirectory, "Koubot.Server.xml"));
});
```

添加中间件服务 （注意这里的"v1",必须一样才会找到json）

```csharp
app.UseSwagger(); //启用中间件服务生成Swagger作为JSON终结点
//启用中间件服务对swagger-ui，指定Swagger JSON终结点
app.UseSwaggerUI(c =>
{
c.SwaggerEndpoint("/swagger/v1/swagger.json", "Koubot API v1.0");
c.RoutePrefix = string.Empty;//默认访问swagger UI是/swagger，设置为空可以直接通过url访问
});
```

##### 为接口文档添加注释

项目设置中的"生成"，启用XML文档文件，输出最好写`bin\xxxx.xml`，这时会增加一个warning的提示，对公有方法未写xml注释会有波浪线，在"禁止显式警告"中添加1591

注释格式：

```csharp
/// <summary>
/// 这是一个带参数的get请求
/// </summary>
/// <remarks>
/// 例子:
/// Get api/Values/1
/// </remarks>
/// <param name="id">主键</param>
/// <returns>测试字符串</returns>
/// <response code="201">返回value字符串</response>
/// <response code="400">如果id为空</response>
```

`SwaggerUI`可以测试`api`接口

然后运行，访问设定的`json`地址，比如这里就是访问<http://localhost:port/swagger/v1/swagger.json>，获取`api`的`json`信息。

使用这个`api json`信息复制到`swagger`官网的编辑器中，可以选择生成对应语言的客户端SDK。

C#的SDK有bug，需要做一些修改才能直接使用：

simply override the property BasePath and add a personal static property ApiHost into GlobalConfiguration, and go back to its parent class Configuration constructor and annotate BasePath = "/"; , and just at first define the GlobalConfiguration.ApiHost, then it work for all api without any configure.

就是用`BasePath`赋值一个静态变量

另外生成dll也有bug，需要打开bat文件然后手动下载最新的nuget到目录再运行。但bat还是有bug，所以还是直接复制IO.Swagger项目直接引用使用，记得需要把依赖的三个dll（用bat生成的）复制到项目然后IO.Swagger去引用。

<https://www.cnblogs.com/gdsblog/p/9279814.html> 版本控制

<https://blog.csdn.net/shujudeliu/article/details/82189262> token设置

<https://www.cnblogs.com/gl1573/archive/2020/04/07/12652708.html> 其他避坑

似乎enum上的注释不支持，只能显示enum类上的注释，所以要把所有数字代表的写在一起…

### 使用配置文件

`Controller`类里面可以依赖注入`IConfiguration`，

然后`_configuration.GetSection("node").GetValue<类型>("子node")`


# 部署

**局域网简单部署**

```bash
dotnet xxx.dll --urls=http://currentIP:port
```

然后配置防火墙：

Windows安全中心：高级设置（高级安全Windows Defender防火墙）

入站规则中添加刚刚监听的端口。

就可以让局域网其他的电脑访问。

[8 ways to set the URLs for an ASP.NET Core app (andrewlock.net)](https://andrewlock.net/8-ways-to-set-the-urls-for-an-aspnetcore-app/)

**公网部署**

类似于局域网部署。

但是IP需要查找一下，`ipconfig`，而不是使用公网IP。

### WebAssembly部署

需要从`Server`使用`Publish`功能进行部署，比如`Publish`到文件夹。

### 最好在dll当前目录下进行启动服务

比如如果从C盘使用`dotnet D:\xxx.dll`，则会导致非常多的问题，比如本地数据库`sqlite`路径访问不到（相对路径问题）

## HTTPS部署

### 本地开发

①`dotnet dev-certs https --trust` 使用该命令信任`dotnet`的SSL开发证书。（一般安装的时候似乎已经信任了？）

②在`launchSettings.json`修改启动链接由`http`改到`https`。

如果使用`IIS Express`启动（是VS集成的`ASP.NET Core`默认的Debug与测试的IIS的轻量版本），要非常注意的是，如果不是使用Admin权限启动（*其实试了以管理员启动VS也不行*）`IIS Express`进行Debug，则会存在

`ERR_SSL_PROTOCOL_ERROR`（浏览器）、`Cannot determine the frame size or a corrupted frame was received.`（`dotnet`客户端）等问题

它默认不需要管理员权限的端口在安装时预留了**44300-44399**（可以使用`netsh http show sslcert`命令看到），所以也可以修改`launchSettings.json`中IIS的`applicationUrl`为这些预留端口上的端口。（有时候44300之类的也用不了，换个端口试试）

## 作为前端服务器

使用`app.UseStaticFiles();`默认将当前运行目录下的`wwwroot`作为`baseDirectory`

所以只需要将`VUE`等生成的`dist`文件夹中的内容，拷贝到`wwwroot`下即可。

# SignalR

多种实现双向通信协议的封装与抽象（`WebSocket`、`Server-Sent Events`、`Long Polling`，根据实际`Client`兼容情况向后`Fallback`。后续会根据技术迭代增加`gRPC`等），实时推送解决方案。

所以无法简单的向下兼容使用如原生`WebSocket`直接连接`SingalR`。

强行兼容：<https://www.derpturkey.com/signalr-is-an-abomination-how-to-connect-using-raw-websockets/>

优点：

自动选择支持的双向通信技术、新技术迭代后无需改动代码享受高性能协议。

封装方式是`RPC`，代码易读易懂，扩展方便。

多种自带功能，如重连等。

一种适合于`.NET`（也支持`Javascript`）的`RPC`技术，用于构建实时性的`Web app`。

<https://docs.microsoft.com/en-us/aspnet/core/blazor/tutorials/signalr-blazor?view=aspnetcore-6.0&tabs=visual-studio&pivots=webassembly>

建议使用强类型

```csharp
public class StronglyTypedChatHub : Hub<IChatClient>
```

[https://docs.microsoft.com/en-us/aspnet/core/signalr/hubs?view=aspnetcore-6.0\#strongly-typed-hubs](https://docs.microsoft.com/en-us/aspnet/core/signalr/hubs?view=aspnetcore-6.0#strongly-typed-hubs)

这里`Hub`中的接口`IChatClient`是指`Client method`：

The return value of a client method must be void or of type Task.

`Client`端的强类型暂时未实现：

<https://github.com/dotnet/aspnetcore/issues/32534>

## Handle events for a connection

The `SignalR Hubs API` provides the `OnConnectedAsync` and `OnDisconnectedAsync` virtual methods to manage and track connections. Override the `OnConnectedAsync` virtual method to perform actions when a client connects to the hub, such as adding it to a group

## Send messages from outside a hub

通过`Controller`获取`Hub`进行调用。

已经自动注册：

```csharp
private readonly IHubContext<NotificationHub> _hubContext;

private readonly IHubContext<ChatHub, IChatClient> _strongChatHubContext;
```

## 不同的Hub不同的连接？

[https://docs.microsoft.com/en-us/aspnet/signalr/overview/guide-to-the-api/hubs-api-guide-server\#multiple-hubs](https://docs.microsoft.com/en-us/aspnet/signalr/overview/guide-to-the-api/hubs-api-guide-server#multiple-hubs)

如果使用多`Hub`，需要用`proxy`：

[https://docs.microsoft.com/en-us/aspnet/signalr/overview/guide-to-the-api/hubs-api-guide-net-client\#how-to-create-the-hub-proxy](https://docs.microsoft.com/en-us/aspnet/signalr/overview/guide-to-the-api/hubs-api-guide-net-client#how-to-create-the-hub-proxy)

# gRPC

`gRPC` 最初由谷歌开发，是一个基于 `HTTP/2` 实现的高性能远程过程调用框架。但由于浏览器没有直接暴露 `HTTP/2`，所以 Web 应用程序不能直接使用 `gRPC`。

`gRPC Web` 是一个标准化协议，它解决了这个问题。

**注意，`gRPC`传输使用`http/2`协议，而`http/2`协议需要`https`。**

[https://learn.microsoft.com/zh-cn/aspnet/core/grpc/troubleshoot?view=aspnetcore-7.0\#call-insecure-grpc-services-with-net-core-client](https://learn.microsoft.com/zh-cn/aspnet/core/grpc/troubleshoot?view=aspnetcore-7.0#call-insecure-grpc-services-with-net-core-client)

`gRPC`有四种调用方式

[https://learn.microsoft.com/en-us/aspnet/core/grpc/services?view=aspnetcore-7.0\#implement-grpc-methods](https://learn.microsoft.com/en-us/aspnet/core/grpc/services?view=aspnetcore-7.0#implement-grpc-methods)

不过`gRPC`都是只支持一个请求参数（即接口的请求类只能有一个）

Unary

单项请求响应类，类似普通`RESTful API`。

Server streaming

客户端发送消息请求后，服务端流式发送，即可以一直保持连接，服务端随意间隔发送消息。客户端可发送取消连接的`CancellationToken`，但无法发送信息给服务端。服务端完成消息发送后结束。

Client streaming

客户端请求建立连接后，客户端不断流式发送消息给服务端，服务端异步监听获取，直到服务端返回响应后结束。

Bi-directional streaming

双向流即建立连接后，双方都可以流式的异步发送消息。

服务端可以多线程进行异步读取和异步发送，也可以单线程地异步读取并处理而进行发送响应。

而`gRPC Web`不支持`Client`和双向流。

整体上不建议使用`gRPC Web`。即前端还是老实使用`RESTful API`。

后端服务间调用建议采用`gRPC`

## 概念

<https://docs.microsoft.com/en-us/aspnet/core/grpc/client?view=aspnetcore-6.0>

## 最佳实践

-   Creating a channel can be an expensive operation. Reusing a channel for gRPC calls provides performance benefits.
-   gRPC clients are created with channels. gRPC clients are lightweight objects and don't need to be cached or reused.
-   Multiple gRPC clients can be created from a channel, including different types of clients.
-   A channel and clients created from the channel can safely be used by multiple threads.
-   Clients created from the channel can make multiple simultaneous calls.

## Protobuf-net

<https://github.com/protobuf-net/protobuf-net>

可以使用该第三方库从`Class`生成`proto`文件。

`protobuf-net.BuildTools` 该工具可以检查使用`[ProtoContract]`或`[Service]`定义的语法错误

教程及介绍

<https://learn.microsoft.com/en-us/aspnet/core/grpc/code-first?view=aspnetcore-7.0>

<https://protobuf-net.github.io/protobuf-net.Grpc/gettingstarted>

### 效率测试

<https://github.com/protobuf-net/protobuf-net.Grpc/issues/151>

# Unit Test

## Moq

In simple English, `Moq` is a library which when you include in your project give you power to do Unit Testing in easy manner. Why? Because one function may call another, then another and so on. But in real what is needed, just the return value from first call to proceed to next line. `Moq` helps to ignore actual call of that method and instead you return what that function was returning. and verify after all lines of code has executed, what you desired is what you get or not. Too Much English, so here is an example:



### Cookies

<https://stackoverflow.com/questions/4463610/httpwebrequest-cookie-with-empty-domain>

`CookieContainer`是像浏览器一样，可以给多个`HttpWebRequest`复用的，所以需要声明出`Cookie`的`Domain`、`Path`。（即，`request`目标是匹配访问`Domain+Path`的才会使用该`Cookie`，否则不使用）

#### Response中的Cookies

如果`Request`没有使用`CookieContainer`时，那么返回的`Response`也不会有`Cookie`（但可以在`Header`看到）。所以要`Cookie`得需要再`Request`时候新建一个`CookieContainer`。