# Servidor Web

El objetivo de este segmento del sistema es desarrollar la plataforma para poder interactuar con el hardware desplegado. Por ello, se diseña una aplicación web, la cual está capacitada para accionar y monitorear las diferentes partes del brazo. Dicha página se aloja en un servidor, el cual se divide entre la parte del front-end y del back-end, que se comunican mediante los protocolos HTTP y WebSocket.
El protocolo de transferencia de hipertexto es usado para el intercambio de consultas con el microprocesador para accionar el brazo. Su ejecución se establece a través de los botones y barras deslizantes de la página web. Por otro lado, la tecnología WebSocket se encarga de la comunicación simultánea para actualizar la interfaz web conforme al estado del brazo robótico. El uso de esta tecnología está pensado para generar un entorno colaborativo, permitiendo ver el accionamiento de las funcionalidades del robot desde varios dispositivos al mismo tiempo. 

## Estructura del código
### Servidor NodeJS

El código principal de este segmento es `app.js`, encargado de inicializar todas las clases y montar el servidor en el puerto indicado. Dentro de la carpeta `routes` se distribuyen las tres clases utilizadas para este proyecto. 

- `routes.js`: Archivo en el que se gestionan las rutas HTTP utilizadas para recibir las peticiones desde la página web. 
- `mqtt.js`: Clase utilizada para la suscripción y conexión con los temas del servidor MQTT. 
- `websocket.js`: Segmento desarrollado para el manejo del intercambio de mensajes de WebSocket. En esta clase se desarrolla la actuación frente a eventos del socket y del broker MQTT para actualizar la interfaz web.

### Página web

Dentro de la carpeta `public/web` se almacenan los tres códigos realizados para la página web. En `index.html` se define el esqueleto inicial de la aplicación dotando a cada control con su función correspondiente. En el caso de `style.css` se define cada una de las variables para el diseño de la página web. Por último, `script.js` define la funcionalidad general de la aplicación, permitiendo la comunicación con el back-end y la actualización de la interfaz.