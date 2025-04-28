# C# 类型系统

## 泛型约束（Constraints）

NET支持的类型参数约束有以下几种：

|                 |                                                                                                                         |
|-----------------|-------------------------------------------------------------------------------------------------------------------------|
| struct          | 必须是一个值类型                                                                                                        |
| class           | 必须是一个引用类型                                                                                                      |
| new()           | 必须要有一个无参构造函数                                                                                                |
| NameOfBaseClass | 必须继承名为NameOfBaseClass的类                                                                                         |
| NameOfInterface | 必须实现名为NameOfInterface的接口                                                                                       |
| unmanaged       | 是unmanaged types。 <https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/unmanaged-types>  |
|                 |                                                                                                                         |

分别提供不同类型的泛型约束

可以提供类似

```cs
class MyClass<T, U>
where T : class
where U : struct
{ }
```

## 值类型与引用类型的比较

**override Equal方法后，记得和==区分开来！行为已经不一样；**

### equal与==运算符

Equals方法对于值类型和引用类型的定义不同。对于值类型，类型相同，并且数值相同(对于struct的每个成员都必须相同)，则Equals返回 true,否则返回false。而对于引用类型，默认的行为与ReferenceEquals的行为相同，仅有两个对象指向同一个Reference的时 候才返回true。

从定义上来看，Equals方法与"=="的表现是一致的（"=="对引用类型而言是对两个对象进行同一性判断，值类型比较值）。有一点区别是对于用户定义的值类型，如果没有重载==操作符，==将是不能够使用的。

如果将object类型（内部是string类型）与string类型相比，则"=="退化为使用ReferenceEquals

object.ReferenceEquals(null, null) 为 true

### 关于GetHashCode与Equals的重写

it is important if your item will be used as a key in a dictionary, or \`HashSet\<T\>\`, etc - since this is used (in the absence of a custom \`IEqualityComparer\<T\>\`) to group items into buckets. If the hash-code for two items does not match, they may \*never\* be considered equal [Equals].

The GetHashCode() method should reflect the \`Equals\` logic; the rules are:

①if two things are equal (\`Equals(...) == true\`) then they \*must\* return the same value for \`GetHashCode()\` Equals对于引用类型的默认实现是比较地址，GetHashCode的默认实现也是针对地址，所以若是重写Equals之后不重写GetHashCode，那么会导致HashSet的时候出现问题，逻辑上相等的对象会变得不相等。不过若是写了Euqals然后HashSet里面估计只能放一个这样的对象了。

②if the \`GetHashCode()\` is equal, it is \*not\* necessary for them to be the same; this is a collision, and \`Equals\` will be called to see if it is a real equality or not. 这是当出现GetHashCode生成出现冲突的时候，会再次调用Equals看是否相等，因为有可能是别的对象计算出了重复的HashCode。

③**针对一个特定的对象，在这个对象的生存期内，GetHashCode（）始终应该返回相同的值**，即使对象的数据发生了改变。许多时候应该缓存方法的返回值，从而确保返回相同的值。正常情况下，一个可变的对象，其哈希码的值只能由不能突变的字段提供，以此来保证哈希码在整个生命周期中不会发生改变。如果对象的哈希码在哈希表中是可以发生变化的，那么Contains方法肯定会出现问题。

④在不同时间或不同应用域(APPDomains)中使用GetHashCode时，没有办法保证值不变。所以不要存HashCode到数据库（因为一般是使用了地址来计算的），也不要用于加密

重写GetHashCode的一般方法：

```cs
public override int GetHashCode()
{
    int hash = 13;
    hash = hash * 7 + AreaCode?.GetHashCode() ?? 0;
    hash = hash * 7 + Exchange?.GetHashCode() ?? 0;
    return hash;
}
```

使用素数乘，溢出没关系，GetHashCode本质就是为了做到随机

## 枚举（Enum）

按位枚举加一个[Flags]特性，拥有这个特性会在一些地方得到方便。比如Json序列化时。

按位枚举可以使用HasFlag()方法来测定是否包含。

使用 1 \<\< 1, 1 \<\< 2等枚举位才支持按位。

使用\^是非运算，可以进行删除特定枚举。使用&是与运算；\|是或运算，可以添加权限

## Record

![图片包含 文本 描述已自动生成](../../attachments/243dc8e644c37be47e69d8ef89826f4f.png)

两种写法

![文本 描述已自动生成](../../attachments/db2f1e011c4b527961666045a76b5f4a.png)

默认都是readonly的，即immutable。也可以自己改成mutable的。

C\#9出现。C\#10出现record struct以及record class

实际上record class 即是record，是reference type。而record struct是value type。

record拥有如下build-in feature

### Value Equality

two objects are equal if they are of the same type and store the same values.

### Build-in format

ToString()

所以非常适合DTO之类的，能够直接打印类Json格式输出

例如：

```cs
DailyTemperature { HighTemp = 57, LowTemp = 30, Mean = 43.5 }
DailyTemperature { HighTemp = 60, LowTemp = 35, Mean = 47.5 }
```

### Nondestructive mutation

If you need to copy an instance with some modifications, you can use a with expression to achieve nondestructive mutation. A with expression makes a new record instance that is a copy of an existing record instance, with specified properties and fields modified.

person2 = person1 with {}; //实际上是复制了一个person1.

它不能很好的替代DDD中的Value Object实现，还是得使用官方的ValueObject实现。

<https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/implement-value-objects>

原因：

<https://enterprisecraftsmanship.com/posts/csharp-records-value-objects/>

## Unmanaged Code 非托管代码

Managed code 是指运行在Common Language Runtime ，CLR（.net 5、.net framework、mono、.net Core等）之上的代码，它给跑在它身上的代码提供了automatic memory management, security boundaries, type safety等等功能

而Unmanaged code就是指需要自己管理内存、对象销毁等等的代码（即C/C++）。

Intermediate Language，IL是C\#、F\#、VB等等编译到的中间语言，然后再由CLR即时转为机器码去运行（Just-In-Time JIP compiling）。所以它们不像C/C++直接编译成机器语言。

### Unmanaged code interoperability

非托管代码的互操作性，C\#可以实现，在一片代码区域中使用非托管代码去写（unsafe关键字），然后CLR执行到这一块的时候将不会进行托管。

<https://docs.microsoft.com/en-us/dotnet/standard/automatic-memory-management>

### 获取指针

Unmanaged type 和managed type之间的联系仅有特别的一些类型

an unmanaged-type is one of the following:

• sbyte, byte, short, ushort, int, uint, long, ulong, char, float, double, decimal, or bool.

• Any enum-type.

• Any pointer-type.

• Any user-defined struct-type that is not a constructed type and contains fields of unmanaged-types only.

## GC（Garbage Collection）

<https://www.cnblogs.com/qiupiaohujie/p/11960624.html>

<https://docs.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals>

Mark-Compact是标记后压缩，是处理垃圾的方法

非托管资源GC不管。

## 注释

<https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/xmldoc/recommended-tags>

XML注释。使用///系统自动补全，这些注释可以生成一个xml文件，方便程序生成说明文档。而且引用方法或属性等情况时，IDE会给予提示

| 标签                             | 作用                                                                                                                                                                                                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| \<c\>                          | 将说明中的文本标记为代码                                                                                                                                                                                                                                                             |
| \<b\>                          | 加粗                                                                                                                                                                                                                                                                       |
| \<code\>                       | 提供了一种将多行指示为代码的方法                                                                                                                                                                                                                                                         |
| \<example\>                    | 指定使用方法或其他库成员的示例                                                                                                                                                                                                                                                          |
| \<exception\>                  | 允许你指定可能发生的异常类`<exception cref="DivideByZeroException">Why it's thrown.</exception>`                                                                                                                                                                                      |
| \<include\>                    | 允许你引用描述源代码中类型和成员的另一文件中的注释, 使用 XML XPath 语法来描述你的源代码中的类型和成员。                                                                                                                                                                                                               |
| \<list\>                       | 向XML注释文档中插入一个列表                                                                                                                                                                                                                                                          |
| \<para\>                       | 向XML注释文档中插入一个段落                                                                                                                                                                                                                                                          |
| \<param\>                      | 描述一个参数                                                                                                                                                                                                                                                                   |
| \<paramref\>                   | **提供了一种指示一个词为参数的方法** \<paramref name="value" /\>                                                                                                                                                                                                                         |
| \<permission\>                 | 允许你将成员的访问许可加入到文档中                                                                                                                                                                                                                                                        |
| \<remarks\>                    | 用于添加有关某个类型的信息                                                                                                                                                                                                                                                            |
| \<returns\>                    | 描述返回值                                                                                                                                                                                                                                                                    |
| \<see\>                        | 指定链接 以及 指定类型（code reference） \<see langword="null"/\> \<see href="http://google.com"/\> **\<see cref="ConcurrentDictionary{TKey, TValue}"/\>**  **复杂的需要：** **\<see cref="IEnumerable{T}"\>IEnumerable\</see\>&lt;\<see cref="KeyValuePair{TKey,TValue}"/\>&gt;.**        |
| \<seealso\>                    | 指定希望在"请参见"一节中出现的文本 <https://stackoverflow.com/questions/532166/how-to-reference-generic-classes-and-methods-in-xml-documentation> 这里说明了如何链接到带有尖括号的类或方法中                                                                                                                  |
| \<summary\>                    | 类型或类型成员的通用描述                                                                                                                                                                                                                                                             |
| \<value\>                      | 描述属性                                                                                                                                                                                                                                                                     |
| \<![CDATA[]]\>                 | 在XML中，需要转义的字符有： & \&amp; \< \&lt; \> \&gt; ＂ \&quot; ＇ \&apos; 但是严格来说，在XML中只有"\<"和"&"是非法的，其它三个都是可以合法存在的，但是，把它们都进行转义是一个好的习惯。 不管怎么样，转义前的字符也好，转义后的字符也好，都会被xml解析器解析，为了方便起见，使用\<![CDATA[]]\>来包含不被xml解析器解析的内容。但要注意的是： (1) 此部分不能再包含"]]\>"； (2) 不允许嵌套使用； (3)"]]\>"这部分不能包含空格或者换行。 |
| \<typeparamref name="TEnum"/\> | **可以指定泛型**                                                                                                                                                                                                                                                               |

## 异常

注意，System.Text.Json 无法Serialize异常，参见<https://github.com/dotnet/runtime/issues/43026>

By default, all public properties are serialized. You can specify properties to ignore.

The default encoder escapes non-ASCII characters, HTML-sensitive characters within the ASCII-range, and characters that must be escaped according to the RFC 8259 JSON spec.

By default, JSON is minified. You can pretty-print the JSON.

By default, casing of JSON names matches the .NET names. You can customize JSON name casing.

By default, circular references are detected and exceptions thrown. You can preserve references and handle circular references.

**By default, fields are ignored. You can include fields.**

某些线程上引发的异常不会被捕获，需要用以下方式：


```cs
var curDomain = AppDomain.CurrentDomain;
curDomain.UnhandledException += new UnhandledExceptionEventHandler((sender, eventArgs) =>
{
	var ex = (Exception) eventArgs.ExceptionObject;
	KouLog.QuickAdd($"程序异常捕获：{ex.ToJsonString()}");
});

TaskScheduler.UnobservedTaskException += (sender, e) =>
{
	KouLog.QuickAdd($"任务异常捕获：{e.ToJsonString()}");
};
```

而对于Winform等线程上引发的异常，还需要使用

`Application.ThreadException`去捕获。 