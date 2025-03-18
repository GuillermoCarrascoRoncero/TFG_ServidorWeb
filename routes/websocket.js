import { WebSocketServer } from "ws";
import fs from "fs";

const web_status_path = "./public/logs/web_status.json";

//Inicialización de WebSocket
function setupWebSocket(server, mqttClient) {
  const wss = new WebSocketServer({ server });
  wss.on("connection", (ws) => {
    console.log("WebSocket conectado");
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === "buttonAction") {
          handleButtonAction(wss, data);
        }
        if (data.type === "sliderUpdate") {
          sendWebSocket(wss, data);
        }
      } catch (error) {
        console.log("Error al procesar mensaje WebSocket:", error);
      }
    });
    ws.on("close", () => {
      console.log("WebSocket desconectado");
    });
    ws.on("error", (error) => {
      console.error("Error en WebSocket:", error);
    });
  });
  global.WS_CLIENTS = wss.clients;
  handleMQTTMessages(mqttClient, wss);
}

//Envío de mensajes al WebSocket
function sendWebSocket(wss, message) {
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

//Manejo del estado de los botones
function handleButtonAction(wss, message) {
  const action = message.action;
  let status = {
    controlState: "disabledNormal",
    lowerButtonState: action !== "lowerButton" ? "visible" : "hidden",
  };

  sendWebSocket(wss, { type: "interfaceUpdate", data: status });
  updateStatusCache(web_status_path, status);
}

//Manejo mensajes recibidos MQTT
function handleMQTTMessages(mqttClient, wss) {
  mqttClient.on("message", (topic, message) => {
    try {
      const parsedMessage = JSON.parse(message.toString());
      if (topic == "esp8266/servoAngles/response") {
        console.log("Ángulos recibidos /servoAngles:", message.toString());
        handleServoAnglesResponse(wss, parsedMessage);
      } else if (topic == "esp8266/predefinedMovement/response") {
        console.log(
          "Ángulos recibidos /predefinedMovement/response:",
          message.toString()
        );
        handlePredefinedMovementResponse(wss, parsedMessage);
      } else if (topic == "esp8266/startArm") {
        console.log("Brazo robotico iniciado:", message.toString());
        handleStartArm(wss, parsedMessage);
      }
    } catch (error) {
      console.error("Error al procesar mensajes de MQTT", error);
    }
  });
}

/* ============== Manejo de los mensajes recibidos ============== */
function handleServoAnglesResponse(wss, parsedMessage) {
  fs.readFile(web_status_path, function (error, data) {
    if (error) {
      console.error("Error al leer web_status", error);
      return;
    }
    const status = JSON.parse(data);
    const response = {
      angles: parsedMessage.angles,
      controlState: status.controlState,
      lowerButtonState: status.lowerButtonState,
    };
    sendWebSocket(wss, { type: "interfaceUpdate", data: response });
  });
}

function handlePredefinedMovementResponse(wss, parsedMessage) {
  let updatedMessage = {
    ...parsedMessage,
    controlState:
      parsedMessage.movement !== "bajarBrazo"
        ? "enabledNormal"
        : "enabledLower",
    lowerButtonState:
      parsedMessage.movement !== "bajarBrazo" ? "visible" : "hidden",
  };
  sendWebSocket(wss, { type: "interfaceUpdate", data: updatedMessage });
  const status = {
    controlState: updatedMessage.controlState,
    lowerButtonState: updatedMessage.lowerButtonState,
  };
  updateStatusCache(web_status_path, status);
}

function handleStartArm(wss, parsedMessage) {
  const updatedMessage = {
    ...parsedMessage,
    controlState: "enabledNormal",
    lowerButtonState: "visible",
  };
  sendWebSocket(wss, { type: "interfaceUpdate", data: updatedMessage });
  const status = {
    controlState: updatedMessage.controlState,
    lowerButtonState: updatedMessage.lowerButtonState,
  };
  updateStatusCache(web_status_path, status);
}

//Escritura sobre el archivo web_status.json
function updateStatusCache(path, status) {
  fs.writeFile(path, JSON.stringify(status), (error) => {
    if (error) {
      console.log("Error al escribir en el archivo web_status", error);
    }
  });
}

export { setupWebSocket };
