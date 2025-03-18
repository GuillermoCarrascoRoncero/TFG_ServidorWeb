//Mapa con los servos
const servoIndexMap = {
  base: 0,
  shoulder: 1,
  elbow: 2,
  wristTilt: 3,
  wristRotation: 4,
  claw: 5,
};

//Configuracion WebSocket
const wss = new WebSocket("ws://192.168.1.77:4000");

wss.onopen = () => {
  console.log("Conectado al servidor WebSocket");
};

wss.onmessage = (event) => {
  const message = JSON.parse(event.data);

  //Actualiza los slider con los angulos recibidos de la peticion del onload
  if (message.type === "interfaceUpdate") {
    const lowerButtonState = message.data.lowerButtonState;
    const controlState = message.data.controlState;

    //Compruba que el mensaje contenga angles (buttonAction no la envia)
    if (message.data.angles != undefined) {
      const angles = message.data.angles;
      updateSliders(angles);
    }
    updateButtons(lowerButtonState);
    if (controlState == "disabledNormal") {
      disableControls(true);
    } else if (controlState == "enabledNormal") {
      disableControls(false);
    } else {
      enableLowerControl();
    }
  } else if (message.type === "sliderUpdate") {
    const { servo, angle } = message.data;
    const servoName = Object.keys(servoIndexMap).find(
      (key) => servoIndexMap[key] === servo
    );
    if (servoName) {
      const slider = document.getElementById(`${servoName}Slider`);
      slider.value = angle;
      document.getElementById(`${servoName}Value`).textContent = `${angle}°`;
    }
  } else {
    console.error("Datos de ángulos inválidos recibidos:", message);
  }
};

wss.onclose = () => {
  console.log("Conexión WebSocket cerrada");
};

wss.onerror = (error) => {
  console.error("Error en WebSocket:", error);
};

//Funcion para actualizar los slider
function updateSliders(angles) {
  // Actualizar los sliders con los ángulos recibidos
  Object.keys(servoIndexMap).forEach((servoName, index) => {
    const angle = angles[index];
    document.getElementById(`${servoName}Value`).textContent = `${angle}°`;
    document.getElementById(`${servoName}Slider`).value = angle;
  });
}

//Funcion para actualizar los botones
function updateButtons(lowerButton) {
  if (lowerButton == "hidden") {
    document.getElementById("lowerButton").classList.add("hidden-button");
    document
      .getElementById("lowerButtonOptions")
      .classList.remove("hidden-button");
  } else {
    document
      .getElementById("lowerButtonOptions")
      .classList.add("hidden-button");
    document.getElementById("lowerButton").classList.remove("hidden-button");
  }
}

//Funcion para deshabilitar y habilitar los sliders y botones
function disableControls(disable) {
  const sliders = document.querySelectorAll(".slider");
  const buttons = document.querySelectorAll(".button-container button");

  sliders.forEach((slider) => {
    slider.disabled = disable;
  });

  buttons.forEach((button) => {
    button.disabled = disable;
  });
}

//Activa solo los botones Agarrar y Cancelar tras pulsar el boton de Bajar
function enableLowerControl() {
  const sliders = document.querySelectorAll(".slider");
  const buttons = document.querySelectorAll(".button-container button");

  sliders.forEach((slider) => {
    slider.disabled = true;
  });

  buttons.forEach((button) => {
    if (button.id == "gripButton" || button.id == "cancelMovementButton") {
      button.disabled = false;
    } else {
      button.disabled = true;
    }
  });
}

// Envía el valor del slider en tiempo real a todos los dispositivos conectados
function syncSlider(id, slider) {
  const servoIndex = servoIndexMap[id];

  if (wss.readyState == wss.OPEN) {
    wss.send(
      JSON.stringify({
        type: "sliderUpdate",
        data: { servo: servoIndex, angle: slider.value },
      })
    );
  }
}

//Throttle
function throttle(func, delay) {
  let timer = 0;
  return function () {
    const now = Date.now();
    if (now - timer >= delay) {
      timer = now;
      func.apply(this, arguments);
    }
  };
}

// Solicitud para mover un servo del brazo con el range slider
function moveServo(id, slider) {
  document.getElementById(`${id}Value`).textContent = `${slider.value}°`;

  const servoIndex = servoIndexMap[id];

  axios
    .post("/moveServo", {
      servo: servoIndex,
      angle: slider.value,
    })
    .then((response) => {
      console.log(`Servo ${id} actualizado con éxito:`, response.data);
    })
    .catch((error) => {
      console.error(`Error al actualizar el servo ${id}:`, error);
    });
}
//Mover servo con rate limit
const throttledMoveServo = throttle((id, slider) => moveServo(id, slider), 200);

// Solicitud reset a la posicion original del brazo
function resetServo() {
  axios
    .get(`/reset`)
    .then((response) => {
      console.log("Mensaje RESET enviado al microcontrolador");
      if (wss.readyState == wss.OPEN) {
        wss.send(JSON.stringify({ type: "buttonAction", action: "resetButton" }));
      }
    })
    .catch((error) => {
      console.error("Error al enviar mensaje RESET:", error);
    }); 
}

// Solicitud para bajar el brazo
function lowerArm() {
  axios
    .get(`/bajarBrazo`)
    .then((response) => {
      console.log("Mensaje BAJAR enviado al microcontrolador");
      
      if (wss.readyState == wss.OPEN) {
        wss.send(JSON.stringify({ type: "buttonAction", action: "lowerButton" }));
      }
    })
    .catch((error) => {
      console.error("Error al enviar mensaje BAJAR", error);
    });  
}

// Solicitud al brazo recoger un objeto
function gripArm() {
  axios
    .get(`/agarrarBrazo`)
    .then((response) => {
      console.log("Mensaje AGARRAR enviado al microcontrolador");
      
      if (wss.readyState == wss.OPEN) {
        wss.send(JSON.stringify({ type: "buttonAction", action: "gripButton" }));
      }
    })
    .catch((error) => {
      console.error("Error al enviar mensaje AGARRAR", error);
    });

}

//Solicitud para cancelar bajada
function cancelMovement() {
  axios
    .get(`/cancelarBajada`)
    .then((response) => {
      console.log("Mensaje CANCELAR enviado al microcontrolador");
      
      if (wss.readyState == wss.OPEN) {
        wss.send(
          JSON.stringify({
            type: "buttonAction",
            action: "cancelMovementButton",
          })
        );
      }
    })
    .catch((error) => {
      console.error("Error al enviar mensaje CANCELAR", error);
    });
}

// Solicitud al brazo que suelte el objeto
function releaseArm() {
  axios
    .get(`/soltarBrazo`)
    .then((response) => {
      console.log("Mensaje SOLTAR enviado al microcontrolador");
      if (wss.readyState == wss.OPEN) {
        wss.send(JSON.stringify({ type: "buttonAction", action: "releaseButton" }));
      }
    })
    .catch((error) => {
      console.error("Error al enviar mensaje SOLTAR", error);
    });
}

// Solicita los angulos al iniciar la página
function updateAllServos() {
  axios
    .get(`/servoAngles`)
    .then((response) => {
      console.log("Ángulos de los servos recibidos:", response.data);
    })
    .catch((error) => {
      console.error("Error al recibir los ángulos de los servos:", error);
    });
}

// Actualizar los ángulos de los servos y estados de los botones y sliders al cargar la página
window.onload = updateAllServos;
