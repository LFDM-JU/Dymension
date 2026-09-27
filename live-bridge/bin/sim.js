#!/usr/bin/env node
// Injecte des événements TikTok simulés dans le pont Live.
//
//   npm run sim -- like 50 [--user bob]
//   npm run sim -- chat bob pump
//   npm run sim -- gift bob Rose 5 [diamants=1]
//   npm run sim -- share bob | follow bob
//   npm run sim -- spam 20 pump        (20 viewers écrivent "pump")
const base = process.env.BRIDGE_URL ?? 'http://localhost:8787';
const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args.splice(i, 2)[1] : undefined;
};
const who = flag('user');
const [cmd, ...rest] = args;

const GIFT_DIAMONDS = { rose: 1, 'finger heart': 5, perfume: 20, donut: 30, galaxy: 1000, lion: 29999 };
let events;
switch (cmd) {
  case 'like':
    events = [{ type: 'like', user: who ?? 'liker', count: Number(rest[0]) || 1 }];
    break;
  case 'chat':
    events = [{ type: 'chat', user: rest[0] ?? 'viewer', text: rest.slice(1).join(' ') }];
    break;
  case 'gift': {
    const name = rest[1] ?? 'Rose';
    const diamonds = Number(rest[3]) || GIFT_DIAMONDS[name.toLowerCase()] || 1;
    events = [{ type: 'gift', user: rest[0] ?? 'viewer', count: Number(rest[2]) || 1, gift: { name, diamonds } }];
    break;
  }
  case 'share':
  case 'follow':
    events = [{ type: cmd, user: rest[0] ?? 'viewer' }];
    break;
  case 'spam': {
    const n = Number(rest[0]) || 10;
    const text = rest.slice(1).join(' ') || 'pump';
    events = Array.from({ length: n }, (_, i) => ({ type: 'chat', user: `viewer${i + 1}`, text }));
    break;
  }
  default:
    console.log('Usage : sim <like N | chat USER TEXTE | gift USER NOM [N] [DIAMANTS] | share USER | follow USER | spam N TEXTE>');
    process.exit(1);
}
events = events.map((e) => ({ ...e, user: typeof e.user === 'string' ? { id: e.user, name: e.user } : e.user }));

try {
  const res = await fetch(`${base}/sim`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(events) });
  console.log(`→ ${cmd} : ${(await res.json()).sent} événement(s) envoyé(s)`);
} catch {
  console.error(`Pont injoignable sur ${base}. Lance d'abord : npm run bridge`);
  process.exit(1);
}
