// Logique pure de PUMP IT : aucune dépendance au DOM, testable et rejouable (rng injectable).
//
// Solo : 30 s pour gonfler des ballons. Chaque pompe grossit la cagnotte (de plus en plus vite),
//        mais le ballon explose à un seuil caché. ENCAISSER sécurise la cagnotte. 3 vies.
// Live : manches de 30 s pilotées par le chat. Likes / "pump" / cadeaux gonflent le ballon,
//        "stop" vote l'encaissement. Survivre = cagnotte partagée entre les pompeurs ;
//        exploser = cagnotte perdue et le coupable est affiché à l'écran.

export type Mode = 'solo' | 'live';
export type Phase = 'menu' | 'play' | 'intermission' | 'over';

export const SOLO = { duration: 30, lives: 3, pumpAir: 4, popMin: 35, popMax: 100, respawn: 0.7 };
export const LIVE = {
  roundDuration: 30,
  intermission: 5,
  likeAir: 0.35,
  chatAir: 1.5,
  airPerDiamond: 1.5,
  giftAirMax: 40,
  stopVotes: 5,
  popMin: 45,
  popMax: 100,
};

export type GameEvent =
  | { type: 'pumped'; air: number; gain: number; by?: string; big?: boolean }
  | { type: 'popped'; pot: number; by?: string }
  | { type: 'banked'; pot: number; survived?: boolean }
  | { type: 'vote'; by: string; votes: number }
  | { type: 'roundStart'; round: number }
  | { type: 'tick'; secondsLeft: number }
  | { type: 'over'; score: number; best: number; record: boolean };

/** Gain d'une pompe : proportionnel à l'air ajouté et à la taille actuelle du ballon. */
export function pumpGain(amount: number, airAfter: number): number {
  return amount * (1 + airAfter / 25);
}

export class Game {
  mode: Mode = 'solo';
  phase: Phase = 'menu';
  air = 0;
  popAt = 100;
  pot = 0;
  score = 0;
  best = 0;
  lives = SOLO.lives;
  timeLeft = SOLO.duration;
  cooldown = 0; // ballon en train de réapparaître (solo) ou pause entre manches (live)
  round = 0;
  lastPumper?: string;
  lastPopper?: string;
  contributions = new Map<string, number>();
  leaderboard = new Map<string, number>();
  stopVoters = new Set<string>();
  private lastTick = Infinity;

  constructor(private rng: () => number = Math.random) {}

  start(mode: Mode): GameEvent[] {
    this.mode = mode;
    this.phase = 'play';
    this.score = 0;
    this.lives = SOLO.lives;
    this.round = 0;
    this.cooldown = 0;
    if (mode === 'solo') {
      this.timeLeft = SOLO.duration;
      this.newBalloon();
      return [];
    }
    return this.newRound();
  }

  get maxAir(): number {
    return this.mode === 'solo' ? SOLO.popMax : LIVE.popMax;
  }

  /** Rapport 0..1 de gonflement, utilisé pour le rendu (ne révèle pas le seuil). */
  get fill(): number {
    return Math.min(1, this.air / this.maxAir);
  }

  get canPump(): boolean {
    return this.phase === 'play' && this.cooldown <= 0;
  }

  pump(amount = SOLO.pumpAir, by?: string, big = false): GameEvent[] {
    if (!this.canPump || amount <= 0) return [];
    this.air += amount;
    const gain = pumpGain(amount, this.air);
    this.pot += gain;
    this.lastPumper = by;
    if (by) this.contributions.set(by, (this.contributions.get(by) ?? 0) + gain);
    if (this.air >= this.popAt) return this.pop(by);
    return [{ type: 'pumped', air: this.air, gain, by, big }];
  }

  bank(survived = false): GameEvent[] {
    if (!this.canPump || this.pot < 1) return [];
    const pot = Math.round(this.pot);
    if (this.mode === 'solo') {
      this.score += pot;
      this.newBalloon();
      return [{ type: 'banked', pot }];
    }
    // Live : partage proportionnel aux contributions de la manche.
    const total = [...this.contributions.values()].reduce((s, v) => s + v, 0) || 1;
    for (const [user, c] of this.contributions) {
      this.leaderboard.set(user, (this.leaderboard.get(user) ?? 0) + Math.round((pot * c) / total));
    }
    this.score += pot;
    this.endRound();
    return [{ type: 'banked', pot, survived }];
  }

  voteStop(by: string): GameEvent[] {
    if (this.mode !== 'live' || !this.canPump || this.stopVoters.has(by)) return [];
    this.stopVoters.add(by);
    const ev: GameEvent = { type: 'vote', by, votes: this.stopVoters.size };
    if (this.stopVoters.size >= LIVE.stopVotes) return [ev, ...this.bank()];
    return [ev];
  }

  update(dt: number): GameEvent[] {
    const out: GameEvent[] = [];
    if (this.phase === 'intermission') {
      this.cooldown -= dt;
      if (this.cooldown <= 0) out.push(...this.newRound());
      return out;
    }
    if (this.phase !== 'play') return out;

    if (this.cooldown > 0) {
      this.cooldown -= dt;
      if (this.cooldown <= 0) this.newBalloon();
    }
    this.timeLeft = Math.max(0, this.timeLeft - dt);
    const secs = Math.ceil(this.timeLeft);
    if (secs <= 5 && secs < this.lastTick && secs > 0) out.push({ type: 'tick', secondsLeft: secs });
    this.lastTick = secs;

    if (this.timeLeft <= 0) {
      if (this.mode === 'solo') out.push(this.gameOver());
      else if (this.cooldown <= 0 && this.pot >= 1) out.push(...this.bank(true));
      else this.endRound();
    }
    return out;
  }

  private pop(by?: string): GameEvent[] {
    const pot = Math.round(this.pot);
    this.pot = 0;
    this.lastPopper = by;
    if (this.mode === 'solo') {
      this.lives -= 1;
      this.cooldown = SOLO.respawn;
      const out: GameEvent[] = [{ type: 'popped', pot, by }];
      if (this.lives <= 0) out.push(this.gameOver());
      return out;
    }
    this.endRound();
    return [{ type: 'popped', pot, by }];
  }

  private gameOver(): GameEvent {
    this.phase = 'over';
    const record = this.score > this.best;
    if (record) this.best = this.score;
    return { type: 'over', score: this.score, best: this.best, record };
  }

  private newBalloon() {
    const [min, max] = this.mode === 'solo' ? [SOLO.popMin, SOLO.popMax] : [LIVE.popMin, LIVE.popMax];
    this.air = 0;
    this.pot = 0;
    this.cooldown = 0;
    this.popAt = min + this.rng() * (max - min);
  }

  private newRound(): GameEvent[] {
    this.phase = 'play';
    this.round += 1;
    this.timeLeft = LIVE.roundDuration;
    this.lastTick = Infinity;
    this.contributions.clear();
    this.stopVoters.clear();
    this.lastPopper = undefined;
    this.newBalloon();
    return [{ type: 'roundStart', round: this.round }];
  }

  private endRound() {
    this.phase = 'intermission';
    this.cooldown = LIVE.intermission;
  }

  topPlayers(n = 5): [string, number][] {
    return [...this.leaderboard].sort((a, b) => b[1] - a[1]).slice(0, n);
  }
}

// --- Traduction des événements TikTok en actions de jeu -----------------------------

export interface LiveEvent {
  type: 'like' | 'chat' | 'gift' | 'share' | 'follow';
  user: { id: string; name: string };
  count: number;
  text?: string;
  gift?: { name: string; diamonds: number };
}

const PUMP_WORDS = /^(pump|p|💨|go|\+|1|gonfle)$/i;
const STOP_WORDS = /^(stop|s|cash|encaisse|✋)$/i;

export function applyLiveEvent(game: Game, ev: LiveEvent): GameEvent[] {
  const who = ev.user.name;
  switch (ev.type) {
    case 'like':
      return game.pump(ev.count * LIVE.likeAir, who);
    case 'chat': {
      const word = (ev.text ?? '').trim().split(/\s+/)[0] ?? '';
      if (PUMP_WORDS.test(word)) return game.pump(LIVE.chatAir, who);
      if (STOP_WORDS.test(word)) return game.voteStop(who);
      return [];
    }
    case 'gift': {
      const air = Math.min(LIVE.giftAirMax, (ev.gift?.diamonds ?? 1) * ev.count * LIVE.airPerDiamond);
      return game.pump(air, who, true);
    }
    case 'share':
    case 'follow':
      return game.pump(LIVE.chatAir * 2, who);
  }
}
