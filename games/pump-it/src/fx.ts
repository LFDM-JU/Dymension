// Juice : particules, textes flottants et tremblement d'écran.
export interface Particle { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number }
export interface Floater { x: number; y: number; text: string; color: string; life: number; size: number }

export class Fx {
  particles: Particle[] = [];
  floaters: Floater[] = [];
  shake = 0;
  flash = 0;

  burst(x: number, y: number, color: string, n = 40, speed = 900) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = speed * (0.3 + Math.random() * 0.7);
      this.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0, max: 0.5 + Math.random() * 0.5, color, size: 8 + Math.random() * 18 });
    }
  }

  float(x: number, y: number, text: string, color = '#fff', size = 64) {
    this.floaters.push({ x: x + (Math.random() - 0.5) * 120, y, text, color, life: 0, size });
    if (this.floaters.length > 40) this.floaters.shift();
  }

  update(dt: number) {
    for (const p of this.particles) {
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 1600 * dt;
      p.vx *= 0.98;
    }
    this.particles = this.particles.filter((p) => p.life < p.max);
    for (const f of this.floaters) {
      f.life += dt;
      f.y -= 260 * dt;
    }
    this.floaters = this.floaters.filter((f) => f.life < 0.9);
    this.shake = Math.max(0, this.shake - dt * 60);
    this.flash = Math.max(0, this.flash - dt * 3);
  }
}
