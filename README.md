# MQTT Manager v1.0.0
简单的MQTT Web客户端

由于协议问题，部署网站如果是 https协议，则只能连接wss协议(加密的Websocket连接)的MQTT服务器
，如果是http协议，则两者都可连接

## 项目部署
```
npm install
```

### 开发模式运行
```
npm run serve
```

### 为生产环境打包
```
npm run build
```

### 代码规范检查
```
npm run lint
```
