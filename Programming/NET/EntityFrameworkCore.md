
# 问题

## ABP仓储层

### UpdateManyAsync

如果开启跟踪，UpdateMany不论怎么传入都将将所有改变的实体进行保存。

```cs
var list = repo.GetQueryableAsync(); //.. where .. ToList();
list.Foreach(p=>p.Name = "XX");
repo.UpdateManyAsync(list.Take(20));
```

仍会将所有保存。
