# C# 插件编程

## 合并dll

使用Costura.Fody包，build dll的library后会生成FodyWeavers.xml文件

然后将想要合并的dll写入，如：

\<Costura IncludeAssemblies='Fare' /\>

按照dll名写入，dll名可以从Packages-\>包-\>Compile Time Assembilies 看到 