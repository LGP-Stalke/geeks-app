# Étape build triviale: créer une page index.html
FROM alpine:3.20 AS build
RUN mkdir -p /out && \
    printf '<!doctype html><html><head><meta charset="utf-8"><title>Geeks App</title></head><body><h1>Geeks App Web OK</h1><p>Build CI/CD réussi.</p></body></html>' > /out/index.html

# Étape runtime: servir avec Nginx
FROM nginx:1.27-alpine
COPY --from=build /out /usr/share/nginx/html
# On écoute sur 8080 pour éviter les conflits
RUN printf "server { listen 8080; root /usr/share/nginx/html; index index.html; location / { try_files \$uri /index.html; } }" > /etc/nginx/conf.d/default.conf
EXPOSE 8080
