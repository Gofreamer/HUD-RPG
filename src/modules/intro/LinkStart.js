// src/modules/intro/LinkStart.js
// Animação Link Start + HUD neural persistente para a tela de login

import './intro.css';
import { Sound } from '../utils/Sound.js';

export class LinkStart {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;
    this.particles = [];
    this.rings = [];
    this.spinAngle = 0;
    this.startTime = null;
    this.mode = 'intro'; // intro | ambient
    this._onResize = null;
  }

  async play() {
    this.createDOM();
    this.setupCanvas();
    this.startTime = performance.now();
    this.animate();

    await this.wait(400);
    Sound.linkStart();
    this.showText();

    await this.wait(1200);
    this.showSystemChecks();

    await this.wait(2200);
    await this.transitionToAmbient();
    if (this.onComplete) this.onComplete();
  }

  createDOM() {
    this.container = document.createElement('div');
    this.container.id = 'link-start-container';

    this.canvas = document.createElement('canvas');
    this.canvas.id = 'link-start-canvas';

    this.textEl = document.createElement('div');
    this.textEl.className = 'link-start-text';
    this.textEl.textContent = 'LINK START';

    this.checksEl = document.createElement('div');
    this.checksEl.className = 'system-checks';
    this.checksEl.innerHTML = `
      <div class="check-item"><span>Vision</span><span class="status" data-sense="vision">OK</span></div>
      <div class="check-item"><span>Hearing</span><span class="status" data-sense="hearing">OK</span></div>
      <div class="check-item"><span>Touch</span><span class="status" data-sense="touch">OK</span></div>
      <div class="check-item"><span>Smell</span><span class="status" data-sense="smell">OK</span></div>
      <div class="check-item"><span>Taste</span><span class="status" data-sense="taste">OK</span></div>
    `;

    this.container.appendChild(this.canvas);
    this.container.appendChild(this.textEl);
    this.container.appendChild(this.checksEl);
    document.body.appendChild(this.container);
  }

  setupCanvas() {
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize);

    for (let i = 0; i < 80; i++) {
      this.particles.push(this.createParticle());
    }
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticle() {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.3 + Math.random() * 1.8;
    return {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 1 + Math.random() * 2,
      life: 1,
      decay: 0.002 + Math.random() * 0.006,
      orbital: false,
      color: `hsl(${190 + Math.random() * 40}, 80%, ${55 + Math.random() * 25}%)`
    };
  }

  createAmbientParticle() {
    return {
      orbital: true,
      orbitR: 130 + Math.random() * 240,
      angle: Math.random() * Math.PI * 2,
      speed: 0.002 + Math.random() * 0.006,
      size: 1 + Math.random() * 1.5
    };
  }

  showText() {
    this.textEl.classList.add('visible');
  }

  showSystemChecks() {
    this.checksEl.classList.add('visible');
    ['vision', 'hearing', 'touch', 'smell', 'taste'].forEach((sense, i) => {
      setTimeout(() => {
        const el = this.checksEl.querySelector(`[data-sense="${sense}"]`);
        if (el) el.classList.add('ok');
      }, i * 280);
    });
  }

  async transitionToAmbient() {
    this.textEl.classList.add('fade-out');
    this.checksEl.classList.add('fade-out');
    await this.wait(700);

    this.textEl.style.display = 'none';
    this.checksEl.style.display = 'none';

    this.mode = 'ambient';
    this.container.classList.add('ambient-mode');

    this.rings = [];
    for (let i = 0; i < 5; i++) {
      this.rings.push({
        baseRadius: 110 + i * 85,
        alpha: 0.2 - i * 0.028,
        hue: 195 + i * 4
      });
    }

    this.particles = [];
    for (let i = 0; i < 45; i++) {
      this.particles.push(this.createAmbientParticle());
    }
  }

  animate = () => {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    if (this.mode === 'intro') {
      this.ctx.fillStyle = 'rgba(2, 7, 19, 0.22)';
      this.ctx.fillRect(0, 0, w, h);

      if (this.rings.length < 6 && Math.random() < 0.04) {
        this.rings.push({
          radius: 10,
          speed: 4 + Math.random() * 3,
          alpha: 0.55,
          hue: 195 + Math.random() * 30,
          expanding: true
        });
      }

      for (let i = this.rings.length - 1; i >= 0; i--) {
        const ring = this.rings[i];
        if (ring.expanding) {
          ring.radius += ring.speed;
          ring.alpha -= 0.008;
          this.ctx.beginPath();
          this.ctx.arc(cx, cy, ring.radius, 0, Math.PI * 2);
          this.ctx.strokeStyle = `hsla(${ring.hue}, 80%, 65%, ${ring.alpha})`;
          this.ctx.lineWidth = 1.5;
          this.ctx.stroke();
          if (ring.alpha <= 0) this.rings.splice(i, 1);
        }
      }

      this.particles.forEach((p, i) => {
        if (p.orbital) return;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color.replace(')', `, ${p.life})`).replace('hsl', 'hsla');
        this.ctx.fill();
        if (p.life <= 0) this.particles[i] = this.createParticle();
      });
    } else {
      // Ambient HUD
      this.ctx.fillStyle = 'rgba(2, 7, 19, 0.4)';
      this.ctx.fillRect(0, 0, w, h);

      this.spinAngle += 0.0022;

      this.rings.forEach((ring, i) => {
        const r = ring.baseRadius + Math.sin(this.spinAngle * 2 + i) * 6;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
        this.ctx.strokeStyle = `hsla(${ring.hue}, 70%, 55%, ${ring.alpha})`;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        const segs = 3 + i;
        for (let s = 0; s < segs; s++) {
          const dir = i % 2 === 0 ? 1 : -1;
          const a0 = this.spinAngle * dir + (s / segs) * Math.PI * 2;
          const a1 = a0 + 0.32;
          this.ctx.beginPath();
          this.ctx.arc(cx, cy, r, a0, a1);
          this.ctx.strokeStyle = `hsla(195, 90%, 70%, ${0.22 + Math.sin(this.spinAngle * 3 + s) * 0.12})`;
          this.ctx.lineWidth = 1.8;
          this.ctx.stroke();
        }
      });

      // Tick marks
      this.ctx.strokeStyle = 'rgba(100, 180, 255, 0.1)';
      this.ctx.lineWidth = 1;
      const tickR = Math.min(w, h) * 0.32;
      for (let t = 0; t < 16; t++) {
        const a = (t / 16) * Math.PI * 2 + this.spinAngle * 0.25;
        this.ctx.beginPath();
        this.ctx.moveTo(cx + Math.cos(a) * (tickR - 5), cy + Math.sin(a) * (tickR - 5));
        this.ctx.lineTo(cx + Math.cos(a) * (tickR + 5), cy + Math.sin(a) * (tickR + 5));
        this.ctx.stroke();
      }

      // Orbital particles
      this.particles.forEach((p) => {
        if (!p.orbital) return;
        p.angle += p.speed;
        const x = cx + Math.cos(p.angle) * p.orbitR;
        const y = cy + Math.sin(p.angle) * p.orbitR;
        const alpha = 0.25 + Math.sin(p.angle * 3) * 0.2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(120, 190, 255, ${alpha})`;
        this.ctx.fill();
      });
    }

    this.animationId = requestAnimationFrame(this.animate);
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  destroy() {
    cancelAnimationFrame(this.animationId);
    if (this._onResize) window.removeEventListener('resize', this._onResize);
    if (this.container?.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
