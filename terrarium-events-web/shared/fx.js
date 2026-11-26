// Canvas particle engine (ambient greenhouse fireflies/O2 + bursts + fly-to-wallet).
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

class FXEngine {
  constructor() {
    this.ambientCanvas = null;
    this.burstCanvas = null;
    this.ambientCtx = null;
    this.burstCtx = null;
    this.motes = [];
    this.particles = [];
    this.rafAmbient = 0;
    this.rafBurst = 0;
    this.initialized = false;
  }

  init() {
    if (this.initialized || typeof document === 'undefined') return;
    this.initialized = true;

    const makeCanvas = (id, z) => {
      const c = document.createElement('canvas');
      c.id = id;
      c.className = 'fx-canvas';
      c.style.zIndex = String(z);
      c.setAttribute('aria-hidden', 'true');
      document.body.appendChild(c);
      return c;
    };

    this.ambientCanvas = makeCanvas('fx-ambient', 0);
    this.burstCanvas = makeCanvas('fx-burst', 60);
    this.ambientCtx = this.ambientCanvas.getContext('2d');
    this.burstCtx = this.burstCanvas.getContext('2d');

    this._resize();
    window.addEventListener('resize', () => this._resize());

    if (!reducedMotion()) {
      this._seedMotes();
      this._loopAmbient();
    }
  }

  _resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (const c of [this.ambientCanvas, this.burstCanvas]) {
      if (!c) continue;
      c.width = Math.floor(w * dpr);
      c.height = Math.floor(h * dpr);
      c.style.width = `${w}px`;
      c.style.height = `${h}px`;
      const ctx = c.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  _seedMotes() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const count = Math.min(26, Math.max(12, Math.floor((w * h) / 28000)));
    this.motes = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: i % 3 === 0 ? 3 + Math.random() * 4.5 : 1.4 + Math.random() * 2.4,
      vy: -(0.16 + Math.random() * 0.32),
      vx: (Math.random() - 0.5) * 0.22,
      phase: Math.random() * Math.PI * 2,
      bubble: i % 3 === 0,
      alpha: 0.16 + Math.random() * 0.34
    }));
  }

  _loopAmbient() {
    const ctx = this.ambientCtx;
    if (!ctx) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    for (const m of this.motes) {
      m.phase += 0.02;
      m.x += m.vx + Math.sin(m.phase) * 0.18;
      m.y += m.vy;
      if (m.y < -16) {
        m.y = h + 16;
        m.x = Math.random() * w;
      }
      if (m.x < -16) m.x = w + 16;
      if (m.x > w + 16) m.x = -16;

      if (m.bubble) {
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(176, 245, 224, ${m.alpha * 0.65})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(m.x - m.r * 0.32, m.y - m.r * 0.32, m.r * 0.28, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${m.alpha * 0.85})`;
        ctx.fill();
      } else {
        const pulse = 0.6 + 0.4 * Math.sin(m.phase * 1.4);
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 250, 148, ${m.alpha * pulse})`;
        ctx.fill();
      }
    }

    this.rafAmbient = requestAnimationFrame(() => this._loopAmbient());
  }

  burst(x, y, { count = 26, colors = ['#cbfa8a', '#ffdc89', '#7ef2c8', '#ffffff'], spread = 7.5 } = {}) {
    if (reducedMotion()) return;
    this.init();
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 1.8 + Math.random() * spread;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.2,
        size: 3.5 + Math.random() * 5,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.24,
        color: colors[i % colors.length],
        life: 1,
        decay: 0.015 + Math.random() * 0.015,
        shape: i % 4 === 0 ? 'ring' : i % 2 === 0 ? 'petal' : 'dot'
      });
    }
    this._startBurstLoop();
  }

  burstElement(el, options = {}) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    this.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, options);
  }

  celebrate() {
    if (reducedMotion()) return;
    this.init();
    const w = window.innerWidth;
    const h = window.innerHeight;
    const palette = ['#cbfa8a', '#ffdc89', '#67e8c2', '#ffb38a', '#ffffff'];
    this.burst(w * 0.25, h * 0.38, { count: 34, colors: palette, spread: 9 });
    this.burst(w * 0.75, h * 0.38, { count: 34, colors: palette, spread: 9 });
    setTimeout(() => {
      this.burst(w * 0.5, h * 0.26, { count: 40, colors: palette, spread: 10 });
    }, 180);
  }

  _startBurstLoop() {
    if (this.rafBurst) return;
    const tick = () => {
      const ctx = this.burstCtx;
      if (!ctx) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.16;
        p.vx *= 0.985;
        p.rot += p.vrot;
        p.life -= p.decay;
        if (p.life <= 0) {
          this.particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.shape === 'ring') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.8, 0, Math.PI * 2);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (p.shape === 'petal') {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.9, p.size * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.55, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (this.particles.length > 0) {
        this.rafBurst = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, w, h);
        this.rafBurst = 0;
      }
    };
    this.rafBurst = requestAnimationFrame(tick);
  }

  floatText(el, text, tone = 'gold') {
    if (!el || reducedMotion()) return;
    const rect = el.getBoundingClientRect();
    const badge = document.createElement('div');
    badge.className = `fx-float fx-float-${tone}`;
    badge.textContent = text;
    badge.style.left = `${rect.left + rect.width / 2}px`;
    badge.style.top = `${rect.top + 8}px`;
    document.body.appendChild(badge);
    badge.addEventListener('animationend', () => badge.remove(), { once: true });
  }

  flyToWallet(fromEl, toEl, imgSrc, fallbackEmoji = '🎁') {
    if (!fromEl || !toEl || reducedMotion()) return;
    const a = fromEl.getBoundingClientRect();
    const b = toEl.getBoundingClientRect();
    if (!a.width || !b.width) return;

    const flyer = document.createElement('div');
    flyer.className = 'fx-flyer';
    if (imgSrc) {
      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = '';
      flyer.appendChild(img);
    } else {
      flyer.textContent = fallbackEmoji;
    }

    const sx = a.left + a.width / 2;
    const sy = a.top + a.height / 2;
    const ex = b.left + b.width / 2;
    const ey = b.top + b.height / 2;
    flyer.style.left = `${sx}px`;
    flyer.style.top = `${sy}px`;
    document.body.appendChild(flyer);

    const anim = flyer.animate(
      [
        { transform: 'translate(-50%, -50%) scale(1.1)', opacity: 1 },
        { transform: `translate(${(ex - sx) * 0.45 - 24}px, ${(ey - sy) * 0.45 - 64}px) scale(1.25)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${ex - sx}px, ${ey - sy}px) scale(0.35)`, opacity: 0.1 }
      ],
      { duration: 640, easing: 'cubic-bezier(.22, .85, .36, 1)' }
    );
    anim.onfinish = () => {
      flyer.remove();
      toEl.classList.remove('is-pop');
      void toEl.offsetWidth;
      toEl.classList.add('is-pop');
    };
  }
}

export const fx = new FXEngine();
