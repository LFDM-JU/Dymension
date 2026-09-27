import { sfx, unlockAudio } from './audio';
import { Fx } from './fx';
import { applyLiveEvent, Game, type GameEvent, type LiveEvent } from './logic';
import { BALLOON_Y, BANK_BTN, balloonRadius, H, LIVE_BTN, render, SHARE_BTN, type View, W } from './render';

const canvas = document.querySelector<HTMLCanvasElement>('#game')!;
const ctx = canvas.getContext('2d')!;
const params = new URLSearchParams(location.search);

const BEST_KEY = 'pump-it:best';
const game = new Game();
game.best = Number(safeGet(BEST_KEY)) || 0;

const view: View = { game, fx: new Fx(), time: 0, squash: 0, feed: [], bridge: 'off', canShare: 'share' in navigator };

// --- Mise à l'échelle 9:16 (letterbox), nette sur écrans haute densité -------------
function resize() {
  const scale = Math.min(innerWidth / W, innerHeight / H);
  canvas.style.width = `${W * scale}px`;
  canvas.style.height = `${H * scale}px`;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(W * scale * dpr);
  canvas.height = Math.round(H * scale * dpr);
  ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
}
addEventListener('resize', resize);
resize();

// --- Réactions aux événements de jeu (son + juice) --------------------------------
function react(events: GameEvent[]) {
  for (const e of events) {
    switch (e.type) {
      case 'pumped': {
        view.squash = 1;
        if (e.big) {
          sfx.mega();
          view.fx.shake = 30;
          view.fx.float(W / 2, BALLOON_Y - 200, `🎁 ${e.by ?? ''}`, '#ffd60a', 80);
        } else sfx.pump(game.fill);
        if (game.mode === 'solo') view.fx.float(W / 2, BALLOON_Y - balloonRadius(game.fill) - 40, `+${Math.round(e.gain)}`, '#34c759');
        break;
      }
      case 'popped': {
        sfx.pop();
        view.fx.burst(W / 2, BALLOON_Y, '#ff2d55', 70, 1400);
        view.fx.burst(W / 2, BALLOON_Y, '#ffd60a', 30, 900);
        view.fx.shake = 60;
        view.fx.flash = 1;
        vibrate([80, 40, 120]);
        const who = e.by ? `@${e.by}\nL'A FAIT PÉTER` : 'BOOM !';
        banner(`💥 ${who}`, '#ff2d55');
        if (e.pot) view.fx.float(W / 2, BALLOON_Y + 200, `-${e.pot}`, '#ff2d55', 110);
        break;
      }
      case 'banked':
        sfx.bank();
        view.fx.burst(W / 2, BALLOON_Y, '#ffd60a', 40, 800);
        banner(game.mode === 'live' ? `${e.survived ? 'SURVÉCU' : 'ENCAISSÉ'} !\n+${e.pot}` : `+${e.pot}`, '#34c759');
        vibrate(30);
        break;
      case 'vote':
        sfx.vote();
        break;
      case 'tick':
        sfx.tick();
        break;
      case 'roundStart':
        sfx.start();
        banner(`MANCHE ${e.round}`, '#25f4ee');
        break;
      case 'over':
        sfx.over();
        if (e.record) safeSet(BEST_KEY, String(e.best));
        break;
    }
  }
}

function banner(text: string, color: string) {
  view.banner = { text, color, age: 0 };
}

function feed(text: string, color = '#fff') {
  view.feed.push({ text, color, age: 0 });
  if (view.feed.length > 20) view.feed.shift();
}

// --- Entrées ----------------------------------------------------------------------
function inRect(x: number, y: number, r: { x: number; y: number; w: number; h: number }) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

let stopBridge: (() => void) | undefined;
let overAt = 0;

function startLive() {
  react(game.start('live'));
  // Chargé à la demande : le mode solo n'embarque pas Socket.io.
  if (!stopBridge) {
    stopBridge = () => {};
    void import('./live').then(({ connectBridge }) => (stopBridge = connectBridge(onLive, (s) => (view.bridge = s))));
  }
}

function onLive(ev: LiveEvent) {
  if (game.mode !== 'live') return;
  const out = applyLiveEvent(game, ev);
  const who = ev.user.name.slice(0, 14);
  if (ev.type === 'gift') feed(`${who} 🎁 ${ev.gift?.name} x${ev.count}`, '#ffd60a');
  else if (ev.type === 'like') feed(`${who} ❤ x${ev.count}`, '#ff2d55');
  else if (ev.type === 'chat' && out.length) feed(`${who}: ${ev.text}`, '#25f4ee');
  react(out);
}

canvas.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  unlockAudio();
  const rect = canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * W;
  const y = ((e.clientY - rect.top) / rect.height) * H;

  if (game.phase === 'menu') {
    if (inRect(x, y, LIVE_BTN)) return startLive();
    sfx.start();
    return react(game.start('solo'));
  }
  if (game.mode === 'live') return; // en live, ce sont les viewers qui jouent
  if (game.phase === 'over') {
    if (performance.now() - overAt < 600) return; // évite un rejouer accidentel
    if (view.canShare && inRect(x, y, SHARE_BTN)) return share();
    sfx.start();
    return react(game.start('solo'));
  }
  if (inRect(x, y, BANK_BTN)) react(game.bank());
  else react(game.pump());
});

addEventListener('keydown', (e) => {
  unlockAudio();
  if (e.repeat) return;
  const k = e.key.toLowerCase();
  if (game.phase === 'menu') {
    if (k === 'l') return startLive();
    if (k === ' ' || k === 'enter') return react(game.start('solo'));
  }
  if (game.mode === 'solo') {
    if (k === ' ') react(game.phase === 'over' ? game.start('solo') : game.pump());
    if (k === 'enter' || k === 'b') react(game.bank());
    return;
  }
  // Mode live : simulation au clavier, sans pont (pratique pour régler l'équilibrage).
  const rnd = () => ['lea_22', 'maxou', 'sofia', 'kenza', 'tom_off', 'yanis77'][Math.floor(Math.random() * 6)];
  const user = () => {
    const n = rnd();
    return { id: n, name: n };
  };
  const sims: Record<string, () => LiveEvent> = {
    '1': () => ({ type: 'like', user: user(), count: 10 }),
    '2': () => ({ type: 'chat', user: user(), count: 1, text: 'pump' }),
    '3': () => ({ type: 'chat', user: { id: `v${Math.random()}`, name: rnd() + Math.floor(Math.random() * 99) }, count: 1, text: 'stop' }),
    '4': () => ({ type: 'gift', user: user(), count: 1, gift: { name: 'Rose', diamonds: 1 } }),
    '5': () => ({ type: 'gift', user: user(), count: 1, gift: { name: 'Galaxy', diamonds: 1000 } }),
  };
  if (sims[k]) onLive(sims[k]());
  if (k === 'b') react(game.bank());
  if (k === 'escape') game.phase = 'menu';
});

async function share() {
  try {
    await navigator.share({ title: 'PUMP IT', text: `J'ai fait ${game.score} sur PUMP IT 🎈💥 Tu fais mieux ?`, url: location.href });
  } catch {
    /* partage annulé */
  }
}

function vibrate(p: number | number[]) {
  navigator.vibrate?.(p);
}

function safeGet(k: string) {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}
function safeSet(k: string, v: string) {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* stockage indisponible */
  }
}

// --- Boucle principale ------------------------------------------------------------
let last = performance.now();
function frame(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  view.time += dt;
  view.squash = Math.max(0, view.squash - dt * 8);
  if (view.banner) view.banner.age += dt;
  view.feed.forEach((f) => (f.age += dt));
  const wasOver = game.phase === 'over';
  react(game.update(dt));
  if (!wasOver && game.phase === 'over') overAt = now;
  view.fx.update(dt);
  render(ctx, view);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

if (params.get('mode') === 'live') startLive();
