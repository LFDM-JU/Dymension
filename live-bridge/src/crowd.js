// Foule simulée : génère un trafic réaliste (likes en rafales, commentaires, cadeaux)
// pour tester un jeu Live sans être en direct.
const NAMES = ['lea_22', 'maxou', 'ninja.fr', 'sofia', 'tom_off', 'kenza', 'yanis77', 'chloe', 'bibou', 'rayan', 'inès', 'noah_x'];
const GIFTS = [
  { name: 'Rose', diamonds: 1, weight: 60 },
  { name: 'Finger Heart', diamonds: 5, weight: 25 },
  { name: 'Perfume', diamonds: 20, weight: 10 },
  { name: 'Galaxy', diamonds: 1000, weight: 1 },
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const user = () => {
  const n = pick(NAMES);
  return { id: n, name: n };
};

export function crowdTick(chatWords) {
  const r = Math.random();
  if (r < 0.55) return { type: 'like', user: user(), count: 1 + Math.floor(Math.random() * 15) };
  if (r < 0.92) return { type: 'chat', user: user(), text: pick(chatWords) };
  if (r < 0.97) return { type: 'share', user: user() };
  let w = Math.random() * GIFTS.reduce((s, g) => s + g.weight, 0);
  const gift = GIFTS.find((g) => (w -= g.weight) < 0) ?? GIFTS[0];
  return { type: 'gift', user: user(), count: 1, gift: { name: gift.name, diamonds: gift.diamonds } };
}
