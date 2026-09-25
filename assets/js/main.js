gsap.registerPlugin(ScrollTrigger);

const root = document.documentElement;
// Motion is the core of this site, so it plays even when the OS asks for reduced motion
// (Windows turns that on whenever "Animation effects" is off).
const reduced = false;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

let lenis = null;

/* ------------------------------------------------------------
   Smooth scroll
------------------------------------------------------------ */
function initLenis() {
  if (reduced || typeof Lenis === 'undefined') return;
  lenis = new Lenis({
    duration: 1.15,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ------------------------------------------------------------
   Hero headline: scale each line to fill the width
------------------------------------------------------------ */
function fitHeroText() {
  const title = $('.hero-title');
  if (!title) return;
  const width = title.clientWidth;
  const vh = window.innerHeight;
  const small = window.innerWidth <= 820;
  $$('[data-fit]', title).forEach((el, i) => {
    el.style.fontSize = '100px';
    const fitted = (100 * width) / el.scrollWidth;
    const cap = vh * (small ? 0.2 : i === 0 ? 0.3 : 0.24);
    el.style.fontSize = Math.min(fitted, cap) + 'px';
  });
}

/* ------------------------------------------------------------
   Theme
------------------------------------------------------------ */
function initTheme() {
  const btn = $('#themeToggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('ab-theme', root.dataset.theme); } catch (e) {}
  });
}

/* ------------------------------------------------------------
   Intro: counter loader, then hero entrance
------------------------------------------------------------ */
function heroIntro(tl, at) {
  tl.to('.nav', { yPercent: 0, opacity: 1, duration: 1, ease: 'expo.out' }, at + 0.5)
    .to('.hero-bg-word', { opacity: 0.025, scale: 1, duration: 2, ease: 'expo.out' }, at)
    .to('.hero-intro .reveal-line > span', { yPercent: 0, duration: 1.1, ease: 'expo.out' }, at + 0.2)
    .to('.hero-line .fit', { yPercent: 0, duration: 1.4, stagger: 0.12, ease: 'expo.out' }, at + 0.25)
    .to('.hero-portrait', { clipPath: 'inset(0% 0 0 0)', y: 0, duration: 1.6, ease: 'expo.out' }, at + 0.4)
    .to('.hero-badge', { scale: 1, rotate: 0, duration: 1.2, ease: 'expo.out' }, at + 0.9)
    .to('.hero-foot > *', { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'expo.out' }, at + 1);
}

function runIntro() {
  const loader = $('.loader');

  if (reduced) {
    if (loader) loader.remove();
    return;
  }

  gsap.set('.nav', { yPercent: -100, opacity: 0 });
  gsap.set('.hero-bg-word', { opacity: 0, scale: 1.15 });
  gsap.set('.hero-intro .reveal-line > span, .hero-line .fit', { yPercent: 110 });
  gsap.set('.hero-portrait', { clipPath: 'inset(100% 0 0 0)', y: 80 });
  gsap.set('.hero-badge', { scale: 0, rotate: -120 });
  gsap.set('.hero-foot > *', { y: 24, opacity: 0 });

  root.classList.add('is-loading');
  if (lenis) lenis.stop();

  const counter = { v: 0 };
  const countEl = $('#loaderCount');
  const tl = gsap.timeline({
    onComplete: () => {
      if (loader) loader.remove();
      root.classList.remove('is-loading');
      if (lenis) lenis.start();
      ScrollTrigger.refresh();
    }
  });

  tl.to(counter, {
    v: 100,
    duration: 1.9,
    ease: 'power3.inOut',
    onUpdate: () => { if (countEl) countEl.textContent = Math.round(counter.v); }
  })
    .to('.loader-bar span', { scaleX: 1, duration: 1.9, ease: 'power3.inOut' }, 0)
    .to('.loader-count span', { yPercent: -110, duration: 0.6, ease: 'power3.in' }, '+=0.15')
    .to('.loader-top, .loader-note', { opacity: 0, duration: 0.4 }, '<')
    .to('.loader', { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '-=0.1');

  heroIntro(tl, tl.duration() - 0.45);
}

/* ------------------------------------------------------------
   Section transitions (curtain wipe on nav clicks)
------------------------------------------------------------ */
let transitioning = false;

function targetY(target) {
  const el = target.parentElement && target.parentElement.classList.contains('pin-spacer')
    ? target.parentElement
    : target;
  return el.getBoundingClientRect().top + window.scrollY;
}

function jumpTo(target) {
  const y = targetY(target);
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
  ScrollTrigger.update();
}

function goTo(target, label) {
  if (transitioning) return;
  closeMenu();

  if (reduced) { jumpTo(target); return; }

  transitioning = true;
  $('#curtainLabel').textContent = label || '';

  gsap.timeline({ onComplete: () => { transitioning = false; } })
    .set('.curtain', { visibility: 'visible' })
    .set('.curtain-panel', { transformOrigin: 'bottom' })
    .to('.curtain-panel', { scaleY: 1, duration: 0.75, ease: 'expo.inOut' })
    .fromTo('#curtainLabel', { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.55, ease: 'expo.out' }, '-=0.3')
    .add(() => jumpTo(target))
    .set('.curtain-panel', { transformOrigin: 'top' }, '+=0.15')
    .to('#curtainLabel', { yPercent: -70, opacity: 0, duration: 0.45, ease: 'power3.in' })
    .to('.curtain-panel', { scaleY: 0, duration: 0.8, ease: 'expo.inOut' }, '-=0.25')
    .set('.curtain', { visibility: 'hidden' });
}

function initLinks() {
  $$('a[href^="#"]').forEach(link => {
    const hash = link.getAttribute('href');
    if (hash.length < 2) return;
    const target = $(hash);
    if (!target) return;
    link.addEventListener('click', e => {
      e.preventDefault();
      goTo(target, link.dataset.label || target.dataset.name);
    });
  });
}

/* ------------------------------------------------------------
   Navigation: hide on scroll down, mobile menu
------------------------------------------------------------ */
function initNav() {
  const nav = $('.nav');
  let last = 0;
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: self => {
      const y = self.scroll();
      nav.classList.toggle('is-scrolled', y > 40);
      const menuOpen = $('#menuToggle').getAttribute('aria-expanded') === 'true';
      nav.classList.toggle('is-hidden', !menuOpen && y > last && y > 400);
      last = y;
    }
  });

  $('#menuToggle').addEventListener('click', () => {
    const open = $('#menuToggle').getAttribute('aria-expanded') === 'true';
    open ? closeMenu() : openMenu();
  });
}

function openMenu() {
  const btn = $('#menuToggle');
  btn.setAttribute('aria-expanded', 'true');
  btn.setAttribute('aria-label', 'Close menu');
  $('#mobileMenu').setAttribute('aria-hidden', 'false');
  if (lenis) lenis.stop();
  gsap.timeline()
    .set('#mobileMenu', { visibility: 'visible' })
    .to('#mobileMenu', { clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'expo.inOut' })
    .fromTo('#mobileMenu nav a', { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.06, ease: 'expo.out' }, '-=0.35')
    .fromTo('.mobile-menu-foot', { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.5');
}

function closeMenu() {
  const btn = $('#menuToggle');
  if (!btn || btn.getAttribute('aria-expanded') !== 'true') return;
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-label', 'Open menu');
  $('#mobileMenu').setAttribute('aria-hidden', 'true');
  if (lenis) lenis.start();
  gsap.to('#mobileMenu', {
    clipPath: 'inset(0 0 100% 0)',
    duration: 0.7,
    ease: 'expo.inOut',
    onComplete: () => gsap.set('#mobileMenu', { visibility: 'hidden' })
  });
}

/* ------------------------------------------------------------
   Scroll mapping: progress bar, section meter, active nav
------------------------------------------------------------ */
function initScrollMap() {
  gsap.to('.scroll-progress span', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.3 }
  });

  const meter = $('.section-meter');
  const num = $('#meterNum');
  const name = $('#meterName');
  const fill = $('#meterFill');
  const sections = $$('main section[id]');

  sections.forEach((sec, i) => {
    const spacer = sec.parentElement.classList.contains('pin-spacer') ? sec.parentElement : sec;
    ScrollTrigger.create({
      trigger: spacer,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: self => {
        if (!self.isActive) return;
        num.textContent = String(i).padStart(2, '0');
        name.textContent = sec.dataset.name;
        meter.classList.toggle('is-visible', i > 0 && i < sections.length - 1);
        $$('.nav-links a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + sec.id));
      },
      onUpdate: self => { if (self.isActive) gsap.set(fill, { scaleX: self.progress }); }
    });
  });
}

/* ------------------------------------------------------------
   Scroll-driven motion
------------------------------------------------------------ */
function initHeroScroll() {
  const tl = gsap.timeline({
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
  });
  tl.to('.hero-solid', { xPercent: -14, ease: 'none' }, 0)
    .to('.hero-outline', { xPercent: 14, ease: 'none' }, 0)
    .to('.hero-portrait', { yPercent: 12, scale: 0.94, ease: 'none' }, 0)
    .to('.hero-bg-word', { xPercent: -8, ease: 'none' }, 0)
    .to('.hero-badge', { y: 160, ease: 'none' }, 0)
    .to('.hero-foot', { opacity: 0, y: 40, ease: 'none' }, 0)
    .to('.hero-intro', { opacity: 0, y: -40, ease: 'none' }, 0);
}

function initReveals() {
  // Headings: masked lines slide up
  $$('.section-title, .contact-title').forEach(title => {
    gsap.from($$('.reveal-line > span', title), {
      yPercent: 110,
      duration: 1.2,
      stagger: 0.1,
      ease: 'expo.out',
      scrollTrigger: { trigger: title, start: 'top 88%' }
    });
  });

  $$('.eyebrow').forEach(el => {
    gsap.from(el, {
      opacity: 0,
      x: -20,
      duration: 1,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%' }
    });
  });

  // Statement: each word lights up as you scroll
  const statement = $('[data-words]');
  if (statement) {
    statement.innerHTML = statement.textContent.trim().split(/\s+/)
      .map(w => `<span class="w">${w}</span>`).join(' ');
    gsap.to($$('.w', statement), {
      opacity: 1,
      stagger: 0.1,
      ease: 'none',
      scrollTrigger: { trigger: statement, start: 'top 80%', end: 'bottom 45%', scrub: true }
    });
  }

  const batchUp = (selector, opts = {}) => {
    gsap.set(selector, { y: opts.y || 50, opacity: 0 });
    ScrollTrigger.batch(selector, {
      start: 'top 90%',
      once: true,
      onEnter: els => gsap.to(els, { y: 0, opacity: 1, duration: 1.1, stagger: 0.1, ease: 'expo.out' })
    });
  };
  batchUp('.about-grid > *');
  batchUp('.service', { y: 40 });
  batchUp('.step', { y: 60 });
  batchUp('.faq-item', { y: 30 });
  batchUp('.timeline-row', { y: 40 });
  batchUp('.contact-email, .contact-links', { y: 30 });

  gsap.to('#timelineFill', {
    scaleY: 1,
    ease: 'none',
    scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 60%', scrub: true }
  });

  // Counters
  $$('.count').forEach(el => {
    const to = +el.dataset.target;
    const obj = { v: +(el.dataset.from || 0) };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => gsap.to(obj, {
        v: to,
        duration: 2,
        ease: 'power3.out',
        onUpdate: () => { el.textContent = Math.round(obj.v); }
      })
    });
  });
}

function initWork() {
  const track = $('#workTrack');
  if (!track) return;
  const cards = $$('.work-card', track);
  const current = $('#workCurrent');
  const mm = gsap.matchMedia();

  mm.add('(min-width: 821px)', () => {
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: '#work',
        start: 'top top',
        end: () => '+=' + distance(),
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: self => {
          const i = Math.min(cards.length, Math.round(self.progress * (cards.length - 1)) + 1);
          current.textContent = String(i).padStart(2, '0');
        }
      }
    });

    cards.forEach(card => {
      gsap.fromTo($('img', card), { xPercent: -5 }, {
        xPercent: 5,
        ease: 'none',
        scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true }
      });
    });

    gsap.from(cards.slice(0, 3), {
      x: 160,
      opacity: 0,
      duration: 1.3,
      stagger: 0.1,
      ease: 'expo.out',
      scrollTrigger: { trigger: '#work', start: 'top 70%' }
    });
  });

  mm.add('(max-width: 820px)', () => {
    cards.forEach(card => {
      gsap.from(card, {
        y: 60,
        opacity: 0,
        duration: 1.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: card, start: 'top 88%' }
      });
      gsap.fromTo($('img', card), { yPercent: -5 }, {
        yPercent: 5,
        ease: 'none',
        scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  });
}

// Marquee: speed and direction follow the scroll
function initMarquee() {
  const track = $('#marqueeTrack');
  if (!track) return;
  let x = 0;
  let dir = 1;
  gsap.ticker.add(() => {
    const half = track.scrollWidth / 2;
    const v = lenis ? lenis.velocity : 0;
    if (v > 0.5) dir = 1;
    else if (v < -0.5) dir = -1;
    x -= (0.6 + Math.min(Math.abs(v) * 0.25, 12)) * dir;
    if (x <= -half) x += half;
    if (x > 0) x -= half;
    gsap.set(track, { x });
  });
}

/* ------------------------------------------------------------
   FAQ
------------------------------------------------------------ */
function initFAQ() {
  const items = $$('.faq-item');
  const set = (item, open) => {
    item.classList.toggle('active', open);
    $('.faq-trigger', item).setAttribute('aria-expanded', String(open));
    gsap.to($('.faq-answer', item), {
      height: open ? 'auto' : 0,
      duration: reduced ? 0 : 0.6,
      ease: 'expo.out',
      onComplete: () => ScrollTrigger.refresh()
    });
  };
  items.forEach(item => {
    $('.faq-trigger', item).addEventListener('click', () => {
      const open = !item.classList.contains('active');
      items.forEach(other => { if (other !== item && other.classList.contains('active')) set(other, false); });
      set(item, open);
    });
  });
}

/* ------------------------------------------------------------
   Cursor + magnetic buttons
------------------------------------------------------------ */
function initCursor() {
  if (!finePointer || reduced) return;
  const ring = $('.cursor');
  const dot = $('.cursor-dot');
  const label = $('.cursor-label');
  const rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3.out' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3.out' });
  const dx = gsap.quickTo(dot, 'x', { duration: 0.1 });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.1 });

  window.addEventListener('mousemove', e => {
    gsap.set([ring, dot], { opacity: 1 });
    rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY);
  });
  document.addEventListener('mouseleave', () => gsap.set([ring, dot], { opacity: 0 }));

  $$('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
  });

  const labelled = [
    ...$$('.work-card').map(el => [el, 'Scroll']),
    ...$$('[data-cursor]').map(el => [el, el.dataset.cursor])
  ];
  labelled.forEach(([el, text]) => {
    el.addEventListener('mouseenter', () => { label.textContent = text; ring.classList.add('is-label'); });
    el.addEventListener('mouseleave', () => ring.classList.remove('is-label'));
  });

  $$('.nav-cta, .theme-toggle, .hero-badge, .pill').forEach(el => {
    const mx = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const my = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      mx((e.clientX - r.left - r.width / 2) * 0.3);
      my((e.clientY - r.top - r.height / 2) * 0.3);
    });
    el.addEventListener('mouseleave', () => { mx(0); my(0); });
  });
}

/* ------------------------------------------------------------
   Contact
------------------------------------------------------------ */
function initCopy() {
  const btn = $('#copyEmail');
  if (!btn) return;
  const text = $('span', btn);
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('alfredwalker180@gmail.com');
      text.textContent = 'Copied';
    } catch (e) {
      text.textContent = 'Copy failed';
    }
    setTimeout(() => { text.textContent = 'Copy email'; }, 2000);
  });
}

/* ------------------------------------------------------------
   Boot
------------------------------------------------------------ */
function debounce(fn, wait) {
  let id;
  return (...args) => { clearTimeout(id); id = setTimeout(() => fn(...args), wait); };
}

function safe(fn) {
  try { fn(); } catch (e) { console.error(e); }
}

function init() {
  safe(initLenis);
  safe(initTheme);
  safe(fitHeroText);
  safe(runIntro);
  safe(initLinks);
  safe(initNav);
  safe(initFAQ);
  safe(initCopy);
  safe(initCursor);
  if (!reduced) {
    safe(initHeroScroll);
    safe(initReveals);
    safe(initWork);
    safe(initMarquee);
  }
  safe(initScrollMap);
  ScrollTrigger.refresh();
}

let lastWidth = window.innerWidth;
window.addEventListener('resize', debounce(() => {
  // Ignore mobile address-bar height changes
  if (window.innerWidth === lastWidth && finePointer === false) return;
  lastWidth = window.innerWidth;
  fitHeroText();
  ScrollTrigger.refresh();
}, 200));

const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
Promise.race([fontsReady, new Promise(r => setTimeout(r, 1500))]).then(init);
