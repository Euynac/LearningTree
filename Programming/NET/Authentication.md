# IdentityServer4

#### Swagger认证

需要RedirectUris一致。可在ClientRedirectUris表中看到。
```cs
     RedirectUris = {
         $"{clientUrlDict["ListApi"]}/swagger/oauth2-redirect.html",
         ReplaceToLocalhost($"{clientUrlDict["ListApi"]}/swagger/oauth2-redirect.html"),
     },
     PostLogoutRedirectUris = {
         $"{clientUrlDict["ListApi"]}/swagger/",
         ReplaceToLocalhost($"{clientUrlDict["ListApi"]}/swagger/"),
     },

```

用户账号在 AspNetUsers 表


# Authentication(身份认证)

> the process of determining a user's identity.

In ASP.NET Core, authentication is handled by the authentication service, [IAuthenticationService](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.authentication.iauthenticationservice), which is used by authentication [middleware](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/?view=aspnetcore-8.0). The authentication service uses registered authentication handlers to complete authentication-related actions. Examples of authentication-related actions include:

- Authenticating a user.
- Responding when an unauthenticated user tries to access a restricted resource.

## 术语
### Schemes(方案)

> The registered authentication handlers and their configuration options

such as [AddJwtBearer](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.dependencyinjection.jwtbearerextensions.addjwtbearer) or [AddCookie](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.dependencyinjection.cookieextensions.addcookie). These extension methods use [AuthenticationBuilder.AddScheme](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.authentication.authenticationbuilder.addscheme) to register schemes with appropriate settings.

"JwtBearer" refers to a type of authentication scheme in ASP.NET Core. It is used for authenticating users based on JSON Web Tokens (JWT).


> OIDC stands for OpenID Connect, which is a standard protocol for authentication. It is used to verify the identity of users based on authentication performed by an authorization server.


## 实现

### AuthenticationManager 认证管理器

位于HTTPContext中，身份认证中间件。

```cs
public abstract class AuthenticationManager
{

    //AuthenticateContext包含了需要认证的上下文，里面就有CurrentUser，也就是ClaimsPrincipal
    public abstract Task AuthenticateAsync(AuthenticateContext context);
    
    //握手
    public abstract Task ChallengeAsync(string authenticationScheme, AuthenticationProperties properties, ChallengeBehavior behavior);
    
    //登入
    public abstract Task SignInAsync(string authenticationScheme, ClaimsPrincipal principal, AuthenticationProperties properties);
    
    //登出
    public abstract Task SignOutAsync(string authenticationScheme, AuthenticationProperties properties);
}

```

其实现有CookieAuthentication等，详见：[ASP.NET Core 之 Identity 入门（二） - Savorboard - 博客园 (cnblogs.com)](https://www.cnblogs.com/savorboard/p/aspnetcore-identity2.html)

# Authorization(授权)

## 术语
### Cliams
"Claims" in the context of ASP.NET Core authentication typically refers to the assertions about a user that a system receives and uses to make decisions about access or behavior. These claims can include information like the user's name, email, roles, or any other relevant data that can be used for authorization purposes within the application. In ASP.NET Core, these claims are used during the authentication process to determine the user's identity and authorization levels.

[ASP.NET Core 认证与授权 初识认证 - 雨夜朦胧 - 博客园 (cnblogs.com)](https://www.cnblogs.com/RainingNight/p/introduce-basic-authentication-in-asp-net-core.html)

[ASP.NET Core 之 Identity 入门（一） - Savorboard - 博客园 (cnblogs.com)](https://www.cnblogs.com/savorboard/p/aspnetcore-identity.html)

简单理解抽象定义：
- 证件单元（Claims） 
- 证件（ClaimsIdentity）
- 证件当事人（ClaimsPrincipal）

 
```cs
// 定义证件对象的基本功能。
public interface IIdentity
{
    //证件名称
    string Name { get; }
    
    // 用于标识证件的载体类型。
    string AuthenticationType { get; }
    
    //是否是合法的证件。
    bool IsAuthenticated { get; }
}

public class ClaimsIdentity : IIdentity
{
    //......
}

public class ClaimsPrincipal 
{
    //当事人可以拥有多个证件
    public ClaimsPrincipal(IEnumerable<ClaimsIdentity> identities){}
    
    //当事人的主证件，即身份证
    public virtual IIdentity Identity { get; }
    
    public virtual IEnumerable<ClaimsIdentity> Identities { get; }
    
    public virtual void AddIdentity(ClaimsIdentity identity);

}
```


![](../../attachments/Pasted%20image%2020240627160448.png)

