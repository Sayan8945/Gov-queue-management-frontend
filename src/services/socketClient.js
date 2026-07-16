import { io } from 'socket.io-client';

// TODO(backend): This client is not yet connected anywhere in the app.
// Once the Express + Socket.IO backend is live, call `getSocket().connect()`
// from a top-level provider (e.g. App.jsx) and listen for events such as:
//   'queue:updated', 'token:called', 'counter:status-changed'
// For now the queueStore's local timer-based simulation stands in for this.

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000', {
      autoConnect: false,
      transports: ['websocket'],
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
  }
}
