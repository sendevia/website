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

# 生成自签名证书
RUN mkdir -p /etc/nginx/certs && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/certs/server.key \
    -out /etc/nginx/certs/server.crt \
    -subj "/C=CN/ST=State/L=City/O=Organization/CN=localhost"

# 从构建阶段复制 dist 产物到 workdir
COPY --from=builder /app/.vitepress/dist /app/dist

# 配置 nginx
# 删除默认配置
RUN rm -f /etc/nginx/conf.d/default.conf

# 创建自定义 nginx 配置
RUN cat > /etc/nginx/conf.d/vitepress.conf <<'EOF'
# 日志配置
error_log /var/log/nginx/error.log warn;

# HTTP 重定向到 HTTPS
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    server_name _;
    access_log off;
    return 301 https://$host$request_uri;
}

# HTTPS 服务器配置
server {
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    
    server_name _;
    access_log off;
    
    # SSL 证书配置
    ssl_certificate /etc/nginx/certs/server.crt;
    ssl_certificate_key /etc/nginx/certs/server.key;
    
    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # 设置根目录指向构建产物
    root /app/dist;
    
    # VitePress SPA 路由配置
    location / {
        try_files $uri $uri/ /index.html;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # 静态资源缓存配置
    location ~* \.(js|css|woff2|png|jpg|jpeg|gif|svg|ico)$ {
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
    
    # 禁用缓存 HTML 文件
    location ~* \.html$ {
        expires off;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
EOF

# 验证 nginx 配置
RUN nginx -t

# 暴露端口（80 HTTP 和 443 HTTPS）
EXPOSE 80 443

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
