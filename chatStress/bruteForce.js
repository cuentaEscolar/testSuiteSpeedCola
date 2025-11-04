const { io } = require("socket.io-client");
var request = require('request');
const fs = require('node:fs');



let currentUserId = process.env.CURRENTID;
let targetUserId = process.env.TARGETID;
let endpoint = process.env.ENDPOINT
let password = process.env.PASSWORD
let email = process.env.EMAIL
let sleepDelay = process.env.SLEEP
let requests = process.env.REQUESTS
let cookie = null



console.log(email)
const sleep = ms => new Promise(res => setTimeout(res, ms));

function loadChatHistory() {
  console.log("LoadingHistory")
  socket.emit('get_chat_history', {
    userId1: currentUserId,
    userId2: targetUserId,
    isProvider: true
  });
}
async function loadCookies() {

  request.post(
    'http://' + endpoint + '/api/login',
    { json: { email: email, password: password } },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
        jsonResp = response.toJSON();
        cookie = jsonResp.headers['set-cookie'][0].split(';')[0].split('=')[1]
        console.log(cookie);
      }
    }
  );

}

async function initChat() {
  await loadCookies();

  if (!targetUserId) return console.log('Error: No se especificó destinatario');
  // Verificar sesión primero usando tu endpoint existente
  console.log("test1")
  try {
    const response = await fetch('http://' + endpoint + '/api/check-session', {
      credentials: 'include'
    });
    const data = await response.json();

    if (!data.loggedIn) {
      return;
    }

    currentUserId = data.user.id;
    console.log(currentUserId)
    // Determinar si el usuario actual es proveedor
    const isProvider = data.user.isprovider === 1 || data.user.isprovider === true;

    console.log('Usuario autenticado:', currentUserId, 'Es proveedor:', isProvider);

    // Guardar si es proveedor para usarlo después

    // Ahora conectar al socket
    connectSocket();

  } catch (error) {
    console.error('Error verificando sesión:', error);
  }
}


function sendMessage(contents) {
  console.log("Intentando enviar mensaje...");
  const input = contents
  const message = input.trim();

  if (!message) return console.log("Mensaje vacío");
  if (!socket || !socket.connected) {
    console.log("Socket no conectado");
    console.log('No estás conectado al servidor');
    return;
  }
  if (!currentUserId || !targetUserId) return console.log("Faltan IDs de usuario");

  console.log("Mensaje:", message);
  console.log("Socket conectado:", socket?.connected);
  console.log("Usuario actual:", currentUserId);
  console.log("Usuario destino:", targetUserId);

  const dataToSend = {
    toUserId: parseInt(targetUserId),
    message: message,
    isProvider: true
  };

  console.log("Enviando datos:", dataToSend);
  socket.emit('send_private_message', dataToSend);

}
initChat();


async function stress() {

  for (let index = 0; index < requests; index++) {
    await sleep(sleepDelay);
    sendMessage("stress_" + index);

  }
}

const socket = io('http://' + endpoint);
socket.on("connect", () => {
  console.log("Connected!");
  socket.emit("authenticate",
    cookie
  );
  stress();
  //loadChatHistory()
});

socket.on('auth_error', (data) => {
  console.log('Error de autenticación: ' + data.message);
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
});

socket.on('authenticated', (data) => {
  console.log('Autenticado en socket');

  // Cargar historial
});


socket.on('chat_history', (messages) => {

  if (messages.length === 0) {
    return;
  }

  messages.forEach(msg => {
    const type = msg.idUsuario == currentUserId ? 'sent' : 'received';
    console.log(msg.mensaje, type, msg.fechaEnvio, msg.idUsuario);
  });

  console.log(`${messages.length} mensajes cargados`);
});

