# 构建阶段
FROM node:trixie-slim AS builder

# 安装 git
RUN apt-get update && apt-get install -y git \
    && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 拉取项目代码
RUN git clone https://github.com/sendevia/website .

# 安装依赖并构建
RUN npm i && npm run docs:build

# 最终阶段
FROM nginx:stable-perl

# 从构建阶段复制 dist 产物到 workdir
COPY --from=builder /app/.vitepress/dist /app/dist

# 暴露端口（80 HTTP 和 443 HTTPS）
EXPOSE 80 443

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
