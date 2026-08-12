// src/modules/intro/LinkStart.js
// Animação completa do Link Start (estilo SAO)

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
    this.startTime = null;
  }

  async play() {
    this.createDOM();
    this.setupCanvas();
    this.startTime = performance.now();
    this.animate();
    
    // Sequência temporal da animação
    await this.wait(400);
    Sound.linkStart();
    this.showText();
    
    await this.wait(1200);
    this.showSystemChecks();
    
    await this.wait(2200);
    this.fadeOut();
    
    await this.wait(900);
    this.destroy();
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
    window.addEventListener('resize', () => this.resize());
    
    // Cria partículas iniciais
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
    const speed = 0.5 + Math.random() * 2.5;
    return {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 1 + Math.random() * 2.5,
      life: 1,
      decay: 0.003 + Math.random() * 0.008,
      color: `hsl(${190 + Math.random() * 40}, 80%, ${60 + Math.random() * 20}%)`
    };
  }

  showText() {
    this.textEl.classList.add('visible');
  }

  showSystemChecks() {
    this.checksEl.classList.add('visible');
    const senses = ['vision', 'hearing', 'touch', 'smell', 'taste'];
    senses.forEach((sense, i) => {
      setTimeout(() => {
        const el = this.checksEl.querySelector(`[data-sense="${sense}"]`);
        if (el) el.classList.add('ok');
      }, i * 280);
    });
  }

  fadeOut() {
    this.textEl.classList.add('fade-out');
    this.checksEl.style.opacity = '0';
  }

  animate = (timestamp) => {
    const elapsed = (timestamp - this.startTime) / 1000;
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Anéis expandindo
    if (elapsed > 0.3 && this.rings.length < 6) {
      if (Math.random() < 0.04) {
        this.rings.push({
          radius: 10,
          maxRadius: Math.max(this.canvas.width, this.canvas.height) * 0.9,
          speed: 4 + Math.random() * 3,
          alpha: 0.6,
          hue: 195 + Math.random() * 30
        });
      }
    }

    this.rings.forEach((ring, i) => {
      ring.radius += ring.speed;
      ring.alpha -= 0.008;
      this.ctx.beginPath();
      this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, ring.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = `hsla(${ring.hue}, 80%, 65%, ${ring.alpha})`;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      if (ring.alpha <= 0) this.rings.splice(i, 1);
    });

    // Partículas
    this.particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color.replace(')', `, ${p.life})`).replace('hsl', 'hsla');
      this.ctx.fill();
      if (p.life <= 0) this.particles[i] = this.createParticle();
    });

    this.animationId = requestAnimationFrame(this.animate);
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  destroy() {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.resize);
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
