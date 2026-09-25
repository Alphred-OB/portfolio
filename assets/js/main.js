gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const root = document.documentElement;
// Motion is the core of this site, so it plays even when the OS asks for reduced motion
// (Windows turns that on whenever "Animation effects" is off).
const reduced = false;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

let lenis = null;
// True when we arrived from another page of the site (curtain is covering the page)
const entering = root.classList.contains('is-entering');
// Headings already on screen at load wait for the curtain to lift
const introDelay = el => (entering && el.getBoundingClientRect().top < window.innerHeight ? 0.55 : 0);

/* ------------------------------------------------------------
   Smooth scroll
------------------------------------------------------------ */
function initLenis() {
  if (reduced || typeof Lenis === 'undefined') return;
  // A higher lerp keeps smooth scrolling close to the wheel so it never feels floaty
  lenis = new Lenis({
    lerp: 0.14,
    smoothWheel: true,
    wheelMultiplier: 1
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
    try { sessionStorage.setItem('ab-theme', root.dataset.theme); } catch (e) {}
  });
}

/* ------------------------------------------------------------
   Intro: counter loader, then hero entrance
------------------------------------------------------------ */
function heroIntro(tl, at) {
  tl.to('.nav', { yPercent: 0, opacity: 1, duration: 1, ease: 'expo.out' }, at + 0.5)
    .to('.hero-bg-word', { opacity: 0.025, scale: 1, duration: 2, ease: 'expo.out' }, at)
    .to('.status-pill', { y: 0, opacity: 1, duration: 1, ease: 'expo.out' }, at + 0.1)
    .to('.hero-intro .reveal-line > span', { yPercent: 0, duration: 1.1, ease: 'expo.out' }, at + 0.2)
    .to('.hero-line .fit', { yPercent: 0, duration: 1.4, stagger: 0.12, ease: 'expo.out' }, at + 0.25)
    .to('.hero-portrait', { clipPath: 'inset(0% 0 0 0)', y: 0, duration: 1.6, ease: 'expo.out' }, at + 0.4)
    .to('.hero-badge', { scale: 1, rotate: 0, duration: 1.2, ease: 'expo.out' }, at + 0.9)
    .to('.hero-foot > *', { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'expo.out' }, at + 1);
}

function runIntro() {
  const loader = $('.loader');
  const hasHero = !!$('.hero');
  const showLoader = loader && !root.classList.contains('no-loader') && !entering;

  if (reduced || !hasHero) {
    if (loader) loader.remove();
    return;
  }

  gsap.set('.nav', { yPercent: -100, opacity: 0 });
  gsap.set('.hero-bg-word', { opacity: 0, scale: 1.15 });
  gsap.set('.hero-intro .reveal-line > span, .hero-line .fit', { yPercent: 110 });
  gsap.set('.status-pill', { y: 20, opacity: 0 });
  gsap.set('.hero-portrait', { clipPath: 'inset(100% 0 0 0)', y: 80 });
  gsap.set('.hero-badge', { scale: 0, rotate: -120 });
  gsap.set('.hero-foot > *', { y: 24, opacity: 0 });

  if (!showLoader) {
    if (loader) loader.remove();
    const tl = gsap.timeline();
    heroIntro(tl, entering ? 0.35 : 0.1);
    return;
  }

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

// Leaving for another page: cover the screen, then navigate
function leaveTo(url, label) {
  closeMenu();
  if (transitioning) return;
  if (reduced) { window.location.href = url; return; }
  transitioning = true;
  try { sessionStorage.setItem('ab-enter', label || ''); } catch (e) {}
  $('#curtainLabel').textContent = label || '';
  gsap.timeline({ onComplete: () => { window.location.href = url; } })
    .set('.curtain', { visibility: 'visible' })
    .set('.curtain-panel', { transformOrigin: 'bottom' })
    .to('.curtain-panel', { scaleY: 1, duration: 0.75, ease: 'expo.inOut' })
    .fromTo('#curtainLabel', { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }, '-=0.3');
}

// Arriving from another page: lift the curtain
function enterPage() {
  try { sessionStorage.removeItem('ab-enter'); } catch (e) {}
  if (!entering) return;
  root.classList.remove('is-entering');
  gsap.timeline()
    .set('.curtain', { visibility: 'visible' })
    .set('.curtain-panel', { scaleY: 1, transformOrigin: 'top' })
    .set('#curtainLabel', { opacity: 1 })
    .to('#curtainLabel', { yPercent: -70, opacity: 0, duration: 0.45, ease: 'power3.in' }, 0.15)
    .to('.curtain-panel', { scaleY: 0, duration: 0.85, ease: 'expo.inOut' }, 0.3)
    .set('.curtain', { visibility: 'hidden' });
}

// Coming back through the browser history can restore a covered page
window.addEventListener('pageshow', e => {
  if (!e.persisted) return;
  transitioning = false;
  gsap.set('.curtain', { visibility: 'hidden' });
  gsap.set('.curtain-panel', { scaleY: 0 });
  gsap.set('#curtainLabel', { opacity: 0 });
});

function initPageLinks() {
  $$('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || link.target === '_blank' || /^[a-z]+:/i.test(href)) return;
    link.addEventListener('click', e => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const url = new URL(href, window.location.href);
      e.preventDefault();
      if (url.pathname === window.location.pathname) {
        closeMenu();
        if (lenis) lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      leaveTo(url.href, link.dataset.label);
    });
  });
}

function initLinks() {
  $$('a[href^="#"]').forEach(link => {
    const hash = link.getAttribute('href');
    if (hash.length < 2) return;
    const target = $(hash);
    if (!target) return;
    link.addEventListener('click', e => {
      e.preventDefault();
      if (hash === '#top') {
        if (lenis) lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
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

}

// Flip nav colours while it sits over a dark section (runs after pinning so spacers exist)
function initNavTheme() {
  const nav = $('.nav');
  $$('.work, .contact, .security').forEach(sec => {
    ScrollTrigger.create({
      trigger: sec.parentElement.classList.contains('pin-spacer') ? sec.parentElement : sec,
      start: 'top 40px',
      end: 'bottom 40px',
      onToggle: self => nav.classList.toggle('on-dark', self.isActive)
    });
  });
}

function openMenu() {
  const btn = $('#menuToggle');
  btn.setAttribute('aria-expanded', 'true');
  $('.nav').classList.add('menu-open');
  btn.setAttribute('aria-label', 'Close menu');
  $('#mobileMenu').setAttribute('aria-hidden', 'false');
  $('#mobileMenu').classList.add('is-open');
  if (lenis) lenis.stop();
}

function closeMenu() {
  const btn = $('#menuToggle');
  if (!btn || btn.getAttribute('aria-expanded') !== 'true') return;
  btn.setAttribute('aria-expanded', 'false');
  $('.nav').classList.remove('menu-open');
  btn.setAttribute('aria-label', 'Open menu');
  $('#mobileMenu').setAttribute('aria-hidden', 'true');
  $('#mobileMenu').classList.remove('is-open');
  if (lenis) lenis.start();
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
        meter.classList.toggle('is-visible', i > 0 && i < sections.length - 1 && sec.id !== 'work');
      },
      onUpdate: self => { if (self.isActive) gsap.set(fill, { scaleY: self.progress }); }
    });
  });
}

/* ------------------------------------------------------------
   Scroll-driven motion
------------------------------------------------------------ */
function initHeroScroll() {
  if (!$('.hero')) return;
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
  $$('.section-title, .contact-title, .page-title').forEach(title => {
    gsap.from($$('.reveal-line > span', title), {
      yPercent: 110,
      duration: 1.2,
      stagger: 0.1,
      delay: introDelay(title),
      ease: 'expo.out',
      scrollTrigger: { trigger: title, start: 'top 88%' }
    });
  });

  $$('.eyebrow, .page-intro').forEach(el => {
    gsap.from(el, {
      opacity: 0,
      y: 20,
      duration: 1,
      delay: introDelay(el),
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 92%' }
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
    if (!$$(selector).length) return;
    gsap.set(selector, { y: opts.y || 50, opacity: 0 });
    ScrollTrigger.batch(selector, {
      start: 'top 90%',
      once: true,
      onEnter: els => gsap.to(els, { y: 0, opacity: 1, duration: 1.1, stagger: 0.1, ease: 'expo.out' })
    });
  };
  batchUp('.about-grid > *');
  batchUp('.service', { y: 40 });
  batchUp('.process-body', { y: 40 });
  batchUp('.sec-card', { y: 40 });
  batchUp('.review-card', { y: 50 });
  batchUp('.pr-card', { y: 50 });
  batchUp('.case-row', { y: 40 });
  batchUp('.case-shot img', { y: 60 });
  // Stars pop in one by one when the rating comes into view
  $$('.rating-panel .stars, .review-card .stars').forEach(group => {
    gsap.from($$('svg', group), {
      scale: 0,
      rotate: -90,
      duration: 0.6,
      stagger: 0.08,
      ease: 'back.out(2)',
      scrollTrigger: { trigger: group, start: 'top 90%' }
    });
  });
  batchUp('.tool-tab', { y: 16 });
  batchUp('.tool-card', { y: 30 });
  batchUp('.faq-item', { y: 30 });
  batchUp('.contact-email, .contact-links', { y: 30 });


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

// Process: each big numeral rises in and its image drifts as you scroll
function initProcess() {
  $$('.process-row').forEach(row => {
    const num = $('.process-num', row);
    const rule = $('.process-rule', row);
    gsap.from(num, {
      yPercent: 30,
      opacity: 0,
      duration: 1.3,
      ease: 'expo.out',
      scrollTrigger: { trigger: row, start: 'top 85%' }
    });
    if (rule) {
      gsap.from(rule, {
        scaleX: 0,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: { trigger: row, start: 'top 75%' }
      });
    }
  });
}

// Pause the looping logo rows while they are off screen
// Security: a scan line sweeps across the cards once they are on screen
// How I build: device frames rise in, bad design habits get struck out, the AI answers
function initPractices() {
  const devices = $('.devices');
  if (devices) {
    gsap.from($$('.device', devices), {
      y: 80,
      opacity: 0,
      duration: 1.3,
      stagger: 0.15,
      ease: 'expo.out',
      scrollTrigger: { trigger: devices, start: 'top 80%' }
    });
  }
  $$('.pr-strike').forEach(list => {
    ScrollTrigger.create({ trigger: list, start: 'top 80%', once: true, onEnter: () => list.classList.add('is-in') });
  });
  $$('.ai-chat').forEach(chat => {
    ScrollTrigger.create({ trigger: chat, start: 'top 80%', once: true, onEnter: () => setTimeout(() => chat.classList.add('is-answered'), 1400) });
  });
  // Ratings count up from zero
  $$('[data-rating]').forEach(el => {
    const to = parseFloat(el.dataset.rating);
    const obj = { v: 0 };
    el.textContent = '0.0';
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => gsap.to(obj, { v: to, duration: 1.6, ease: 'power3.out', onUpdate: () => { el.textContent = obj.v.toFixed(1); } })
    });
  });
}

function initSecurity() {
  $$('.sec-grid').forEach(grid => {
    ScrollTrigger.create({
      trigger: grid,
      start: 'top 70%',
      once: true,
      onEnter: () => {
        grid.style.setProperty('--scan-h', grid.offsetHeight + 'px');
        grid.classList.add('is-scanned');
      }
    });
  });
}

function initRails() {
  const rails = $('.logo-rails');
  if (!rails) return;
  new IntersectionObserver(([entry]) => rails.classList.toggle('is-paused', !entry.isIntersecting)).observe(rails);
}

// Toolbox: category filter and cards that tilt and glow toward the mouse
function initToolbox() {
  const grid = $('#toolGrid');
  if (!grid) return;
  const cards = $$('.tool-card', grid);
  const tabs = $$('.tool-tab');

  tabs.forEach(tab => tab.addEventListener('click', () => {
    const filter = tab.dataset.filter;
    tabs.forEach(t => {
      const on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-pressed', String(on));
    });
    const shown = [];
    cards.forEach(card => {
      const match = filter === 'all' || card.dataset.cat === filter || card.classList.contains('tool-card-more');
      card.classList.toggle('is-hidden', !match);
      if (match) shown.push(card);
    });
    gsap.fromTo(shown, { opacity: 0, y: 18, scale: 0.96 }, {
      opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.025, ease: 'expo.out', overwrite: true
    });
    ScrollTrigger.refresh();
  }));

  if (!finePointer) return;
  cards.forEach(card => {
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });
    gsap.set(card, { transformPerspective: 700 });
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      ry((x - 0.5) * 12);
      rx((0.5 - y) * 12);
    });
    card.addEventListener('mouseleave', () => { rx(0); ry(0); });
  });
}

// Connect panels: the brand colour spreads from where the mouse enters, and the card leans toward it
function initSocial() {
  const panels = $$('.social-panel');
  if (!panels.length) return;
  panels.forEach(panel => {
    const place = e => {
      const r = panel.getBoundingClientRect();
      panel.style.setProperty('--x', `${((e.clientX - r.left) / r.width) * 100}%`);
      panel.style.setProperty('--y', `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    panel.addEventListener('mouseenter', place);
    panel.addEventListener('mouseleave', place);
    if (!finePointer) return;
    const icon = $('.social-icon', panel);
    const ix = gsap.quickTo(icon, 'x', { duration: 0.6, ease: 'power3.out' });
    const iy = gsap.quickTo(icon, 'y', { duration: 0.6, ease: 'power3.out' });
    panel.addEventListener('mousemove', e => {
      const r = panel.getBoundingClientRect();
      ix(((e.clientX - r.left) / r.width - 0.5) * 24);
      iy(((e.clientY - r.top) / r.height - 0.5) * 24);
    });
    panel.addEventListener('mouseleave', () => { ix(0); iy(0); });
  });
  $$('.social-panels').forEach(group => {
    gsap.from($$('.social-panel', group), {
      y: 60,
      opacity: 0,
      duration: 1.2,
      stagger: 0.12,
      ease: 'expo.out',
      scrollTrigger: { trigger: group, start: 'top 85%' }
    });
  });
}

// Journey: line fills and a dot travels down it with the scroll; milestones light up as it passes
function initJourney() {
  const timeline = $('#timeline');
  if (!timeline) return;
  const range = { trigger: timeline, start: 'top 55%', end: 'bottom 55%', scrub: 0.6 };
  gsap.to('#timelineFill', { scaleY: 1, ease: 'none', scrollTrigger: range });
  // Move the dot with a transform (not "top") so it never triggers layout while scrolling
  const axis = $('.timeline-axis', timeline);
  gsap.fromTo('#timelineDot', { y: 0 }, { y: () => axis.offsetHeight, ease: 'none', scrollTrigger: { ...range, invalidateOnRefresh: true } });

  $$('.timeline-item', timeline).forEach(item => {
    ScrollTrigger.create({
      trigger: item,
      start: 'top 58%',
      onEnter: () => item.classList.add('is-active'),
      onLeaveBack: () => item.classList.remove('is-active')
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
      if (card.getBoundingClientRect().left < window.innerWidth) return;
      gsap.from(card, {
        opacity: 0.35,
        scale: 0.94,
        ease: 'none',
        scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'left 60%', scrub: true }
      });
    });

    gsap.from(cards.slice(0, 2), {
      x: 160,
      opacity: 0,
      duration: 1.3,
      stagger: 0.1,
      ease: 'expo.out',
      delay: introDelay(track),
      scrollTrigger: { trigger: '#work', start: 'top 70%' }
    });
  });

  mm.add('(max-width: 820px)', () => {
    cards.forEach(card => {
      if (card.getBoundingClientRect().left < window.innerWidth) return;
      gsap.from(card, {
        y: 60,
        opacity: 0,
        duration: 1.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: card, start: 'top 88%' }
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
  let half = track.scrollWidth / 2;
  let visible = false;
  // Measure once (and on resize) instead of every frame, and only run while on screen
  window.addEventListener('resize', debounce(() => { half = track.scrollWidth / 2; }, 200));
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(track);
  const setX = gsap.quickSetter(track, 'x', 'px');
  gsap.ticker.add(() => {
    if (!visible) return;
    const v = lenis ? lenis.velocity : 0;
    if (v > 0.5) dir = 1;
    else if (v < -0.5) dir = -1;
    x -= (0.6 + Math.min(Math.abs(v) * 0.25, 12)) * dir;
    if (x <= -half) x += half;
    if (x > 0) x -= half;
    setX(x);
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
  const tag = $('.cursor');
  const label = $('.cursor-label');

  // Follow the mouse directly (no easing) so the tag never lags behind the pointer
  window.addEventListener('mousemove', e => {
    tag.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
  }, { passive: true });

  const labelled = [
    ...$$('.work-card').map(el => [el, 'Scroll']),
    ...$$('[data-cursor]').map(el => [el, el.dataset.cursor])
  ];
  labelled.forEach(([el, text]) => {
    el.addEventListener('mouseenter', () => { label.textContent = text; tag.classList.add('is-label'); });
    el.addEventListener('mouseleave', () => tag.classList.remove('is-label'));
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
  safe(enterPage);
  safe(runIntro);
  safe(initPageLinks);
  safe(initLinks);
  safe(initNav);
  safe(initFAQ);
  safe(initCopy);
  safe(initCursor);
  if (!reduced) {
    safe(initHeroScroll);
    safe(initReveals);
    safe(initWork);
    safe(initJourney);
    safe(initProcess);
    safe(initMarquee);
  }
  safe(initPractices);
  safe(initSecurity);
  safe(initRails);
  safe(initToolbox);
  safe(initSocial);
  safe(initNavTheme);
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

// The menu button works straight away, before fonts and animations are ready
(function initMenuToggle() {
  const btn = $('#menuToggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    btn.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
})();

const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
// Start even if font loading fails
Promise.race([fontsReady, new Promise(r => setTimeout(r, 1500))]).then(init, init);
