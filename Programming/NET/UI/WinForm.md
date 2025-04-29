# WinForm

## 界面

Controls in Windows Forms are bound to a specific thread and are not thread safe. Therefore, if you are calling a control's method from a different thread, you must use one of the control's invoke methods to marshal the call to the proper thread.

所以界面都用一个UI主线程来工作，当Background线程需要去更新界面时候，需要使用`Control.InvokeRequired`去检查当前线程是否可以操作该控件，如果不是UI线程，则需要使用`Invoke`,`BeginInvoke`等方法去回到UI线程去执行方法。

[Control.InvokeRequired Property (System.Windows.Forms) \| Microsoft Docs](https://docs.microsoft.com/en-us/dotnet/api/system.windows.forms.control.invokerequired?redirectedfrom=MSDN&view=windowsdesktop-6.0#System_Windows_Forms_Control_InvokeRequired)

一个界面如果被创建，则说明`Handle`也被创建，`IsHandleCreated`可以简单理解为该控件已经被创建。如果该控件还没有`Handle`，Background线程也不能去创建`Handle`（即创建界面）。

## 启用控制台调试

https://www.cnblogs.com/cyberarmy/p/7644179.html

`WinForm`/`WPF`启用控制台调试

## 双层窗体

https://blog.csdn.net/arrowzz/article/details/70183494

https://www.haolizi.net/example/view_24546.html

## WinForm中控件与背景透明

https://www.cnblogs.com/chengxiaohui/articles/1921608.html

要实现C# `WinForm`中的控件与背景的透明，可以通过设置控件的`BackColor`属性为`Transparent`，同时设置其父控件。因为在C#中，控件的透明指对父窗体透明。  
如果不设置`Parent`属性，那么控件将只对`Form`透明，显示的时候都会把`Form`的背景色（默认为`Control`）重刷一遍作为自己的背景。  
在控件比较多的情况下，可以使用`Panel`控件，将某一组的控件都放到`Panel`中，然后只对此`panel`设置背景透明即可，则其他控件都跟着实现了背景透明。  
如，现有一`PictureBox`控件，十多个`Label`以及`Button`，那么只将这些`Label`和`Button`放入`Panel`中。同时在`Form_Load`事件中加入如下代码即可实现背景透明：  

```csharp
this.picturebox1.SendToBack();//将背景图片放到最下面  
this.panel1.BackColor = Color.Transparent;//将Panel设为透明  
this.panel1.Parent = this.picturebox1;//将panel父控件设为背景图片控件  
this.panel1.BringToFront();//将panel放在前面  
```

以上代码即可实现所有的控件都对`PictueBox`背景图片透明

## 解决按钮闪动

```csharp
protected override CreateParams CreateParams
{
    get
    {
        CreateParams cp = base.CreateParams;
        cp.ExStyle |= 0x02000000;
        return cp;
    }
}
```

## 取消标题栏后主界面拖动主界面能移动

```csharp
[DllImport("user32.dll")]
public static extern bool ReleaseCapture();

[DllImport("user32.dll")]
public static extern bool SendMessage(IntPtr hwnd, int wMsg, int wParam, int lParam);

public const int WM_SYSCOMMAND = 0x0112;
public const int SC_MOVE = 0xF010;
public const int HTCAPTION = 0x0002;

private void SheetChanger_MouseDown(object sender, MouseEventArgs e)
{
    if (e.Button == MouseButtons.Left)
    {
        ReleaseCapture();
        SendMessage(this.Handle, WM_SYSCOMMAND, SC_MOVE + HTCAPTION, 0);
    }
}
```