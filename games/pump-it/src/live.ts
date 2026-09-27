import { io } from 'socket.io-client';
import type { LiveEvent } from './logic';

// Connexion au pont Live (live-bridge). URL surchargeable via ?bridge=http://ip:port
export function connectBridge(onEvent: (ev: LiveEvent) => void, onStatus: (s: 'connecting' | 'on' | 'off') => void) {
  const url = new URLSearchParams(location.search).get('bridge') ?? `http://${location.hostname}:8787`;
  onStatus('connecting');
  const socket = io(url, { transports: ['websocket'], reconnectionDelayMax: 3000 });
  socket.on('connect', () => onStatus('on'));
  socket.on('disconnect', () => onStatus('off'));
  socket.on('connect_error', () => onStatus('off'));
  socket.on('live', onEvent);
  return () => socket.close();
}
