import { createServer } from 'node:http';
import { parseArgs } from 'node:util';
import { Server } from 'socket.io';
import { sanitize } from './normalize.js';
import { crowdTick } from './crowd.js';

const { values } = parseArgs({
  options: {
    user: { type: 'string', short: 'u' },
    port: { type: 'string', short: 'p', default: process.env.PORT ?? '8787' },
    sim: { type: 'boolean', default: false },
    crowd: { type: 'boolean', default: false },
    words: { type: 'string', default: 'pump,pump,pump,stop,gg,lol' },
  },
});

const port = Number(values.port);
const stats = { like: 0, chat: 0, gift: 0, share: 0, follow: 0 };

const http = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  if (req.method === 'OPTIONS') return res.end();

  if (req.method === 'GET' && req.url === '/status') {
    res.setHeader('content-type', 'application/json');
    return res.end(JSON.stringify({ source: values.user ? `@${values.user}` : 'simulation', clients: io.engine.clientsCount, stats }));
  }

  if (req.method === 'POST' && req.url === '/sim') {
    let body = '';
    for await (const chunk of req) body += chunk;
    let list;
    try {
      const parsed = JSON.parse(body || '{}');
      list = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      res.statusCode = 400;
      return res.end('JSON invalide');
    }
    const events = list.map(sanitize).filter(Boolean);
    events.forEach(broadcast);
    res.setHeader('content-type', 'application/json');
    return res.end(JSON.stringify({ sent: events.length }));
  }

  res.statusCode = 404;
  res.end('Not found');
});

const io = new Server(http, { cors: { origin: '*' } });

function broadcast(ev) {
  stats[ev.type] = (stats[ev.type] ?? 0) + 1;
  io.emit('live', ev);
}

io.on('connection', (socket) => {
  console.log(`[bridge] jeu connecté (${io.engine.clientsCount})`);
  socket.on('disconnect', () => console.log(`[bridge] jeu déconnecté (${io.engine.clientsCount})`));
});

http.listen(port, () => {
  console.log(`[bridge] Socket.io + API de simulation sur http://localhost:${port}`);
  console.log(`[bridge] POST /sim pour injecter des événements, GET /status pour l'état`);
});

if (values.user) {
  const { connectTikTok } = await import('./tiktok.js');
  connectTikTok(values.user.replace(/^@/, ''), broadcast);
} else {
  console.log('[bridge] mode simulation (aucun --user fourni)');
}

// --crowd [--words "pump,stop,gg"] : lance une foule simulée qui écrit ces mots.
if (values.crowd) {
  const words = values.words.split(',');
  console.log(`[bridge] foule simulée active (mots : ${words.join(', ')})`);
  const loop = () => {
    const ev = sanitize(crowdTick(words));
    if (ev) broadcast(ev);
    setTimeout(loop, 80 + Math.random() * 400);
  };
  loop();
}
