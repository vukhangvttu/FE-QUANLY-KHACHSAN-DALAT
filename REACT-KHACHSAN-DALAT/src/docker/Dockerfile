# Sử dụng image Nginx Alpine (nhẹ)
FROM nginx:alpine


# Xóa cấu hình mặc định của Nginx
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy file cấu hình Nginx
COPY src/docker/nginx.conf /etc/nginx/conf.d/nginx.conf

# Copy thư mục build từ React vào thư mục Nginx
COPY ../../build /usr/share/nginx/html

# Mở port 80
EXPOSE 80

# Khởi chạy Nginx, tạo file env-config.js để truyền biến môi trường vào React lúc runtime
CMD ["/bin/sh", "-c", "echo \"window._env_ = { \\\"VI_TRI\\\": \\\"${VI_TRI:-DALAT}\\\" };\" > /usr/share/nginx/html/env-config.js && exec nginx -g \"daemon off;\""]


#docker build -f src/docker/Dockerfile -t vukhangvttu/fe-khachsan-vt:1.0 .