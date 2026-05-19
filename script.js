/* ═══════════════════════════════════════════════════════
   MAMILLA CHANDRASEKHAR — PREMIUM PORTFOLIO
   script.js — All animations, interactions, WebGL effects
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────────────
   1. LOADER
────────────────────────────────────────────────────── */
(function initLoader() {
  const loader  = document.getElementById('loader');
  const bar     = document.getElementById('loaderBar');
  const pct     = document.getElementById('loaderPct');
  const msgs    = ['Initializing systems...', 'Loading firmware...', 'Calibrating sensors...', 'Ready.'];
  const loaderText = document.querySelector('.loader-text');
  let progress = 0;

  const interval = setInterval(() => {
    const step = Math.random() * 12 + 4;
    progress = Math.min(progress + step, 100);
    bar.style.width = progress + '%';
    pct.textContent = Math.floor(progress) + '%';
    loaderText.textContent = msgs[Math.floor(progress / 25)] || msgs[3];

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        loader.classList.add('out');
        document.body.style.overflow = '';
        triggerHeroAnimations();
      }, 400);
    }
  }, 60);

  document.body.style.overflow = 'hidden';
})();

/* ──────────────────────────────────────────────────────
   2. CUSTOM CURSOR
────────────────────────────────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let rx = 0, ry = 0, mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let raf;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function animateCursor() {
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    raf = requestAnimationFrame(animateCursor);
  }
  animateCursor();

  const hoverTargets = document.querySelectorAll('a, button, [data-magnetic], .skill-chip, .project-card, .cert-card, .edu-card');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
})();

/* ──────────────────────────────────────────────────────
   3. MAGNETIC BUTTONS
────────────────────────────────────────────────────── */
(function initMagnetic() {
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    const strength = 0.35;

    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
      el.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
      setTimeout(() => el.style.transition = '', 500);
    });
  });
})();

/* ──────────────────────────────────────────────────────
   4. NEURAL NETWORK CANVAS
────────────────────────────────────────────────────── */
(function initNeuralCanvas() {
  const canvas = document.getElementById('neural-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];
  let mouseX = -9999, mouseY = -9999;

  const config = {
    particleCount: () => Math.floor((W * H) / 9000),
    maxDist:  130,
    mouseRad: 180,
    speed:    0.35,
    dotColor: 'rgba(0,229,255,',
    lineColor:'rgba(0,229,255,',
  };

  class Particle {
    constructor() { this.init(); }
    init() {
      this.x   = Math.random() * W;
      this.y   = Math.random() * H;
      this.vx  = (Math.random() - 0.5) * config.speed;
      this.vy  = (Math.random() - 0.5) * config.speed;
      this.r   = Math.random() * 1.2 + 0.4;
      this.a   = Math.random() * 0.4 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
      // Gentle mouse repulsion
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 80 && d > 0) {
        const f = (80 - d) / 80 * 0.4;
        this.x += (dx / d) * f;
        this.y += (dy / d) * f;
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = config.dotColor + this.a + ')';
      ctx.fill();
    }
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function initParticles() {
    particles = Array.from({ length: config.particleCount() }, () => new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < config.maxDist) {
          const a = (1 - d / config.maxDist) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = config.lineColor + a + ')';
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }
      // Mouse connections
      const dx = particles[i].x - mouseX;
      const dy = particles[i].y - mouseY;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < config.mouseRad) {
        const a = (1 - d / config.mouseRad) * 0.4;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouseX, mouseY);
        ctx.strokeStyle = config.lineColor + a + ')';
        ctx.lineWidth   = 0.8;
        ctx.stroke();
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { resize(); initParticles(); });
  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
  document.addEventListener('mouseleave', () => { mouseX = -9999; mouseY = -9999; });

  resize();
  initParticles();
  loop();
})();

/* ──────────────────────────────────────────────────────
   5. NAVBAR SCROLL BEHAVIOR
────────────────────────────────────────────────────── */
(function initNav() {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const menu   = document.getElementById('mobileMenu');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    menu.classList.toggle('open');
    document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
  });

  menu.querySelectorAll('.mob-link').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      menu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();

/* ──────────────────────────────────────────────────────
   6. SCROLL REVEAL (IntersectionObserver)
────────────────────────────────────────────────────── */
function initReveal() {
  const els = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = parseInt(e.target.dataset.delay || 0);
        setTimeout(() => e.target.classList.add('visible'), delay);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  els.forEach(el => io.observe(el));
}

/* ──────────────────────────────────────────────────────
   7. HERO ENTRANCE ANIMATIONS
────────────────────────────────────────────────────── */
function triggerHeroAnimations() {
  initReveal();
  animateStats();

  // Stagger hero lines
  document.querySelectorAll('.line-inner').forEach((el, i) => {
    el.style.transform = 'translateY(100%)';
    el.style.transition = `transform 0.9s cubic-bezier(0.4,0,0.2,1) ${i * 0.12}s`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transform = 'translateY(0)';
      });
    });
  });
}

/* ──────────────────────────────────────────────────────
   8. COUNTER ANIMATION
────────────────────────────────────────────────────── */
function animateStats() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target  = parseFloat(el.dataset.count);
    const suffix  = el.dataset.suffix || '';
    const decimal = target % 1 !== 0;
    const dur = 1800;
    const start = performance.now();

    function tick(now) {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out-cubic
      const val = target * eased;
      el.textContent = (decimal ? val.toFixed(2) : Math.floor(val)) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

/* ──────────────────────────────────────────────────────
   9. SKILL BARS — scroll triggered
────────────────────────────────────────────────────── */
(function initSkillBars() {
  const skillWrap = document.getElementById('skillBars');
  if (!skillWrap) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        skillWrap.classList.add('animated');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  io.observe(skillWrap);
})();

/* ──────────────────────────────────────────────────────
   10. 3D CARD MOUSE PARALLAX
────────────────────────────────────────────────────── */
(function initCard3D() {
  const wrap = document.getElementById('card3dWrap');
  const card = document.getElementById('devCard');
  if (!wrap || !card) return;

  wrap.addEventListener('mousemove', e => {
    const rect = wrap.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const rx   = ((e.clientY - cy) / rect.height) * -20;
    const ry   = ((e.clientX - cx) / rect.width)  *  20;
    card.style.animation = 'none';
    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(20px)`;
    card.style.transition = 'transform 0.15s ease';
  });

  wrap.addEventListener('mouseleave', () => {
    card.style.animation  = 'cardIdle 7s ease-in-out infinite';
    card.style.transform  = '';
    card.style.transition = '';
  });
})();

/* ──────────────────────────────────────────────────────
   11. PROJECT CARD TILT
────────────────────────────────────────────────────── */
(function initTiltCards() {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / rect.width  * 10;
      const dy   = (e.clientY - cy) / rect.height * -10;
      card.style.transform = `perspective(800px) rotateY(${dx}deg) rotateX(${dy}deg) translateY(-6px)`;
      card.style.transition = 'transform 0.1s ease, box-shadow 0.1s ease';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = 'perspective(800px) rotateY(0) rotateX(0)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s';
    });
  });
})();

/* ──────────────────────────────────────────────────────
   12. PARALLAX SCROLLING (hero orbs)
────────────────────────────────────────────────────── */
(function initParallax() {
  const orbs = document.querySelectorAll('.hero-bg-orb');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    orbs.forEach((orb, i) => {
      const speed = (i + 1) * 0.12;
      orb.style.transform = `translateY(${y * speed}px)`;
    });
  }, { passive: true });
})();

/* ──────────────────────────────────────────────────────
   13. ACTIVE NAV LINK on scroll
────────────────────────────────────────────────────── */
(function initActiveNav() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 120;
    sections.forEach(s => {
      if (scrollY >= s.offsetTop && scrollY < s.offsetTop + s.offsetHeight) {
        navLinks.forEach(l => {
          l.style.color = l.getAttribute('href') === '#' + s.id ? 'var(--cyan)' : '';
        });
      }
    });
  }, { passive: true });
})();

/* ──────────────────────────────────────────────────────
   14. GLITCH EFFECT on hero name (rare, subtle)
────────────────────────────────────────────────────── */
(function initGlitch() {
  const name = document.querySelector('.hero-name');
  if (!name) return;

  setInterval(() => {
    if (Math.random() > 0.92) {
      name.style.textShadow = `2px 0 rgba(0,229,255,0.5), -2px 0 rgba(255,209,102,0.4)`;
      name.style.transform  = `translateX(${(Math.random() - 0.5) * 3}px)`;
      setTimeout(() => {
        name.style.textShadow = '';
        name.style.transform  = '';
      }, 80);
    }
  }, 2400);
})();

/* ──────────────────────────────────────────────────────
   15. SMOOTH SCROLL for anchor links
────────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ──────────────────────────────────────────────────────
   16. REVEAL STAGGER on section tag + title
────────────────────────────────────────────────────── */
(function initSectionReveal() {
  const headers = document.querySelectorAll('.section-header');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const tag   = e.target.querySelector('.section-tag');
        const title = e.target.querySelector('.section-title');
        if (tag)   { tag.style.opacity   = '1'; tag.style.transform   = 'none'; tag.style.transition   = 'all 0.6s ease 0s'; }
        if (title) { title.style.opacity = '1'; title.style.transform = 'none'; title.style.transition = 'all 0.7s ease 0.1s'; }
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });

  headers.forEach(h => {
    const tag   = h.querySelector('.section-tag');
    const title = h.querySelector('.section-title');
    if (tag)   { tag.style.opacity   = '0'; tag.style.transform   = 'translateY(20px)'; }
    if (title) { title.style.opacity = '0'; title.style.transform = 'translateY(24px)'; }
    io.observe(h);
  });
})();

/* ──────────────────────────────────────────────────────
   17. CONTACT RIPPLE EFFECT on hover
────────────────────────────────────────────────────── */
(function initRippleEffect() {
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', e => {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position:absolute; border-radius:50%;
        background:rgba(255,255,255,0.3);
        width:${size}px; height:${size}px;
        left:${e.clientX - rect.left - size/2}px;
        top:${e.clientY - rect.top - size/2}px;
        transform:scale(0); animation:rippleAnim 0.6s ease-out forwards;
        pointer-events:none;
      `;
      if (!document.querySelector('#rippleStyle')) {
        const style = document.createElement('style');
        style.id = 'rippleStyle';
        style.textContent = '@keyframes rippleAnim{to{transform:scale(2);opacity:0}}';
        document.head.appendChild(style);
      }
      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
})();

/* ──────────────────────────────────────────────────────
   18. TYPING EFFECT on hero sub (after load)
────────────────────────────────────────────────────── */
(function initTyping() {
  const el = document.querySelector('.hero-sub');
  if (!el) return;
  const original = el.innerHTML;
  el.innerHTML = '';
  let i = 0;
  const chars = original.split('');

  setTimeout(() => {
    const interval = setInterval(() => {
      el.innerHTML += chars[i];
      i++;
      if (i >= chars.length) clearInterval(interval);
    }, 18);
  }, 1800); // after loader
})();

/* ──────────────────────────────────────────────────────
   19. FOOTER REVEAL
────────────────────────────────────────────────────── */
(function initFooter() {
  const footer = document.querySelector('footer');
  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      footer.style.opacity   = '1';
      footer.style.transform = 'none';
      io.disconnect();
    }
  }, { threshold: 0.5 });
  footer.style.opacity   = '0';
  footer.style.transform = 'translateY(20px)';
  footer.style.transition = 'all 0.8s ease';
  io.observe(footer);
})();
