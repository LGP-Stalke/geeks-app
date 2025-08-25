FROM nginx:1.27-alpine

# Nginx: proxy /api vers l'API
RUN printf "server {\n  listen 80;\n  server_name _;\n  root /usr/share/nginx/html;\n  index index.html;\n  location /api/ {\n    proxy_set_header Host \$host;\n    proxy_set_header X-Real-IP \$remote_addr;\n    proxy_pass http://api:3000/;\n  }\n}\n" > /etc/nginx/conf.d/default.conf

# Ta page
COPY index.html /usr/share/nginx/html/index.html

EXPOSE 80
