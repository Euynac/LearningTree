# Git使用

## 开始新项目

拿到git地址和权限后，选择本地电脑中一个文件夹，使用 `git init` 在当前目录新建一个`.git`目录，然后进行`git pull` 拉取代码。

### 分支

```bash
git branch -a #查看本地和远程的所有分支
git branch -r #查看远程分支
git checkout -b dev origin/dev #创建本地分支dev并关联到远程origin/dev分支
git checkout dev #切换到dev分支进行开发
git branch -vv #查看本地分支和远程分支的关联关系
```

### 将本地代码关联到远程分支

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/Euynac/IntelligentTowerUI.git
git push -u origin main
```

### 提交


```bash
git diff # 然后查看冲突的原因
git status # 查看当前修改以及新增的未track的
git add . # 提交到缓冲区，未track的也track
git commit -m 描述 # m是message，提交到本地仓库
git push origin 本地分支名:远程分支名 # 提交到远程仓库。本地分支名写HEAD是指当前本地工作的分支指针
```


### 设置代理

```bash
git config --global http.proxy # 查看当前设置的代理
git config --global http.proxy socks5://127.0.0.1:1080 # 设置代理为sock5（可换为http等），设置后同样作用于vs的gi
git config --global --unset http.proxy # 移除代理
```


### Git提交时用错了用户名

[GIT提交时用错了用户名-hanwei_1049-ChinaUnix博客](http://blog.chinaunix.net/uid-13746440-id-5586437.html)

```bash
# 1. configure your new username and email
# change username 
git config username.user <username>
# change email
git config username.email <email>

#2 run this command
git commit --amend -C HEAD --reset-author

#3 run this command
git push --force
```

### .gitingore不生效

因为如果已经先前加入了git管理的文件，则再添加`.gitingore`则无效，仍然会被追踪changes。

可以使用

`git rm --cached filename` 删除追踪的缓存文件，来结束追踪。

如果缓存太多要删除的，可以使用

`git rm -r --cached .` 全部删除再 `git add .`加回tracing，这时候则会遵守.gitingore的规则去添加tracing。

最后`git commit -m ".gitignore is now working"`

### Fork后使用原项目未merge的pull request 应用到自己Fork的分支

[stackoverflow.com/questions/6022302/how-to-apply-unmerged-upstream-pull-requests-from-other-forks-into-my-fork](https://stackoverflow.com/questions/6022302/how-to-apply-unmerged-upstream-pull-requests-from-other-forks-into-my-fork)

You can also do this via the github webpage.

I assume, you should have already a fork (MyFork) of the common repo (BaseRepo) which has the pending pull request from a fork (OtherFork) you are interested in.

1.  Navigate to the fork (OtherFork) which has initiated the pull request which you like to get into your fork (MyFork)
2.  Go to the pull requests page of OtherFork
3.  Click new pull request
4.  The pending pull request(s) should be offered. Remember to select proper OtherFork branch too. Select on the left side as the base fork your fork (MyFork) (**IMPORTANT**).
5.  Now the option of View pull request should change to Create pull request. Click this.

Now you should have a pending pull request in your fork (MyFork), which you can simply accept.

# 开源协议

![图片包含 日程表 描述已自动生成](../attachments/17120b1324d66fe52e161baeafee27c9.png)![图示 中度可信度描述已自动生成](../attachments/4b33b7e7acddea591e74cbea61b93da4.png)