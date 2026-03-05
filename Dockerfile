# 构建阶段
FROM node:trixie-slim AS builder

# 安装 git
RUN apt-get update && apt-get install -y git \
    && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 拉取项目代码
RUN git clone https://github.com/sendevia/website . --depth=1

# 安装依赖并构建
RUN npm i && npm run docs:build

# 最终阶段
FROM caddy:alpine AS final

# 从构建阶段复制 dist 产物到工作目录
COPY --from=builder /app/.vitepress/dist /app

# 复制Caddyfile配置文件
COPY Caddyfile /etc/caddy/Caddyfile

# 启动Caddy服务器
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
