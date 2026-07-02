/* ============================================
   Mobile nav toggle
   ============================================ */
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    mainNav.classList.toggle('open');
  });

  document.querySelectorAll('.main-nav a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      mainNav.classList.remove('open');
    });
  });
}

/* ============================================
   Hero signature visual: a graph-theory node network.
   Nodes drift slowly and link to nearby neighbours —
   a nod to computational math and to what the Discord
   bot actually does (connecting members of a server).
   ============================================ */
(function initGraph() {
  const canvas = document.getElementById('graph-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width, height, dpr;
  let nodes = [];
  let mouse = { x: -9999, y: -9999 };

  const ACCENT = '86, 216, 197';   // teal, matches --accent
  const WARM = '232, 163, 61';     // amber, matches --warm
  const LINK_DIST = 170;
  const NODE_COUNT_DIVISOR = 14000; // lower = more nodes

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedNodes();
  }

  function seedNodes() {
    const count = Math.max(18, Math.min(46, Math.floor((width * height) / NODE_COUNT_DIVISOR)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.6 + 1.2,
      warm: Math.random() < 0.16
    }));
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    // update
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -20) n.x = width + 20;
      if (n.x > width + 20) n.x = -20;
      if (n.y < -20) n.y = height + 20;
      if (n.y > height + 20) n.y = -20;

      // gentle attraction toward cursor
      const dx = mouse.x - n.x, dy = mouse.y - n.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 220) {
        n.vx += (dx / dist) * 0.0035;
        n.vy += (dy / dist) * 0.0035;
      }
      // speed cap
      const speed = Math.hypot(n.vx, n.vy);
      const maxSpeed = 0.4;
      if (speed > maxSpeed) {
        n.vx = (n.vx / speed) * maxSpeed;
        n.vy = (n.vy / speed) * maxSpeed;
      }
    }

    // links
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK_DIST) {
          const alpha = (1 - d / LINK_DIST) * 0.35;
          ctx.strokeStyle = `rgba(${ACCENT}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // nodes
    for (const n of nodes) {
      const color = n.warm ? WARM : ACCENT;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, 0.85)`;
      ctx.fill();
    }

    if (!prefersReducedMotion) {
      requestAnimationFrame(step);
    }
  }

  window.addEventListener('resize', resize);
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  resize();
  step();

  // Redraw a single static frame if motion is reduced
  if (prefersReducedMotion) {
    step();
  }
})();
