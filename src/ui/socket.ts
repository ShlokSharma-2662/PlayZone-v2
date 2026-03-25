import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '../shared/eventTypes';

export function createSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  return io(import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3001', {
    transports: ['websocket'],
  });
}
