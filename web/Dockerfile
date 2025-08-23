FROM alpine:3.20 AS build
WORKDIR /out
# page de test (tu remplaceras par ton front plus tard)
RUN printf '<!doctype html><html><head><meta charset="utf-8"><title>Geeks App</title></head><body><h1>Geeks App Web</h1><pre id="out">Loading...</pre><script>fetch("/api/health").then(r=>r.json()).then(j=>document.getElementById("out").textContent=JSON.stringify(j)).catch(e=>document.getElementById("out").textContent=String(e));</script></body></html>' > /out/index.html

FROM nginx:1.27-alpine
# Nginx sur 8080 + proxy /api vers le service docker "api" (port 3000)
RUN printf "server {\n  listen 8080;\n  server_name _;\n  root /usr/share/nginx/html;\n  index index.html;\n  location /api/ {\n    proxy_set_header Host \$host;\n    proxy_set_header X-Real-IP \$remote_addr;\n    proxy_pass http://api:3000/;\n  }\n}\n" > /etc/nginx/conf.d/default.conf
COPY --from=build /out /usr/share/nginx/html
EXPOSE 8080
