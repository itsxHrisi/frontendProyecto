FROM nginx:alpine

# Copia los archivos estáticos Angular
COPY . /usr/share/nginx/html

# Reemplaza la config por defecto con la nuestra
COPY default.conf /etc/nginx/conf.d/default.conf
