# web/Dockerfile
FROM nginx:1.27-alpine
# (optionnel) si tu as une conf nginx custom, copie-la :
# COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY ./dist /usr/share/nginx/html
EXPOSE 80
