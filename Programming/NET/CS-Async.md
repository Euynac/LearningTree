# C# 异步编程

## 多线程编程

### use in Shared resource

#### lock

Simple to use, wrapper on monitor, locks across threads in an AppDomain.

#### Mutex

##### unnamed mutex

similar to lock except locking scope is more and it's across AppDomain in a process.

##### Named mutex

locking scope is even more than unnamed mutex and it's across process in an operating system.

比如可以检测是否同时运行了两个一模一样的程序

#### ReaderWriterLockSlim

分为读写锁，当读操作次数显著大于写时，使用该锁进行读写分离锁，相比简单的lock可以加大效率。

无法在async中使用，因为await的原理可能导致获取锁和释放锁的不是同一个线程。

#### SemaphoreSlim

async method中最好使用该锁，支持异步等待，替代lock。

SemaphoreSlim can be released from any thread, while lock is "owned" exclusively by the thread that locked it

### Double-Check Locking

<https://www.jetbrains.com/help/rider/ReadAccessInDoubleCheckLocking.html>

在java中似乎被认为是错误写法。C\#中暂无定论

#### volatile关键字

1\. 多个线程同时访问一个变量，CLR为了效率，允许每个线程进行本地缓存，这就导致了变量的不一致性。volatile就是为了解决这个问题，volatile修饰的变量，不允许线程进行本地缓存，每个线程的读写都是直接操作在共享内存上，这就保证了变量始终具有一致性。

volatile修饰的变量对所有线程都是可见的，是指当一个线程修改了这个变量的值，新值对于其他线程来说可以立即得知。而普通变量做不到这一点，普通变量的值在线程间传递均需要通过主内存来完成，例如，线程A修改一个普通变量的值，然后向主内存进行回写，另一条线程B在线程A回写完成之后，再从主内存中进行读取操作，新变量的值才会对线程B可见。

2\. 禁止重排序，保证写操作happen before每一个之后的读操作，从而实现了有序性

CPU为了提高执行效率，在执行机器指令时可能会发生乱序的情况。在单核CPU中代码顺序与机器指令顺序的不一致不会导致结果变化。但是在多核CPU中则会出现数据不安全的情况。主要是因为多个CPU在并发情况下处理数据时，编译器对机器指令进行了顺序调优，一个线程获取的值可能为另一个线程乱序执行得出的值。（一句代码可能会编译出多句机器指令）

使用volatile可以禁止指令重排序。转换成机器指令的话，会发现有一个Lock前缀，就是对它的读写操作加了"内存屏障"，对这个变量的所有操作都执行完后，再同步到内存中，期间不允许其他的指令执行，所以说是形成了内存屏障。

volatile确实或多或少影响性能，但一般来说针对一个小变量会比lock快一点

其他类型（包括 double 和 long）无法标记为 volatile，因为对这些类型的字段的读取和写入不能保证是原子的。 若要保护对这些类型字段的多线程访问，请使用 Interlocked 类成员或使用 lock 语句保护访问权限。

volatile只是保证其不被编译优化，只保证任何时候你读取到的都是最新值，但并不会保证线程安全性。 比如 ： i被volatile修饰，具有原子，但是i++这个操作不是原子性。你在多线程中使用就不会得到预期的效果。而Interlock.Increment是可以保证类似i++这样的操作的。

即即使给i标注volatile，i++依然会出现并行错误，因为volatile 实际上是编译为 Volitale.Read和 Volatile.Write，i++是有两个原子性的操作，即先原子性地读i的值，再给i加一，最后原子性地写入i。需要使用Interlock.Increment(i)，这样读i的时候就lock了i，加了并写完i才解锁，读和写是发生在一起。

### Thread.Sleep和Thread.SpinWait
[C# - Thread.Sleep(1); takes more than 1 milisecond - 16ms](https://peterdaugaardrasmussen.com/2017/04/30/thread-sleep-1-is-15-6ms/)
A quick look around the internet and I found several articles that states that `Thread.Sleep(1);` takes up **15.6ms**. As this is the lowest a `thread.sleep` call takes (when using defaults). This is due to Thread.Sleep being affected by windows clock interrupt rate. The default is 64 times per second and (1000/64) is **15.625ms**.

### async/await 异步方法

##### async

asynchronous [eɪˈsɪŋkrənəs]

| adj. | 不同时存在(或发生)的; 非共时的; |
|------|---------------------------------|

用`async`来修饰一个方法，表明这个方法是异步的，声明的方法的返回类型必须为：`void`或`Task`或`Task<TResult>`。方法内部必须含有`await`修饰的方法，如果方法内部没有`await`关键字修饰的表达式，哪怕函数被`async`修饰也只能算作同步方法，执行的时候也是同步执行的。

`void`类型的`async`方法**是无法被等待的**，可以直接更改返回值类型为`Task`，也不用返回什么，就可让它变为可等待的`async`方法。`async`里面的返回值不需要自己包装为`Task<TResult>`这种返回值，直接`return` `TResult`然后返回值类型改为`Task<TResult>`即可。

##### await

被await修饰的只能是Task或者Task\<TResult\>类型，通常情况下是一个返回类型是Task/Task\<TResult\>的方法，当然也可以修饰一个Task/Task\<TResult\>变量，await只能出现在已经用async关键字修饰的异步方法中。

await并不是会自己建立线程，而是碰到建立线程的语句。

比如主线程调用异步方法，主线程是t1，然后若是调用的返回值是void的异步方法（即没有await），这时候执行完异步方法直到await一个新线程耗时操作之后会回到t1线程执行异步方法下面的语句。

await是能够智能等待一个Task线程执行完毕并获取Task的返回值的，比如这时候await之前的语句是在调用它这个异步方法的线程t1执行的，t1会不断进入查看是否创建了新线程，直到碰到新建线程t2操作后比如Task.Run()会开始等待这个线程执行完毕，然后await后面的语句暂时不执行，t1会直接回到最开始调用异步方法之后（没有await的调用异步方法）的语句继续执行（与t2同步）。当新线程的t2耗时操作完成后，这时会通知t1线程，t1线程将会从最后的await后面的语句开始执行，递归的返回，直到执行完毕，这里的递归语句都可以视作为异步函数的回调操作。所以除了创建新线程的操作，其他操作都是在t1线程上工作的，所以若t1是UI线程，使用await则不会导致跨线程访问UI线程资源。

**如果不想await之后会回到原来的线程t1执行，需要await那条语句之后即Async方法后面使用ConfigureAwait(false)，通知异步状态机不执行线程同步，然后后面的代码则不会返回原线程执行**

**ConfigureAwait(true)是在UI线程上使用的，需要让它回到UI线程进行执行。而ConfigureAwait(false)是在不需要这种情况下进行，可以稍微提高性能。**

<https://www.cnblogs.com/zhaoshujie/p/11192036.html>

但实际测试发现无论怎么样都是await中的t2线程执行后续，并不会通知t1线程到await后面。后面了解原因发现，console application和 wpf/winform程序的处理不同：

await will capture current synchronization context (SynchronizationContext.Current) and post continuation (everything after await) to that context (unless you use ConfigureAwait(false)). If there is no synchronization context, like in console application (your case) - by default continuation will be scheduled to thread pool thread. Your main thread is not thread pool thread, so you will never return to it in code you posted.

Note that every synhronization context implementation can decide what to do with callbacks posted to it, it does not necessary for it to post callback to single thread (like WPF\\WinForms synchronization contexts do). So even with synchronization context you are not guaranteed to "return back to caller thread".

### Task和TaskFactory

```cs
//Task.Factory.StartNew 可以设置线程是长时间运行，这时线程池就不会等待这个线程回收
Task.Factory.StartNew(() =>
{
    for (int i = 0; i < 100; i++)
    {
        var foo = 2;
    }
    Console.WriteLine("进行 线程" + Thread.CurrentThread.ManagedThreadId);
}, TaskCreationOptions.LongRunning);
//Task.Run(foo)可以认为是对Task.Factory.StartNew的封装，使用了默认参数，就相当于这个：
Task.Factory.StartNew(foo,
    CancellationToken.None, TaskCreationOptions.DenyChildAttach, TaskScheduler.Default);
``` 