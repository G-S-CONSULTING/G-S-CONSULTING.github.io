/* ==========================================================================
   GS Consulting — Home Page
   Animations : GSAP + ScrollTrigger + ScrollSmoother + SplitText (fichiers locaux)
   ========================================================================== */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  /* Écran étroit ou tactile : animations allégées (pas de masque animé, moins d'éléments animés un par un) */
  const light = matchMedia('(max-width: 999.98px), (pointer: coarse)').matches;

  const nav = $('#nav');
  const menu = $('#menu');
  const burger = $('#burger');
  const fab = $('#fab');
  const progress = $('#progress');
  const intro = $('#intro');
  const video = $('#pubVideo');
  let smoother = null;

  /* ---------- Tableur décoratif (section « sur mesure ») ---------- */
  (function buildSheet() {
    const sheet = $('#sheet');
    if (!sheet) return;
    const special = { '2-3': '#REF!', '5-4': '#N/A', '7-1': '#VALEUR!' };
    const dup = ['3-0', '4-0', '6-2'];
    const widths = [72, 48, 64, 38, 56, 80, 44, 60, 35, 68];
    let html = ['', 'A', 'B', 'C', 'D', 'E'].map((c) => `<div class="hd">${c}</div>`).join('');
    for (let r = 1; r <= 8; r++) {
      html += `<div class="hd">${r}</div>`;
      for (let c = 0; c < 5; c++) {
        const k = `${r}-${c}`;
        html += special[k]
          ? `<div class="err">${special[k]}</div>`
          : `<div class="${dup.includes(k) ? 'dup' : ''}"><i style="width:${widths[(r * 3 + c * 7) % 10]}%"></i></div>`;
      }
    }
    sheet.innerHTML = html;
  })();

  /* ---------- Menu mobile ---------- */
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    if (smoother) smoother.paused(open);
    else root.style.overflow = open ? 'hidden' : '';
    if (open) nav.classList.remove('is-hidden');
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Ancres ---------- */
  const scrollToTarget = (id) => {
    const target = id === '#top' ? document.body : $(id);
    if (!target) return false;
    if (!smoother) { target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); return true; }
    const y = id === '#top' ? 0 : smoother.offset(target, id === '#wavy' ? 'top top' : 'top 72px');
    if (ScrollTrigger.isTouch === 1) window.scrollTo({ top: y, behavior: 'smooth' });
    else smoother.scrollTo(y, true);
    return true;
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    setMenu(false);
    if (scrollToTarget(id)) e.preventDefault();
  });

  /* ---------- État de la navigation (barre, lien actif, bouton flottant) ---------- */
  const navLinks = $$('.nav-links a').map((a) => ({ a, sec: $(a.getAttribute('href')) }));
  const contact = $('#contact');
  let lastY = 0;
  const updateChrome = (y, max) => {
    const vh = innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    nav.classList.toggle('is-stuck', y > 40);
    const goingDown = y > lastY + 2;
    const goingUp = y < lastY - 2;
    if (!menu.classList.contains('is-open')) {
      if (goingDown && y > vh * 0.8) nav.classList.add('is-hidden');
      else if (goingUp || y < vh * 0.8) nav.classList.remove('is-hidden');
    }
    lastY = y;
    navLinks.forEach(({ a, sec }) => {
      const r = sec.getBoundingClientRect();
      a.classList.toggle('is-active', r.top <= vh * 0.5 && r.bottom >= vh * 0.5);
    });
    fab.classList.toggle('show', y > vh * 1.3 && contact.getBoundingClientRect().top > vh * 0.7);
  };

  /* ==========================================================================
     Mode statique : mouvement réduit ou GSAP indisponible
     ========================================================================== */
  if (reduce || !window.gsap || !window.ScrollTrigger) {
    root.classList.add('reduce');
    if (intro) intro.remove();
    if (video) video.controls = true;
    const g = $('.wavy-glows i');
    if (g) g.classList.add('on');
    const onScroll = () => updateChrome(scrollY, root.scrollHeight - innerHeight);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return;
  }

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
  gsap.defaults({ overwrite: 'auto' });
  /* iOS : la barre d'adresse qui se replie ne doit pas relancer tous les calculs de scroll */
  ScrollTrigger.config({ ignoreMobileResize: true });
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  root.style.overflow = 'hidden';

  /* ==========================================================================
     INTRO : prise de mesures
     ========================================================================== */
  function playIntro() {
    const count = $('#introCount');
    const label = $('#introLabel');
    const o = { v: 0 };
    return gsap.timeline({ defaults: { ease: 'expo.out' } })
      .from('.intro-mark .lh', { scaleX: 0, transformOrigin: '50% 50%', duration: 1.1 }, 0)
      .from('.intro-mark .lv', { scaleY: 0, transformOrigin: '50% 50%', duration: 1.1 }, 0.08)
      .from('.intro-mark .dot', { scale: 0, transformOrigin: '50% 50%', duration: 0.6, ease: 'back.out(3)' }, 0.2)
      .to('.intro-mark .c', { strokeDashoffset: 0, duration: 1.5, stagger: 0.14, ease: 'power3.inOut' }, 0.15)
      .from('.intro-foot > *, .intro-count', { opacity: 0, y: 10, duration: 0.6, stagger: 0.08 }, 0.2)
      .from('.intro-logo', { opacity: 0, scale: 0.6, duration: 0.9 }, 0.75)
      .to('.intro-mark .dot', { opacity: 0, duration: 0.3, ease: 'none' }, 0.75)
      .to(o, { v: 100, duration: 1.5, ease: 'power2.inOut', onUpdate() { count.textContent = String(Math.round(o.v)).padStart(3, '0'); } }, 0.25)
      .call(() => { label.textContent = 'À votre mesure'; }, null, 1.75)
      .to({}, { duration: 0.2 });
  }

  function openIntro() {
    const tl = gsap.timeline({ onComplete() { intro.remove(); } });
    if (light) {
      /* Mobile / tactile : simple fondu, entièrement géré par la carte graphique */
      tl.to('.intro-inner', { scale: 1.25, opacity: 0, duration: 0.55, ease: 'power2.in' }, 0)
        .to('.intro-foot', { opacity: 0, duration: 0.35 }, 0)
        .to(intro, { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 0.3)
        .add(heroEntrance(), 0.45)
        .call(() => { smoother.paused(false); }, null, 0.8);
      return;
    }
    const R = Math.hypot(innerWidth, innerHeight) / 2 + 60;
    intro.classList.add('is-opening');
    tl.to('.intro-inner', { scale: 1.5, opacity: 0, duration: 0.8, ease: 'power2.in' }, 0)
      .to('.intro-foot', { opacity: 0, duration: 0.4 }, 0)
      .fromTo(intro, { '--hole': '0px' }, { '--hole': `${R}px`, duration: 1.3, ease: 'expo.inOut' }, 0.1)
      .add(heroEntrance(), 0.6)
      .call(() => { smoother.paused(false); }, null, 1.1);
  }

  /* ==========================================================================
     HERO
     ========================================================================== */
  function heroEntrance() {
    const split = SplitText.create('#heroTitle', { type: 'lines', mask: 'lines', linesClass: 'line', autoSplit: true });
    return gsap.timeline({ defaults: { ease: 'expo.out' } })
      .from(split.lines, { yPercent: 118, duration: 1.25, stagger: 0.1 }, 0)
      .from('.nav-inner', { y: -40, opacity: 0, duration: 1, clearProps: 'transform,opacity' }, 0.15)
      .from('.hero [data-hero="fade"]', { y: 26, opacity: 0, duration: 1, stagger: 0.09 }, 0.35)
      .from('.cote-line', { scaleX: 0, duration: 1.2, ease: 'expo.inOut' }, 0.4)
      .from('.cote span', { opacity: 0, duration: 0.7 }, 0.95)
      .from('.stage-wrap', { yPercent: 45, opacity: 0, duration: 1.6 }, 0.25)
      .from('.float', { scale: 0, opacity: 0, duration: 1.1, stagger: 0.09, ease: 'back.out(1.6)' }, 0.5);
  }

  function heroScroll() {
    const hero = $('.hero');
    const stage = $('.stage');
    const wrap = $('.stage-wrap');
    const mm = gsap.matchMedia();

    /* Écran large : le hero est épinglé, la fenêtre se redresse et prend l'écran */
    mm.add('(min-width: 1000px)', () => {
      gsap.set(stage, { rotationX: 44, scale: 0.9 });
      const finalY = () => Math.max(84, (innerHeight - stage.offsetHeight) / 2 + 24) - wrap.offsetTop;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: hero, start: 'top top', end: '+=115%', pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 1 },
      });
      tl.to('.hero-copy', { yPercent: -18, opacity: 0, scale: 0.95, duration: 0.42, ease: 'power2.in' }, 0)
        .to('.scroll-hint', { opacity: 0, duration: 0.15 }, 0)
        .to(stage, { rotationX: 0, scale: 1, y: finalY, duration: 1, ease: 'power2.inOut' }, 0)
        .to('.hero-halo', { yPercent: 16, scale: 1.18, duration: 1, ease: 'none' }, 0)
        .to('.hero-grid', { yPercent: -7, duration: 1, ease: 'none' }, 0)
        .from('.kpi, .todo-row', { opacity: 0, y: 14, duration: 0.3, stagger: 0.04, ease: 'power2.out' }, 0.28)
        .from('.bars i', { scaleY: 0, duration: 0.45, stagger: 0.03, ease: 'power3.out' }, 0.36);
      $$('.float').forEach((f, i) => {
        const d = parseFloat(f.dataset.depth) || 1;
        tl.to(f, { y: () => -innerHeight * (0.45 + 0.6 * d), x: (i % 2 ? 1 : -1) * 60 * d, rotation: (i % 2 ? 1 : -1) * 14, duration: 1, ease: 'none' }, 0);
      });
      tl.to({}, { duration: 0.1 });
      gsap.delayedCall(0.05, () => { ScrollTrigger.sort(); ScrollTrigger.refresh(); });
    });

    /* Mobile et tablette : pas d'épinglage (source de saccades sur iOS).
       La fenêtre suit le scroll naturel et se redresse : un seul calque, une seule transformation. */
    mm.add('(max-width: 999.98px)', () => {
      gsap.set(stage, { rotationX: 30, scale: 0.94 });
      gsap.to(stage, { rotationX: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: wrap, start: 'clamp(top 88%)', end: 'top 32%', scrub: true } });
      gsap.from('.bars i', { scaleY: 0, duration: 0.8, stagger: 0.04, ease: 'power3.out', scrollTrigger: { trigger: wrap, start: 'top 55%', once: true } });
    });

    if (fine) {
      const rx = gsap.quickTo('.win', 'rotationX', { duration: 0.9, ease: 'power3' });
      const ry = gsap.quickTo('.win', 'rotationY', { duration: 0.9, ease: 'power3' });
      const hx = gsap.quickTo('.hero-halo', 'x', { duration: 1.8, ease: 'power3' });
      const fm = $$('.float').map((f) => {
        const el = $('.float-m', f);
        return { d: parseFloat(f.dataset.depth) || 1, x: gsap.quickTo(el, 'x', { duration: 1.1, ease: 'power3' }), y: gsap.quickTo(el, 'y', { duration: 1.1, ease: 'power3' }) };
      });
      hero.addEventListener('pointermove', (e) => {
        const nx = e.clientX / innerWidth - 0.5;
        const ny = e.clientY / innerHeight - 0.5;
        ry(nx * 5); rx(-ny * 3); hx(nx * 90);
        fm.forEach((f) => { f.x(nx * -50 * f.d); f.y(ny * -36 * f.d); });
      });
    }
  }

  /* ==========================================================================
     BANDEAU DÉFILANT : réagit à la vitesse et au sens du scroll
     ========================================================================== */
  function marquee() {
    const tween = gsap.to('.marquee-track', { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
    tween.totalTime(tween.duration() * 50);
    let dir = 1;
    ScrollTrigger.create({
      trigger: '.marquee', start: 'top bottom', end: 'bottom top',
      onUpdate(self) {
        const v = self.getVelocity();
        if (Math.abs(v) > 20) dir = v < 0 ? -1 : 1;
        const boost = gsap.utils.clamp(1, 8, 1 + Math.abs(v) / 240);
        gsap.to(tween, { timeScale: dir * boost, duration: 0.2, overwrite: true, onComplete: () => gsap.to(tween, { timeScale: dir, duration: 1, overwrite: true }) });
      },
    });
  }

  /* ==========================================================================
     CONSTAT : les mots s'allument au scroll
     ========================================================================== */
  function manifesto() {
    SplitText.create('#manifesto', {
      type: 'words', autoSplit: true,
      onSplit(self) {
        return gsap.fromTo(self.words, { opacity: 0.14 }, {
          opacity: 1, stagger: 0.1, ease: 'none',
          scrollTrigger: { trigger: '.manifesto', start: 'top 72%', end: 'bottom 62%', scrub: 0.4 },
        });
      },
    });
  }

  /* ==========================================================================
     SUR MESURE : le tableur devient une application
     ========================================================================== */
  function custom() {
    gsap.set('.tab-after', { yPercent: 100 });
    gsap.timeline({ scrollTrigger: { trigger: '#morph', start: 'top 74%', end: 'top 14%', scrub: 0.6 } })
      /* sur mobile : un seul calque animé au lieu de 54 cellules */
      .to(light ? '#sheet' : '#sheet div', light
        ? { opacity: 0, scale: 0.96, duration: 0.5, ease: 'power2.in' }
        : { opacity: 0, scale: 0.5, duration: 0.45, stagger: { amount: 0.5, from: 'random' }, ease: 'power2.in' }, 0)
      .to('.tab-before', { yPercent: -100, duration: 0.3, ease: 'power2.inOut' }, 0.4)
      .to('.tab-after', { yPercent: 0, duration: 0.3, ease: 'power2.inOut' }, 0.4)
      .from('.app-kpis div, .app-chart, .app-rows div', { opacity: 0, y: 24, scale: 0.94, duration: 0.4, stagger: 0.06, ease: 'power3.out' }, 0.55)
      .fromTo('.app-chart svg', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'power2.out' }, 0.8);
  }

  /* Les grandes cartes « scène » s'ouvrent en entrant dans l'écran */
  function stages() {
    $$('.feature, .contact-card').forEach((card) => {
      gsap.from(card, {
        /* l'arrondi animé repeint toute la carte à chaque image : réservé aux écrans larges */
        scale: 0.9, y: 70, ...(light ? {} : { borderRadius: 64 }), ease: 'none',
        scrollTrigger: { trigger: card.parentElement, start: 'top 98%', end: 'top 40%', scrub: 0.6 },
      });
    });
  }

  /* ==========================================================================
     IA : démonstration d'agent
     ========================================================================== */
  function ai() {
    gsap.set('.msg-draft p', { opacity: 0 });
    gsap.from('#agent', { y: 60, opacity: 0, scale: 0.96, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '#agent', start: 'top 85%', once: true } });
    gsap.timeline({ scrollTrigger: { trigger: '#agent', start: 'top 62%', once: true }, defaults: { ease: 'power3.out' } })
      .from('.msg-in', { y: 24, opacity: 0, scale: 0.96, duration: 0.7 })
      .from('.agent-tags span', { scale: 0.6, opacity: 0, duration: 0.45, stagger: 0.14, ease: 'back.out(2)' }, '+=0.3')
      .from('.msg-draft', { y: 24, opacity: 0, scale: 0.96, duration: 0.6 }, '+=0.25')
      .to('.typing', { opacity: 0, duration: 0.25 }, '+=1.1')
      .to('.msg-draft p', { opacity: 1, duration: 0.5 }, '<')
      .from('.agent-ok', { scale: 0.5, opacity: 0, duration: 0.6, ease: 'back.out(2.2)' }, '+=0.45');
    gsap.to('.ai-glow', { yPercent: 30, ease: 'none', scrollTrigger: { trigger: '.ai', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* ==========================================================================
     FONDATEUR, CABINETS, CONTACT, PIED DE PAGE
     ========================================================================== */
  function closing() {
    gsap.fromTo('.founder-mark', { rotation: -30 }, { rotation: 60, ease: 'none', scrollTrigger: { trigger: '.founder', start: 'top bottom', end: 'bottom top', scrub: true } });

    gsap.fromTo('#phone', { rotationY: -22, rotationX: 10, y: 90 }, {
      rotationY: 0, rotationX: 0, y: 0, ease: 'none',
      scrollTrigger: { trigger: '.phone-wrap', start: 'top 95%', end: 'top 30%', scrub: 0.6 },
    });
    ScrollTrigger.create({
      trigger: '#phone', start: 'top 85%', end: 'bottom 10%',
      onToggle(self) { if (self.isActive) video.play().catch(() => {}); else video.pause(); },
    });

    gsap.fromTo('.contact-mark', { rotation: 0 }, { rotation: 90, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('.footer-word', { yPercent: 45, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top 85%', end: 'bottom bottom', scrub: 0.6 } });
  }

  /* ==========================================================================
     Révélations génériques : titres ligne à ligne, blocs en fondu
     ========================================================================== */
  function reveals() {
    $$('[data-split]').forEach((el) => {
      SplitText.create(el, {
        type: 'lines', mask: 'lines', linesClass: 'line', autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, { yPercent: 118, duration: 1.15, stagger: 0.09, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
        },
      });
    });
    gsap.set('[data-reveal]', { y: 28, opacity: 0 });
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 90%', once: true,
      onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, duration: 0.95, stagger: 0.08, ease: 'power3.out' }),
    });
  }

  /* ==========================================================================
     Micro-interactions (souris uniquement)
     ========================================================================== */
  function micro() {
    if (!fine) return;
    /* Les boutons ne bougent plus sous la souris (effet jugé déroutant) : seuls la couleur et la flèche réagissent. */
    $$('.tilt').forEach((el) => {
      gsap.set(el, { transformPerspective: 900 });
      const rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3' });
      const ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 3);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 3);
      });
      el.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }

  /* ==========================================================================
     Animations dépendantes de la largeur : étapes + suite Wavy
     ========================================================================== */
  function responsive() {
    const glows = $$('.wavy-glows i');
    const glow = (theme) => glows.forEach((g) => g.classList.toggle('on', g.dataset.theme === theme));
    glow('fact');

    const mm = gsap.matchMedia();
    mm.add({ desktop: '(min-width: 1000px)', mobile: '(max-width: 999.98px)' }, (ctx) => {
      const { desktop } = ctx.conditions;

      /* Étapes : la ligne se trace, les étapes s'allument */
      const stepsTl = gsap.timeline({ scrollTrigger: { trigger: '#steps', start: 'top 80%', end: desktop ? 'top 28%' : 'bottom 62%', scrub: 0.6 } });
      stepsTl.fromTo('#stepsLine', desktop ? { scaleX: 0, scaleY: 1 } : { scaleY: 0, scaleX: 1 }, { scaleX: 1, scaleY: 1, ease: 'none', duration: 4 }, 0);
      $$('.step').forEach((s, i) => stepsTl.fromTo(s, { opacity: 0.22, y: 18 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, i + 0.05));

      /* Suite Wavy */
      const cards = $$('.wcard');
      const inner = (card) => $$('.mk-row, .gantt-row', card);
      const growers = (card) => $$('.gantt-row i, .gauge i', card);

      if (desktop) {
        const track = $('#wavyTrack');
        const dist = () => Math.max(0, track.scrollWidth - innerWidth);
        const horiz = gsap.to(track, {
          x: () => -dist(), ease: 'none',
          scrollTrigger: { trigger: '.wavy', start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 1 },
        });
        cards.forEach((card, i) => {
          const st = (start) => (i === 0
            ? { trigger: '.wavy', start: 'top 45%', toggleActions: 'play none none reverse' }
            : { trigger: card, containerAnimation: horiz, start, toggleActions: 'play none none reverse' });
          gsap.from($$('[data-pop]', card), { y: 36, opacity: 0, duration: 0.85, stagger: 0.07, ease: 'power3.out', scrollTrigger: st('left 84%') });
          gsap.from(inner(card), { x: 40, opacity: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out', scrollTrigger: st('left 66%') });
          if (growers(card).length) gsap.from(growers(card), { scaleX: 0, duration: 1, stagger: 0.07, ease: 'power3.out', scrollTrigger: st('left 60%') });
          gsap.from($('.mk-float', card), { y: 60, opacity: 0, scale: 0.9, duration: 0.9, ease: 'back.out(1.5)', scrollTrigger: st('left 50%') });
          gsap.fromTo($('.wstage-in', card), { x: 60 }, { x: -50, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: horiz, start: 'left right', end: 'right left', scrub: true } });
          ScrollTrigger.create({ trigger: card, containerAnimation: horiz, start: 'left 62%', end: 'right 38%', onToggle: (self) => { if (self.isActive) glow(card.dataset.theme); } });
        });
        gsap.from('.wavy-outro > *', { y: 40, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.wavy-outro', containerAnimation: horiz, start: 'left 88%', toggleActions: 'play none none reverse' } });
      } else {
        cards.forEach((card) => {
          gsap.from($$('[data-pop]', card), { y: 30, opacity: 0, duration: 0.85, stagger: 0.07, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 82%', once: true } });
          gsap.from($('.wstage', card), { y: 40, opacity: 0, scale: 0.96, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: $('.wstage', card), start: 'top 88%', once: true } });
          gsap.from(inner(card), { x: 30, opacity: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out', scrollTrigger: { trigger: $('.wstage', card), start: 'top 75%', once: true } });
          if (growers(card).length) gsap.from(growers(card), { scaleX: 0, duration: 1, stagger: 0.07, ease: 'power3.out', scrollTrigger: { trigger: $('.wstage', card), start: 'top 70%', once: true } });
          gsap.from($('.mk-float', card), { y: 40, opacity: 0, scale: 0.9, duration: 0.9, ease: 'back.out(1.5)', scrollTrigger: { trigger: $('.wstage', card), start: 'top 55%', once: true } });
          ScrollTrigger.create({ trigger: card, start: 'top 60%', end: 'bottom 40%', onToggle: (self) => { if (self.isActive) glow(card.dataset.theme); } });
        });
        gsap.from('.wavy-outro > *', { y: 30, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.wavy-outro', start: 'top 86%', once: true } });
      }

      gsap.delayedCall(0.05, () => { ScrollTrigger.sort(); ScrollTrigger.refresh(); });
    });
  }

  /* ==========================================================================
     Démarrage
     ========================================================================== */
  function initPage() {
    root.style.overflow = '';
    smoother = ScrollSmoother.create({ wrapper: '#smooth-wrapper', content: '#smooth-content', smooth: 1.1, smoothTouch: false, effects: false });
    smoother.scrollTop(0);
    smoother.paused(true);

    heroScroll();   // épinglage n°1
    responsive();   // épinglage n°2 (Wavy, écran large) + étapes
    marquee();
    manifesto();
    custom();
    stages();
    ai();
    closing();
    reveals();
    micro();

    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => updateChrome(self.scroll(), ScrollTrigger.maxScroll(window)) });
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  }

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const fontsReady = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, wait(2600)]) : wait(0);
  const introDone = new Promise((resolve) => playIntro().eventCallback('onComplete', resolve));

  Promise.all([introDone, fontsReady]).then(() => {
    initPage();
    openIntro();
  });
})();
