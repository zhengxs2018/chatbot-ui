# Chatbot UI

> fork 自 https://github.com/mckaywrigley/chatbot-ui

## 修改变动

做了如下的改动：

1. 从 nextjs 迁移到 astro
2. 优化 openai 的请求
3. 添加密码限制功能

修改失败的改动：

1. 刚接触 astro 框架不久，不知如何处理 i18n，暂时移除
2. 因 @dqbd/tiktoken 部署问题，切换为 tiktoken-node
3. 因环境变量命名问题，先粗暴处理

## 启动项目

```sh
# 修改环境变量
$ cp .env.example .env

# 安装依赖
$ pnpm install

# 启动服务
$ pnpm dev
```

## 部署

1. 运行 `pnpm build` 构建资源
2. 拷贝 dist 到服务器
3. 运行 `node ./dist/server/entry.mjs`

注意：如果是 nginx 推荐以下配置，以保持流式传输的优势

```nginx
server {
  # 其他配置

  # 重要配置
  location ~ ^/v1/(.*)$ {
    # 其他请求头

    proxy_pass http://127.0.0.1:2700; # 你的服务

    proxy_http_version 1.1;
    proxy_set_header Connection $connection_upgrade; # 重要
  }

  location / {
    # 其他请求头

    proxy_pass http://127.0.0.1:2700; # 你的服务
  }
}
```

## License

MIT
