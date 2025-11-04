const { io } = require("socket.io-client");
console.log("awa")
const sleep = ms => new Promise(res => setTimeout(res, ms));

let currentUserId = 15;
let targetUserId = 17;

function loadChatHistory() {
  console.log("awawa")
  socket.emit('get_chat_history', {
    userId1: 15,
    userId2: 17,
    isProvider: true
  });
}

async function initChat() {
  if (!targetUserId) {
    console.log('Error: No se especificó destinatario');
    return;
  }

  // Verificar sesión primero usando tu endpoint existente
  try {
    const response = await fetch('http://3.95.246.120/api/check-session', {
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

  console.log("Mensaje:", message);
  console.log("Socket conectado:", socket?.connected);
  console.log("Usuario actual:", currentUserId);
  console.log("Usuario destino:", targetUserId);

  if (!message) {
    console.log("Mensaje vacío");
    return;
  }

  if (!socket || !socket.connected) {
    console.log("Socket no conectado");
    console.log('No estás conectado al servidor');
    return;
  }

  if (!currentUserId || !targetUserId) {
    console.log("Faltan IDs de usuario");
    return;
  }

  // ASEGURAR QUE SON NÚMEROS
  const dataToSend = {
    toUserId: parseInt(targetUserId),
    message: message,
    isProvider: true
  };

  console.log("Enviando datos:", dataToSend);

  // Enviar al servidor
  socket.emit('send_private_message', dataToSend);

  // Mostrar en UI inmediatamente

  input.value = '';
}
initChat();

const socket = io("http://3.95.246.120");

async function asshole() {

  for (let index = 99; index < 9999; index++) {
    await sleep(1);
    sendMessage("" + index);

  }
}

socket.on("connect", () => {
  console.log("Connected!");
  socket.emit("authenticate", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsIm5hbWUiOiIxMiIsImVtYWlsIjoiMTJAMTIuY29tIiwicGhvbmUiOiIxMiIsImlzcHJvdmlkZXIiOjEsImlhdCI6MTc2MTg2MDk5NCwiZXhwIjoxNzYxODY0NTk0fQ.rVFtvGFSzRLaNfbjzoigOi5_Iy2ZVPDEjD_5gioE0TY");
  asshole();
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

