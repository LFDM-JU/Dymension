import { TikTokLiveConnection, WebcastEvent, ControlEvent } from 'tiktok-live-connector';
import { fromChat, fromGift, fromLike, fromSocial } from './normalize.js';

// Se connecte au live de `username` et appelle `emit(event)` pour chaque événement normalisé.
// Reconnexion automatique avec backoff si le live coupe ou n'a pas encore commencé.
export function connectTikTok(username, emit, log = console.log) {
  let retry = 0;
  let stopped = false;
  const conn = new TikTokLiveConnection(username, { enableExtendedGiftInfo: true });

  conn.on(WebcastEvent.LIKE, (m) => emit(fromLike(m)));
  conn.on(WebcastEvent.CHAT, (m) => emit(fromChat(m)));
  conn.on(WebcastEvent.GIFT, (m) => {
    const ev = fromGift(m);
    if (ev) emit(ev);
  });
  conn.on(WebcastEvent.SHARE, (m) => emit(fromSocial(m, 'share')));
  conn.on(WebcastEvent.FOLLOW, (m) => emit(fromSocial(m, 'follow')));
  conn.on(ControlEvent.DISCONNECTED, () => {
    log('[tiktok] déconnecté');
    schedule();
  });

  async function start() {
    try {
      const state = await conn.connect();
      retry = 0;
      log(`[tiktok] connecté au live de @${username} (room ${state.roomId})`);
    } catch (err) {
      log(`[tiktok] connexion impossible : ${err?.message ?? err}`);
      schedule();
    }
  }

  function schedule() {
    if (stopped) return;
    const delay = Math.min(60_000, 2_000 * 2 ** retry++);
    log(`[tiktok] nouvelle tentative dans ${delay / 1000}s`);
    setTimeout(start, delay);
  }

  start();
  return () => {
    stopped = true;
    conn.disconnect();
  };
}
