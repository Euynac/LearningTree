# Nginx


## 常见问题

### 配置location后不生效，仍路由到前端页面

可能是没有清理缓存，前端页面直接解决了路由请求。需要在`F12`中`Application-Storage`清理当前页面缓存