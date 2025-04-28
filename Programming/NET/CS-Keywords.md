# C# 关键字

## 关键字

### extern外部修饰符

用于声明在外部实现的方法，外部修饰符的常见方法是在使用Interop 服务调入外部非托管代码时与 DllImport 属性一起使用；在这种情况下，该方法还必须声明为 static

### override重写

override关键字主要是提供派生类对父类方法的新实现，即重写。不可以用于重写非虚方法和静态方法，（new可以隐藏非虚方法）必须重写父类的abstract方法、可选重写virtual方法。被重写的原方法都失效了，只会调用重写后的方法。

### new 关键字

new关键字可以在派生类中隐藏父类的方法，指明在使用派生类调用的方法是new关键字新定义出来的方法，而不是父类的方法。

new的优先级是按照父类A = new 子类B（），那么方法是调用的父类方法，除非是子类B = new 子类B（），这样才会调用B的新的new方法

### virtual虚方法

允许在派生类中重写这些对象，默认情况下，方法是非虚拟的，不可以重写。若是不重写虚方法，那么调用的就是这个父类的方法。重写也是用new和override关键字（注意两者区别）。

### abstract方法

抽象方法必须被重写，就类似于实现了接口一样

### sealed关键字

当对一个类应用 sealed 修饰符时，此修饰符会阻止其他类从该类继承。类似于Java中final关键字。即密封类

修饰方法或属性： sealed 修饰符必须始终与 override（C\# 参考）一起使用，防止被再一次继承重写，所以是三个类以上的连续继承关系才会用到sealed

尽量多使用sealed，可以提高性能。[.NET 中密封类的性能优势](https://mp.weixin.qq.com/s/dZlEjOB8jx0ku8eN8AhpzQ)

### const关键字

在编译时设置其值

### readonly关键字

程序运行期间只能初始化一次

### static关键字

`static` 的属性初始化需要注意顺序，在一个静态属性引用另一个静态属性的时候，如果这个静态属性正在被初始化的时候引用另一个需要被初始化但未被初始化的属性时，会得到 `null`（这是 C# 的 bug？不，见下面 textual order 的描述）

> A static constructor is used to initialize any static data, or to perform a particular action that needs to be performed once only. It is called automatically before the first instance is created or any static members are referenced.

> If static field variable initializers are present in the class of the static constructor, they will be executed in the textual order in which they appear in the class declaration immediately prior(紧接着) to the execution of the static constructor.（所以会按顺序先执行参数的初始化（若有））

另外建议使用 `static constructors`，即使不是静态类，也可以使用静态构造函数，用于初始化静态变量。

注意，静态构造函数不能有参数，且会在一个实例构造函数之前调用。静态构造函数只会调用一次。

[官方的静态教程](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/static-classes-and-static-class-members#static-members)

**static class注意事项**

a static class remains in memory for the lifetime of the application domain in which your program resides

**static member注意事项**

Only one copy of a static member exists, regardless of how many instances of the class are created.

Static members are initialized before the static member is accessed for the first time and before the static constructor

### try、finally

就算try return了 依然会执行finally， 但是是先return结果了再执行。

### using关键字

在using作用域的最后会自动Dispose()using的资源。相当于try()…finally{ xx.Dispose() }

The using statement ensures that Dispose (or DisposeAsync) is called even if an exception occurs within the using block. You can achieve the same result by putting the object inside a try block and then calling Dispose (or DisposeAsync) in a finally block; in fact, this is how the using statement is translated by the compiler. The code example earlier expands to the following code at compile time (note the extra curly braces to create the limited scope for the object):

在更新的版本中，using不需要括弧时，dispose的时候也是局部变量访问不到的末尾。

At the end of the scope of the variable r

还可以使用global using

![电脑萤幕的截图 描述已自动生成](../../attachments/9d8382a445624ca721b203c879e414a1.png)

### explicit与implict

显示转换和隐式转换关键字

```cs
/// <summary>
/// 将string隐式转换为KouMessage（创建一个消息内容为content的KouMessage）
/// </summary>
/// <param name="content"></param>
public static implicit operator KouMessage(string content)
{
    return new KouMessage(content);
}
/// <summary>
/// 将KouMessage隐式转换为string（即获取消息内容）
/// </summary>
/// <param name="content"></param>
public static implicit operator string(KouMessage message)
{
    return message?.Content;
}
```

然后使用的时候就可以直接 KouMessage a = "a string"; （这是实现了string到KouMessage的隐式转换） 同理显式转换就是需要(KouMessage)"a string"

### ref关键字（reference）

`ref`关键字能用在函数参数定义上、返回值上、函数体内部的本地函数，但只讲最常用的参数定义上。

官方[详细介绍](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/ref)

`C#`的函数一般的参数传递，值类型很好理解，是传递的值。而引用类型传递的是什么呢？在我理解是传递的引用的对象，而`caller`（函数调用者）传递的`reference` `value`，它的名字只是对这个对象的一个引用，然后这个引用有一个定义了的名字（变量名）。但传递到函数参数上去只是传递引用的对象给了一个变量名是函数参数的变量，引用的内部还是与`caller`一样的同一个对象。对它内部修改就相当于修改对象，两边都会被修改。**但若是修改它引用的对象**，比如赋值为`null`，`caller`的变量并不会为`null`，修改变量的对象引用并不会修改原先内部引用的对象。

但如果该函数参数使用了`ref`关键字修饰，那么是连带着引用和内部对象一并传递，那函数参数的名字其实就是`caller`那个传递的变量的`alias`（别名），修改它的引用也会改变`caller`那边变量的引用。

函数的参数定义里面如果使用`ref`关键字，`value` `type`的值会随着函数里面的改变而改变，不仅函数定义需要，而且调用函数时也需要加上`ref`关键字调用

```cs
void Method(ref int refArgument)
```

函数返回结果也可以使用`ref`关键字，官方建议对大型结构体使用`ref`关键字

Returning ref readonly enables you to save copying larger structures and preserve the immutability of your internal data members.

### predicate

Func\<T, bool\>是对delegate bool Predicate\<T\>(T obj)的简化，

Predicate\<T\>又是对Func\<T, bool\>的简化，

其实，就是一个东西。Func转Predicate可以使用new Func\<T, bool\>(predicate)来完成。也可以在调用Func方法的时候predicate.Invoke变成method group（语法糖）

Delegate至少0个参数，至多32个参数，可以无返回值，也可以指定返回值类型。这个是祖宗。

Func可以接受0个至16个传入参数，必须具有返回值。

Action可以接受0个至16个传入参数，无返回值。Action是无返回值的委托

Predicate只能接受一个传入参数，返回值为bool类型。

typeof(Func\<,\>).MakeGenericType(type1, type2);

### dynamic

这个关键字让C\#有了弱类型语言的特性，能够使用dynamic关键字声明动态类型，在编译的时候不再对类型进行检查，默认dynamic对象支持你想要的任何特性，即怎么写都不会报错。这一特性在某些需要很复杂的反射才能实现的场景过程中大大简化了实现方式并提高效率。

但注意dynamic不可用于group method等调用，即比如p是一个委托，使用X.Where(p.Invoke)则无法成功。原理类似于无法将var a = p.Invoke一样

dynamic在调用泛型方法的时候，泛型T会被认为是object，所以如果泛型方法里面如果用的是a is ICollection\<T\>时，会被当做是T为object，虽然T按道理应该会正确判断。因此最终会返回false。解决方案是可以用反射得到方法，然后用MakeGeneric做泛型方法。

另外，dynamic也不支持扩展方法的调用：

Extension methods aren't supported by dynamic typing in the form of extension methods, i.e. called as if they were instance methods.

可以使用其对应的静态方法实现。

### is和as

as是进行了转换，有返回值，如果转换失败返回null。is只是检查是否能兼容给定类型，返回类型为bool值，转换失败返回false，新C\#语言版本is增加了可以内联转换的语法糖（As of C\# 7+, you can now cast inline）。

两者都不会抛出异常。它们都能判断a is/as b中a是否能赋值给b。

注意is和as是用于实例和类型，而不是适用于Type类型来判断是否兼容。

Type类型实例需要使用指定Type的IsAssignableFrom等方法来判断derive关系

### yield return 与 yield break

就是一个一个的 return。能给编程带来性能上的提高以及用法上的方便，比如要实现对一个list去重后乘方，就可以在去重第一个拿出来然后乘方，再放入list，而不是先整个去重，然后再整个遍历乘方。另外还有可以在输出的时候，用户不必等待必须所有list中的数据处理完才能看到结果，而是可以在处理过程中看到处理情况。

原理是在 return 时，保存当前函数的状态，下次调用时继续从当前位置处理（似乎返回值得是IEnumerable\<\>类型且在外面用该函数需要使用foreach）。

```cs
static IEnumerable<int> FilterWithYield()
{
    foreach (int i in GetInitialData())
    {
        if (i > 2)
        {
            yield return i;
        }
    }
    yield break;
    Console.WriteLine("这里的代码不执行");
}
```

## 流程控制

### switch

C\#8.0以上有switch语法糖

```cs
return level switch
{
    HandleLevel.None => null,
    HandleLevel.Brief => errorObject.ToErrorString(),
    _ => errorObject.ToErrorString(FormatType.Detail)
};
```

可以使用goto case xx 跳转

case var _ when filterType.HasFlag(FilterType.Exact): //C\#7.0特性 case的when约束，要true才会成功case; \_是switch的变量，这里忽略了

## Out parameter

在方法一个方法中可以拥有多个返回值，除了return之外还可以通过out返回其他返回值。

但注意bool foo(out localVariable) 此时将localVariable放在这里，无论foo方法是否执行返回false或true，localVariable都将被赋值。所以要明确方法的返回值。 