# Etapa 1: Construcción de la app Angular
FROM node:18-alpine as build

WORKDIR /frontendProyecto

# Copia package.json y package-lock.json para instalar dependencias primero
COPY package*.json ./

RUN npm install

# Copia todo el proyecto
COPY . .

# Construye la app en modo producción
RUN npx ng build --configuration=production

# Listar el contenido del directorio dist para verificar que está donde esperamos
RUN ls -la /frontendProyecto/dist
RUN ls -la /frontendProyecto/dist/frontend-proyecto

# Etapa 2: Servir la app con Nginx
FROM nginx:alpine

# Borra contenido default de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia el build desde la etapa anterior
COPY --from=build /frontendProyecto/dist/frontend-proyecto/browser /usr/share/nginx/html

COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
