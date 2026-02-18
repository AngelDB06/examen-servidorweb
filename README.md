# Despliegue de servidor de aplicaciones

---

## 1. Creación instancia EC2
  Lanzamos una instancia con las siguientes características:

  - Grupo de seguridad permitiendo tráfico HTTP y HTTPS 
  - Creamos un nuevo par de claves para los secrets de Github
  - Utilizaremos Ubuntu Server 24.04

## 2. Preparar la máquina

  Para preparar nuestra máquina para nuestro servidor de aplicaciones ejecutaremos los siguientes comandos:

```bash

Actualizaciones:
sudo apt update && sudo apt upgrade

Instalar y habilitar docker:

sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ${USER}
sudo apt install docker-compose-v2 -y

```

Con esto ya tendríamos nuestra máquina lista para hacer nuestro certificado.


## 3. Certificado de seguridad

Para el certificado de seguridad necesitaremos lo siguiente:

- IP Pública de nuestra instancia
- Un dominio

Contando con que tengamos esto procederemos a entrar en la configuración DNS de nuestro dominio y configuraremos los únicos dos registros 'A' que debe haber en nuestro dominio:

- A, Nombre del HOST: @, Valor: 'IP PUCLICA'
- A, Nombre del HOST: www, Valor: 'IP PUCLICA'

Una vez realizado este paso volveremos a nuestra instancia a ejecutar los siguientes comandos siguiendo los pasos correspondientes:

```bash
sudo apt install certbot -y

sudo certbot certonly --standalone -d 2dawangeldb.com
```

Con esto ya tendríamos nuestro servidor securizado para cuando montemos el servidor de aplicaciones.

## 4. Desplegar proyecto

Lo único que faltaría por hacer (teniendo en cuenta que el proyecto ya esté en tu repositorio de Github) es configurar los secretos de Github:

- HOST: ip pulica de la instancia
- USERNAME: si hemos usado Ubuntu Server será "ubuntu"
- KEY: contenido COMPLETO de la clave PEM.


Una vez configurados los secrets lanzamos el workflow de actions y él junto con el docker compose harán el resto. 

En este caso nuestro workflow de Actions se conecta a la instancia EC2 con nuestros secrets del repositorio y copia nuestro proyecto en el home del usuario dentro de una carpeta llamada 'app'.

Para desplegarlo se asegurará de que no hay ningun servidor web funcionando en ese momento para que no se pisen con el que se va a crear, y ejecuta el docker compose.

El docker compose en este caso creara un contendor con una imagen nginx el cual será accesible por los puertos 80 y 443 (HTTP y HTTPS), posteriormente pasará la parte del frontend a la carpeta donde se alojará y mostrará la página web, hará lo mismo con nuestra configuracion de nginx personalizada para nuestro certificado. Y el contenedor correrá por su propia red de docker.