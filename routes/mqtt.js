import mqtt from "mqtt";
import si from "systeminformation";

//Configuración MQTT direccion y topics
const mqtt_url = "mqtt://192.168.1.77:1883";
const topics = [
  "esp8266/predefinedMovement/response",
  "esp8266/servoAngles/response",
  "esp8266/startArm",
];

//Inicialización MQTT
function setupMQTT() {
  const mqttClient = mqtt.connect(mqtt_url);

  mqttClient.on("connect", () => {
    console.log("Conectado al broker MQTT");

    //Suscripcion a los topics
    topics.forEach((topic) => {
      mqttClient.subscribe(topic, (err) => {
        if (!err) {
          console.log(`Suscrito al topic ${topic}`);
        } else {
          console.error(`Error al suscribirse al topic ${topic}`, err);
        }
      });
    });

    sendSystemMetrics(mqttClient);
  });

  mqttClient.on("error", (err) => {
    console.error(`Error conectarse al broker`, err);
  });

  return mqttClient;
}

// Función para obtener el uso de CPU, memoria y usuarios conectados
async function getSystemMetrics() {
  try {
    const cpu = await si.currentLoad();
    const memoryUsage = process.memoryUsage();
    const memoryUsed = memoryUsage.rss;
    const memoryUsedMB = Math.round((memoryUsed / 1024 / 1024) * 100) / 100;
    const totalUsersWS = global.WS_CLIENTS ? global.WS_CLIENTS.size : 0;
    
    return {
      cpuUsage: cpu.currentLoad,
      memoryUsed: memoryUsedMB,
      totalUsers: totalUsersWS,
    };
  } catch (error) {
    console.error("Error al obtener métricas del sistema:", error);
    return null;
  }
}

//Publicacion de las metricas cada 30 segundos
function sendSystemMetrics(mqttClient) {
    setInterval(async () => {
        const metrics = await getSystemMetrics();
      
        if (metrics) {
          const topic = "system/metrics";
          const message = JSON.stringify(metrics);
      
          mqttClient.publish(topic, message, (err) => {
            if (err) {
              console.error("Error al publicar MQTT, metrics:", err);
            } else {
              console.log(`Mensaje enviado a MQTT: ${message}`);
            }
          });
        }
      }, 30000);
}

export { setupMQTT };