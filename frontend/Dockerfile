# Frontend PupiGo: build de Vite servido por Nginx, que ademas hace de proxy hacia el backend.
# Contexto de build: carpeta frontend/.
#   docker build -t pupigo-frontend ./frontend

# ---- Etapa 1: build ----
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Ruta relativa: el navegador llama a /api en el mismo host y Nginx la reenvia al backend.
# Asi la imagen sirve igual en localhost y en la IP publica de EC2 (que cambia en AWS Academy).
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
# Llave del navegador para Google Maps (opcional; vacia = mapa SVG de respaldo).
ARG VITE_GOOGLE_MAPS_API_KEY=
ENV VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY}
RUN npm run build

# ---- Etapa 2: runtime ----
FROM nginx:stable-alpine
LABEL org.opencontainers.image.version="2.0.0"
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
