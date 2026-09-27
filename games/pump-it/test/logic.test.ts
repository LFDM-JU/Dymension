import { describe, expect, it } from 'vitest';
import { applyLiveEvent, Game, LIVE, SOLO } from '../src/logic';

const fixed = (v: number) => () => v; // rng constant → seuil d'explosion déterministe
const ev = (type: 'like' | 'chat' | 'gift', extra: object = {}) => ({ type, user: { id: 'bob', name: 'bob' }, count: 1, ...extra });

describe('solo', () => {
  it('encaisser ajoute la cagnotte au score et remet un ballon neuf', () => {
    const g = new Game(fixed(1)); // popAt = popMax
    g.start('solo');
    g.pump();
    g.pump();
    const pot = Math.round(g.pot);
    expect(g.bank()).toEqual([{ type: 'banked', pot }]);
    expect(g.score).toBe(pot);
    expect(g.air).toBe(0);
  });

  it('explosion : cagnotte perdue, une vie en moins', () => {
    const g = new Game(fixed(0)); // popAt = popMin
    g.start('solo');
    let out: ReturnType<Game['pump']> = [];
    while (!out.some((e) => e.type === 'popped')) out = g.pump();
    expect(g.lives).toBe(SOLO.lives - 1);
    expect(g.pot).toBe(0);
    expect(g.canPump).toBe(false); // réapparition en cours
  });

  it('3 explosions = game over, record enregistré', () => {
    const g = new Game(fixed(0));
    g.start('solo');
    g.pump();
    g.bank();
    const events = [];
    for (let i = 0; i < 3; i++) {
      while (g.canPump) events.push(...g.pump());
      g.update(SOLO.respawn + 0.01);
    }
    expect(g.phase).toBe('over');
    expect(events.at(-1)).toMatchObject({ type: 'over', record: true });
  });

  it('fin du chrono = game over, la cagnotte non encaissée est perdue', () => {
    const g = new Game(fixed(1));
    g.start('solo');
    g.pump();
    g.update(SOLO.duration + 1);
    expect(g.phase).toBe('over');
    expect(g.score).toBe(0);
  });
});

describe('live', () => {
  it('likes, "pump" et cadeaux gonflent le ballon', () => {
    const g = new Game(fixed(1));
    g.start('live');
    applyLiveEvent(g, ev('like', { count: 10 }));
    expect(g.air).toBeCloseTo(10 * LIVE.likeAir);
    applyLiveEvent(g, ev('chat', { text: 'PUMP !!' }));
    applyLiveEvent(g, ev('chat', { text: 'salut' }));
    expect(g.air).toBeCloseTo(10 * LIVE.likeAir + LIVE.chatAir);
    applyLiveEvent(g, ev('gift', { gift: { name: 'Galaxy', diamonds: 1000 } }));
    expect(g.air).toBeCloseTo(10 * LIVE.likeAir + LIVE.chatAir + LIVE.giftAirMax);
  });

  it('les votes "stop" encaissent et partagent la cagnotte', () => {
    const g = new Game(fixed(1));
    g.start('live');
    applyLiveEvent(g, { ...ev('chat', { text: 'pump' }), user: { id: 'a', name: 'a' } });
    applyLiveEvent(g, { ...ev('chat', { text: 'pump' }), user: { id: 'b', name: 'b' } });
    applyLiveEvent(g, { ...ev('chat', { text: 'pump' }), user: { id: 'b', name: 'b' } });
    for (let i = 0; i < LIVE.stopVotes; i++) applyLiveEvent(g, { ...ev('chat', { text: 'stop' }), user: { id: `v${i}`, name: `v${i}` } });
    expect(g.phase).toBe('intermission');
    const [first] = g.topPlayers();
    expect(first[0]).toBe('b');
    g.update(LIVE.intermission + 0.1);
    expect(g.phase).toBe('play');
    expect(g.round).toBe(2);
  });

  it('un même viewer ne vote qu\'une fois', () => {
    const g = new Game(fixed(1));
    g.start('live');
    applyLiveEvent(g, ev('chat', { text: 'pump' }));
    for (let i = 0; i < 10; i++) applyLiveEvent(g, ev('chat', { text: 'stop' }));
    expect(g.stopVoters.size).toBe(1);
    expect(g.phase).toBe('play');
  });

  it('explosion : le coupable est retenu, la manche s\'arrête', () => {
    const g = new Game(fixed(0));
    g.start('live');
    applyLiveEvent(g, ev('gift', { gift: { name: 'Lion', diamonds: 29999 } }));
    applyLiveEvent(g, ev('gift', { gift: { name: 'Lion', diamonds: 29999 } }));
    expect(g.lastPopper).toBe('bob');
    expect(g.phase).toBe('intermission');
  });
});
