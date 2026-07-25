import { io } from 'socket.io-client';

// Real Socket.IO clients for each backend namespace (see
// Server/src/sockets/*). Citizen/staff/admin namespaces require a JWT
// access token (handshake.auth.token); the display namespace is public.

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let citizenSocket = null;
let staffSocket = null;
let displaySocket = null;

export function getCitizenSocket(token) {
  if (!citizenSocket) {
    citizenSocket = io(`${SOCKET_URL}/citizen`, {
      autoConnect: false,
      transports: ['websocket'],
      auth: { token },
    });
  } else {
    citizenSocket.auth = { token };
  }
  return citizenSocket;
}

export function getStaffSocket(token) {
  if (!staffSocket) {
    staffSocket = io(`${SOCKET_URL}/staff`, {
      autoConnect: false,
      transports: ['websocket'],
      auth: { token },
    });
  } else {
    staffSocket.auth = { token };
  }
  return staffSocket;
}

export function getDisplaySocket() {
  if (!displaySocket) {
    displaySocket = io(`${SOCKET_URL}/display`, {
      autoConnect: false,
      transports: ['websocket'],
    });
  }
  return displaySocket;
}

export function disconnectAllSockets() {
  citizenSocket?.disconnect();
  staffSocket?.disconnect();
  displaySocket?.disconnect();
}

