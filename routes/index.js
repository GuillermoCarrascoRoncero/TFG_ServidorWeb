import express from "express";

/* =========== Rutas HTTP =========== */
export default function (mqttClient) {
  var router = express.Router();
  
  router.post("/moveServo", async (req, res) => {
    const { servo, angle } = req.body;

    if (servo === undefined || angle === undefined) {
      return res.status(400).send("Faltan los parámetros necesarios");
    }
    const topic = `esp8266/moveServo`;
    const message = JSON.stringify({ servo, angle });

    mqttClient.publish(topic, message, (err) => {
      if (err) {
        console.error("Error al publicar MQTT", err);
        return res.status(500).send("Error al mover el servo");
      }
      console.log(`Servo ${servo} movido al ángulo ${angle}`);
      res.send("Servo movido con éxito");
    });
  });

  //GET reset de los servos
  router.get("/reset", async (req, res) => {
    console.log("Reset servos");

    const topic = `esp8266/predefinedMovement/request`;
    const message = JSON.stringify({ movement: "resetBrazo" });

    mqttClient.publish(topic, message, (err) => {
      if (err) {
        console.log("Error al publicar MQTT", err);
        return res.status(500).send("Error al resetear el brazo");
      }
      console.log(`Comando para resetear el brazo enviado con éxito`);
      res.send("Brazo reseteado con éxito");
    });
  });

  //GET bajar brazo
  router.get("/bajarBrazo", async (req, res) => {
    console.log("Bajar brazo");

    const topic = `esp8266/predefinedMovement/request`;
    const message = JSON.stringify({ movement: "bajarBrazo" });

    mqttClient.publish(topic, message, (err) => {
      if (err) {
        console.log("Error al publicar MQTT", err);
        return res.status(500).send("Error al bajar el brazo");
      }
      console.log(`Comando para bajar el brazo enviado con éxito`);
      res.send("Brazo bajado con éxito");
    });
  });

  //GET para agarrar y soltar brazo robotico
  router.get("/agarrarBrazo", async (req, res) => {
    console.log("Agarrar objeto");

    const topic = `esp8266/predefinedMovement/request`;
    const message = JSON.stringify({ movement: "agarrarBrazo" });

    mqttClient.publish(topic, message, (err) => {
      if (err) {
        console.log("Error al publicar MQTT", err);
        return res.status(500).send("Error al agarrar el objeto");
      }
      console.log(`Comando para agarrar enviado con éxito`);
      res.send("Objeto agarrado con éxito");
    });
  });

  router.get("/cancelarBajada", async (req, res) => {
    console.log("Cancelar bajada");

    const topic = `esp8266/predefinedMovement/request`;
    const message = JSON.stringify({ movement: "cancelarBajada" });

    mqttClient.publish(topic, message, (err) => {
      if (err) {
        console.log("Error al publicar MQTT", err);
        return res.status(500).send("Error al cancelar la bajada");
      }
      console.log(`Comando para cancelar la bajada enviado con éxito`);
      res.send("Bajada cancelada con éxito");
    });
  });

  router.get("/soltarBrazo", async (req, res) => {
    console.log("Soltar objeto");

    const topic = `esp8266/predefinedMovement/request`;
    const message = JSON.stringify({ movement: "soltarBrazo" });

    mqttClient.publish(topic, message, (err) => {
      if (err) {
        console.log("Error al publicar MQTT", err);
        return res.status(500).send("Error al soltar objeto");
      }
      console.log(`Comando para soltar el objeto enviado con éxito`);
      res.send("Objeto soltado con éxito");
    });
  });

  router.get("/servoAngles", async (req, res) => {
    console.log("Angulos brazo");

    const topic = `esp8266/servoAngles/request`;
    const message = JSON.stringify({ movement: "servoAngles" });

    mqttClient.publish(topic, message, (err) => {
      if (err) {
        console.log("Error al publicar MQTT", err);
        return res.status(500).send("Error al solicitar los ángulos");
      }
      res.status(200).send("Solicitud de ángulos enviada correctamente");
    });
  });

  return router;
}
