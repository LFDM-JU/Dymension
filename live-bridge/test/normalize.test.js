import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fromChat, fromGift, fromLike, sanitize } from '../src/normalize.js';

test('like : récupère le nombre et l\'utilisateur', () => {
  const ev = fromLike({ likeCount: 12, user: { uniqueId: 'bob', nickname: 'Bob' } });
  assert.equal(ev.type, 'like');
  assert.equal(ev.count, 12);
  assert.deepEqual(ev.user, { id: 'bob', name: 'Bob' });
});

test('chat : lit comment (v1) ou content (v2)', () => {
  assert.equal(fromChat({ comment: 'pump', user: {} }).text, 'pump');
  assert.equal(fromChat({ content: 'stop', user: { displayId: 'x' } }).text, 'stop');
});

test('gift combo : ignoré tant que la série n\'est pas finie', () => {
  const base = { user: { uniqueId: 'a' }, giftDetails: { giftType: 1, giftName: 'Rose', diamondCount: 1 }, repeatCount: 4 };
  assert.equal(fromGift({ ...base, repeatEnd: 0 }), null);
  const ev = fromGift({ ...base, repeatEnd: 1 });
  assert.equal(ev.count, 4);
  assert.deepEqual(ev.gift, { name: 'Rose', diamonds: 1 });
});

test('gift non combo : compté immédiatement', () => {
  const ev = fromGift({ user: { uniqueId: 'a' }, gift: { type: 2, name: 'Galaxy', diamondCount: 1000 }, repeatCount: 1 });
  assert.equal(ev.gift.diamonds, 1000);
});

test('sanitize : rejette les types inconnus et borne les valeurs', () => {
  assert.equal(sanitize({ type: 'hack' }), null);
  const ev = sanitize({ type: 'like', user: 'bob', count: 1e9 });
  assert.equal(ev.count, 10_000);
  assert.equal(ev.user.name, 'bob');
});
