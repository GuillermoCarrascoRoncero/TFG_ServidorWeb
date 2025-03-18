import express, { response } from "express";
import http from "http";
import logger from "morgan";
import router from "./routes/index.js";
import path from "path";
import { type } from "os";
import os from "os";
import { setupMQTT } from "./routes/mqtt.js";
import {setupWebSocket} from "./routes/websocket.js"

//Configuracion inicial del servidor web
const PORT = 4000;
const app = express();
const server = http.createServer(app);
const __dirname = new URL(".", import.meta.url).pathname;

//Configuracion del broker MQTT
const mqttClient = setupMQTT();

//Configuracion del WebSocket
setupWebSocket(server,mqttClient);

app.use(express.static(path.join(__dirname, "public/web")));
app.use(express.json());
app.use(logger("dev"));

//Rutas del archivo router
app.use("/", router(mqttClient));

server.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});

export default app;