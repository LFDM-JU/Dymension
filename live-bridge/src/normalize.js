// Convertit les messages bruts de tiktok-live-connector (v2) en événements
// compacts et stables, consommés par tous les jeux de la régie.
//
// Format commun :
//   { type: 'like' | 'chat' | 'gift' | 'share' | 'follow',
//     user: { id, name }, count, text?, gift?: { name, diamonds }, ts }

function toUser(u) {
  const id = u?.uniqueId || u?.displayId || u?.userId || u?.id || 'anonyme';
  return { id: String(id), name: u?.nickname || String(id) };
}

export function fromLike(msg) {
  return { type: 'like', user: toUser(msg.user), count: Math.max(1, Number(msg.likeCount ?? msg.count) || 1), ts: Date.now() };
}

export function fromChat(msg) {
  return { type: 'chat', user: toUser(msg.user), count: 1, text: String(msg.comment ?? msg.content ?? ''), ts: Date.now() };
}

// Les cadeaux « combo » (gift.type === 1) sont émis en boucle pendant la série ;
// on ne les compte qu'au dernier message (repeatEnd) pour éviter les doublons.
export function fromGift(msg) {
  const gift = msg.giftDetails ?? msg.gift ?? {};
  const isCombo = (gift.giftType ?? gift.type) === 1;
  if (isCombo && !msg.repeatEnd) return null;
  const count = Math.max(1, Number(msg.repeatCount) || 1);
  return {
    type: 'gift',
    user: toUser(msg.user),
    count,
    gift: { name: gift.giftName ?? gift.name ?? `#${msg.giftId}`, diamonds: Number(gift.diamondCount) || 1 },
    ts: Date.now(),
  };
}

export function fromSocial(msg, type) {
  return { type, user: toUser(msg.user), count: 1, ts: Date.now() };
}

// Valide un événement arrivant du simulateur (HTTP) et complète les champs manquants.
export function sanitize(ev) {
  const types = ['like', 'chat', 'gift', 'share', 'follow'];
  if (!ev || !types.includes(ev.type)) return null;
  const name = String(ev.user?.name ?? ev.user?.id ?? ev.user ?? 'viewer').slice(0, 32);
  const out = {
    type: ev.type,
    user: { id: String(ev.user?.id ?? name), name },
    count: Math.min(10_000, Math.max(1, Number(ev.count) || 1)),
    ts: Date.now(),
  };
  if (ev.type === 'chat') out.text = String(ev.text ?? '').slice(0, 200);
  if (ev.type === 'gift') {
    out.gift = { name: String(ev.gift?.name ?? 'Rose'), diamonds: Math.max(1, Number(ev.gift?.diamonds) || 1) };
  }
  return out;
}
