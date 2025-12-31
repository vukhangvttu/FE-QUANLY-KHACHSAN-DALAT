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

# Khởi chạy Nginx
CMD ["nginx", "-g", "daemon off;"]