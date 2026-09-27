import { Fx } from './fx';
import { Game, LIVE } from './logic';

export const W = 1080;
export const H = 1920;
export const BALLOON_Y = 860;
const BANNER_Y = 470;
/** Zone du bouton ENCAISSER (solo). */
export const BANK_BTN = { x: 190, y: 1560, w: 700, h: 200 };
export const LIVE_BTN = { x: 290, y: 1500, w: 500, h: 130 };
export const SHARE_BTN = { x: 290, y: 1560, w: 500, h: 130 };

const FONT = '"Arial Black", "Helvetica Neue", Impact, sans-serif';

export interface FeedItem { text: string; color: string; age: number }

export interface View {
  game: Game;
  fx: Fx;
  time: number;
  squash: number; // rebond du ballon à chaque pompe
  feed: FeedItem[];
  banner?: { text: string; color: string; age: number };
  bridge: 'off' | 'connecting' | 'on';
  canShare: boolean;
}

export function balloonRadius(fill: number) {
  return 120 + fill * 300;
}

/** Vert → jaune → rouge selon le gonflement. */
function balloonColor(fill: number) {
  const hue = 130 - fill * 130;
  return `hsl(${hue}, 90%, 55%)`;
}

function text(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, color = '#fff', align: CanvasTextAlign = 'center') {
  ctx.font = `900 ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.16;
  ctx.strokeStyle = '#000';
  ctx.strokeText(s, x, y);
  ctx.fillStyle = color;
  ctx.fillText(s, x, y);
}

function button(ctx: CanvasRenderingContext2D, b: { x: number; y: number; w: number; h: number }, label: string, color: string, size = 80, pulse = 0) {
  ctx.save();
  const s = 1 + pulse;
  ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
  ctx.scale(s, s);
  ctx.fillStyle = '#000';
  roundRect(ctx, -b.w / 2, -b.h / 2 + 14, b.w, b.h, 40);
  ctx.fill();
  ctx.fillStyle = color;
  roundRect(ctx, -b.w / 2, -b.h / 2, b.w, b.h, 40);
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#000';
  ctx.stroke();
  text(ctx, label, 0, 0, size);
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawBalloon(ctx: CanvasRenderingContext2D, v: View) {
  const g = v.game;
  if (!g.canPump && g.phase !== 'menu') return;
  const fill = g.phase === 'menu' ? 0.35 + Math.sin(v.time * 2) * 0.08 : g.fill;
  const r = balloonRadius(fill);
  // Tremble de plus en plus fort : tension visuelle sans révéler le seuil.
  const wobble = fill > 0.4 ? (fill - 0.4) * 22 : 0;
  const x = W / 2 + Math.sin(v.time * 37) * wobble;
  const y = BALLOON_Y + Math.cos(v.time * 29) * wobble;
  const sx = 1 + v.squash * 0.12;
  const sy = 1 - v.squash * 0.08;

  // Ficelle
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x, y + r * sy);
  for (let i = 1; i <= 8; i++) ctx.lineTo(x + Math.sin(v.time * 4 + i) * 14, y + r * sy + i * 40);
  ctx.stroke();

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sx, sy);
  ctx.fillStyle = balloonColor(fill);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.92, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Nœud
  ctx.beginPath();
  ctx.moveTo(-26, r - 4);
  ctx.lineTo(26, r - 4);
  ctx.lineTo(0, r + 36);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Reflet
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.4, -r * 0.45, r * 0.16, r * 0.28, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (g.phase === 'play') text(ctx, `${Math.round(g.pot)}`, x, y, 90 + fill * 110, '#fff');
}

function drawTimer(ctx: CanvasRenderingContext2D, v: View, total: number) {
  const g = v.game;
  const ratio = g.timeLeft / total;
  const urgent = g.timeLeft <= 5;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  roundRect(ctx, 60, 220, W - 120, 44, 22);
  ctx.fill();
  ctx.fillStyle = urgent ? (Math.floor(v.time * 6) % 2 ? '#ff2d55' : '#fff') : '#25f4ee';
  roundRect(ctx, 60, 220, (W - 120) * ratio, 44, 22);
  ctx.fill();
  text(ctx, `${Math.ceil(g.timeLeft)}s`, W / 2, 310, urgent ? 90 : 64, urgent ? '#ff2d55' : '#fff');
}

function drawSoloHud(ctx: CanvasRenderingContext2D, v: View) {
  const g = v.game;
  text(ctx, `${g.score}`, W / 2, 120, 110, '#ffd60a');
  text(ctx, '❤'.repeat(g.lives) + '♡'.repeat(Math.max(0, 3 - g.lives)), 80, 120, 64, '#ff2d55', 'left');
  drawTimer(ctx, v, 30);
  const pulse = g.pot > 0 ? Math.sin(v.time * 10) * 0.03 * g.fill : 0;
  button(ctx, BANK_BTN, g.pot >= 1 ? `ENCAISSER ${Math.round(g.pot)}` : 'ENCAISSER', g.pot >= 1 ? '#34c759' : '#555', 72, pulse);
  text(ctx, 'TAPE POUR GONFLER', W / 2, 1450, 54, 'rgba(255,255,255,0.8)');
}

function drawLiveHud(ctx: CanvasRenderingContext2D, v: View) {
  const g = v.game;
  text(ctx, `MANCHE ${g.round}`, W / 2, 110, 80, '#ffd60a');
  if (g.phase === 'play') drawTimer(ctx, v, LIVE.roundDuration);

  // Consignes permanentes : compréhension en 3 secondes pour un viewer qui arrive.
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  roundRect(ctx, 40, 1380, W - 80, 250, 36);
  ctx.fill();
  text(ctx, '❤ LIKE = 💨   "pump" = 💨💨', W / 2, 1440, 50);
  text(ctx, '🎁 CADEAU = MÉGA 💨', W / 2, 1510, 50, '#ffd60a');
  text(ctx, `"stop" = ENCAISSER (${g.stopVoters.size}/${LIVE.stopVotes})`, W / 2, 1580, 50, '#34c759');

  // Classement
  const top = g.topPlayers(5);
  if (top.length) {
    text(ctx, 'TOP POMPEURS', 60, 1680, 42, '#25f4ee', 'left');
    top.forEach(([name, pts], i) => text(ctx, `${i + 1}. ${name.slice(0, 14)}  ${pts}`, 60, 1735 + i * 38, 34, '#fff', 'left'));
  }
  // Fil d'événements
  v.feed.slice(-6).forEach((f, i) => {
    ctx.globalAlpha = Math.max(0, 1 - f.age / 4);
    text(ctx, f.text, W - 60, 1690 + i * 38, 32, f.color, 'right');
    ctx.globalAlpha = 1;
  });

  const dot = { on: '#34c759', connecting: '#ffd60a', off: '#ff2d55' }[v.bridge];
  ctx.fillStyle = dot;
  ctx.beginPath();
  ctx.arc(W - 70, 110, 18, 0, Math.PI * 2);
  ctx.fill();
}

function drawMenu(ctx: CanvasRenderingContext2D, v: View) {
  const bob = Math.sin(v.time * 3) * 12;
  text(ctx, 'PUMP IT', W / 2, 300 + bob, 190, '#ffd60a');
  text(ctx, 'Gonfle. Encaisse.', W / 2, 460, 64);
  text(ctx, "N'explose pas.", W / 2, 540, 64, '#ff2d55');
  const blink = Math.floor(v.time * 2) % 2 === 0;
  if (blink) text(ctx, 'TAPE POUR JOUER', W / 2, 1320, 84, '#25f4ee');
  if (v.game.best) text(ctx, `RECORD ${v.game.best}`, W / 2, 1420, 56, '#ffd60a');
  button(ctx, LIVE_BTN, 'MODE LIVE', '#fe2c55', 60);
}

function drawOver(ctx: CanvasRenderingContext2D, v: View) {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, W, H);
  const g = v.game;
  text(ctx, 'TERMINÉ', W / 2, 420, 150, '#ff2d55');
  text(ctx, `${g.score}`, W / 2, 700, 260, '#ffd60a');
  text(ctx, g.score >= g.best && g.score > 0 ? 'NOUVEAU RECORD !' : `RECORD ${g.best}`, W / 2, 900, 70, '#25f4ee');
  if (Math.floor(v.time * 2) % 2 === 0) text(ctx, 'TAPE POUR REJOUER', W / 2, 1250, 80);
  if (v.canShare) button(ctx, SHARE_BTN, 'DÉFIER UN POTE', '#25f4ee', 56);
}

export function render(ctx: CanvasRenderingContext2D, v: View) {
  const g = v.game;
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  const danger = g.phase === 'play' ? g.fill : 0;
  bg.addColorStop(0, `hsl(${265 - danger * 80}, 60%, ${14 + danger * 6}%)`);
  bg.addColorStop(1, '#050510');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  if (v.fx.shake > 0) ctx.translate((Math.random() - 0.5) * v.fx.shake, (Math.random() - 0.5) * v.fx.shake);

  drawBalloon(ctx, v);

  for (const p of v.fx.particles) {
    ctx.globalAlpha = 1 - p.life / p.max;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;
  for (const f of v.fx.floaters) {
    ctx.globalAlpha = 1 - f.life / 0.9;
    text(ctx, f.text, f.x, f.y, f.size, f.color);
  }
  ctx.globalAlpha = 1;

  if (g.phase === 'menu') drawMenu(ctx, v);
  else if (g.mode === 'solo') {
    drawSoloHud(ctx, v);
    if (g.phase === 'over') drawOver(ctx, v);
  } else drawLiveHud(ctx, v);

  if (v.banner && v.banner.age < 2.5) {
    const s = Math.min(1, v.banner.age * 8);
    ctx.save();
    ctx.translate(W / 2, BANNER_Y);
    ctx.scale(s, s);
    v.banner.text.split('\n').forEach((line, i, all) => text(ctx, line, 0, (i - (all.length - 1) / 2) * 110, 96, v.banner!.color));
    ctx.restore();
  }
  ctx.restore();

  if (v.fx.flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${v.fx.flash * 0.6})`;
    ctx.fillRect(0, 0, W, H);
  }
}
