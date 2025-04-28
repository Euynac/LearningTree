# C# 高级特性

## Linq 与 Lambada表达式

Where中如果报null的错，有可能是where里面的lambada表达式出错，注意不能导致null引用。

Dynamic Linq中的DynamicFunctions中的Like方法在EFCore3.0以后被弃用，所以要使用Like只能到Client端进行。

### 注意

Average不支持List为0的情况

### Expression

判断委托Linq to Database需要使用Expression\<Func\<T,bool\>\>或Func\<T,bool\>（不可用Predicate\<T\>）才可（但注意某些方法生成的LambdaExpression也不一定能用于数据库）。

不能用已经生成的Func\<T,bool\>或Predicate\<T\>，这样使用：p=\>predicate(p)或p=\>func(p)，会产生无法翻译到数据库的错误，而要直接传入Func\<T,bool\>或predicate.Invoke//这样就相当于转换成了Func\<T,bool\>。

### where条件顺序、执行次数影响

The answer is going to be different for different LINQ providers. In particular, the story is very different for LINQ to Objects and say LINQ to Entities.

In LINQ to Objects, the Where operator accepts the filter as Func\<TSource, bool\>. Func\<,\> is a delegate, so for the purposes of this discussion, you can think of it as a function pointer. In LINQ to Objects, your query is equivalent to this:

static void Main() {

List\<TestItem\> results = items.Where(MyFilter).ToList();

static boolean MyFilter(TestItem item) {

return item.Item1 == 12 &&

item.Item2 != null &&

item.Item2.SubItem == 65 &&

item.Item3.Equals(anotherThingy)

}

The main thing to notice is that MyFilter is an ordinary C\# method and so ordinary C\# rules apply, including the short-circuiting behavior of &&. Consequently, the conditions will be evaluated in the order you wrote them. LINQ to Objects can invoke MyFilter on different input elements, but it cannot change what MyFilter does.

In LINQ to Entities and LINQ to SQL, the Where operator accepts the filter as Expression\<Func\<TSource, bool\>\>. Now, the filter is passed into the Where operator as a data structure that describes the expression. In that case, the LINQ provider will look at the data structure (the "expression tree") and it is up to the LINQ provider to decide how to interpret it.

In LINQ to Entities and LINQ to SQL cases, the expression tree will be translated to SQL. And then it is up to the database server to decide how to execute the query. The server is definitely allowed to reorder the conditions, and it may do even more substantial optimizations. For example, if the SQL table contains an index on one of the columns referenced in the condition, the server can choose to use the index and avoid even looking at rows that don't match that particular condition part.

另外，在Linq to object时，例如list.Find(p =\> p.Contains(condition.Trim()))，这里的Trim就会被调用遍历的次数。根本的原因是Func\<…\>和Expression\<Func\<…\>\>

<https://stackoverflow.com/questions/35012822/trim-function-within-a-where-clause>

## 语法糖

C\#中的语法糖是.NET的"糖"特性，方便程序员的编码，很甜

### Pattern matching

始于C\#7

if (input is int count && count \> 100)

if (input is null)

switch (i)

{

case int n when n \> 100:

...

case Car c:

...

case null:

...

case var j when (j.Equals(10)):

...

default:

...

}

C\#8中做了增强：

#### switch expression

var rgbColor = knownColor switch

{

KnownColor.Red =\> new RGBColor(0xFF, 0x00, 0x00),

KnownColor.Green =\> new RGBColor(0x00, 0xFF, 0x00),

...

\_ =\> throw new ArgumentException(message: "invalid enum value", paramName: nameof(knownColor)),

};

A regular switch does not return a value. This syntax is more concise. There are no case keywords, and the default case was replaced with a discard (_).

也支持元组的deconstruct

#### Property patterns

switch (location)

{

case { State: "MN" }:

}

above case will match when location.State equals MN.

**A special case is the { } pattern, which means: not null.** This pattern can also be used with the is keyword:

if (location is { State: "MN" })

即这里代表的是location != null && location.State = "MN"

C\#9中的增强:

if (person is Student or Teacher)

if (person is not Student)

decimal discount = person switch

{

Student or Teacher =\> 0.1m,

not Student =\> …

\_ =\> 0

};

对于numeric value：

decimal discount = age switch

{

\<= 2 =\> 1,

\< 6 =\> 0.5m,

\< 10 =\> 0.2m,

\_ =\> 0

};

还可以

if (person is Student { Age : \>20 and \<30 })

### Anonymous Type

var v = new { Amount = 108, Message = "Hello" };

Anonymous types support non-destructive mutation in the form of with expressions. This enables you to create a new instance of an anonymous type where one or more properties have new values:

var apple = new { Item = "apples", Price = 1.35 };

var onSale = apple with { Price = 0.79 };//只支持更改值然后作为新instance

### Other（未分类）

#### ?? 判断null

a ?? b 若a为null则b

a ??= b 若a为null则a=b （逻辑空赋值）

逻辑与赋值（&&=）

(x &&= y) 仅仅当x为true时起作用，对其赋值

逻辑或赋值运算符 (x \|\|= y) 是在 x 是 false时对其赋值

#### ?. Null 传导运算符(propagation)

obj?.prop //读取对象属性

obj?.[expr] //同上

func?.(...args) //函数或对象方法的调用

new C?.(...args) //构造函数的调用

连续使用？只要其中有一个为null就会返回null不会继续往下运算。

#### 扩展方法

静态类里的静态方法，并在第一个参数中使用this来指定扩展的类的类型。使用的时候直接用指定的那个类的实例使用即可，就好像给这个类的增加了一个实例方法（实际上编译的时候还是静态方法访问，写的时候这么写而已，即语法糖）

#### Index中的hat运算符 \^

1.  System.Index operator \^(int fromEnd);
2.  var lastItem = array[\^1]; // array[new Index(1, fromEnd: true)]
3.  表示的是从一个集合末尾开始第几个（需要大于等于0）

#### 范围运算符[n..m](Range Operater)

1.  var array = new int[] { 1, 2, 3, 4, 5 };
2.  var slice1 = array[2..\^3]; // array[new Range(2, new Index(3, fromEnd: true))]
3.  var slice2 = array[..\^3]; // array[Range.EndAt(new Index(3, fromEnd: true))]
4.  var slice3 = array[2..]; // array[Range.StartAt(2)]
5.  var slice4 = array[..]; // array[Range.All]
6.  var slice5 = array[2..3]; // 从index=2开始到index=3结束，不包含index=3

<https://docs.microsoft.com/zh-cn/dotnet/csharp/language-reference/proposals/csharp-8.0/ranges>

**这个m，即endIndex也是不包括的，与python中list的slice操作相同**

\^在这里是倒数第三个索引的意思，就是上面hat运算符

#### 匿名变量

Var声明的变量，不必指定"局部"变量的类型，LINQ表达式或foreach语句中，使用其比较方便

string[] words = { "apple", "strwawberry", "grape" };

var query = from word in words

where word[0] == 'g'

select word;

#### 匿名变量解包键值对

能够类似于python的解包

将KeyValuePair\<TKey, TValue\> 解包为 var （key, value）

#### 构造函数

调用base class的 constructor，用:base()，调用自身的constructor，使用:this() 