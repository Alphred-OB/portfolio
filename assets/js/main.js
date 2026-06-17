gsap.registerPlugin(ScrollTrigger);

const root = document.documentElement;
const toggle = document.getElementById('themeToggle');
const canvas = document.getElementById('noise');
const ctx = canvas.getContext('2d');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Navigation highlighting active section on scroll
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = "";
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= (sectionTop - 200)) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href').slice(1) === current) {
      link.classList.add('active');
    }
  });
});

function drawNoise() {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const w = Math.floor(window.innerWidth * dpr);
  const h = Math.floor(window.innerHeight * dpr);
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  const image = ctx.createImageData(w, h);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.random() * 255;
    data[i] = v;
    data[i+1] = v;
    data[i+2] = v;
    data[i+3] = Math.random() * 30; // Slightly lower noise intensity for clean aesthetics
  }
  ctx.putImageData(image, 0, 0);
}

toggle.addEventListener('click', () => {
  const dark = root.dataset.theme === 'dark';
  root.dataset.theme = dark ? 'light' : 'dark';
  toggle.setAttribute('aria-pressed', String(dark));
  toggle.querySelector('i').className = dark ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  gsap.fromTo(toggle, {scale: 0.95}, {scale: 1, duration: 0.2, ease: 'power2.out'});
});

// Helper to split text into characters dynamically for character slide-up reveal
function splitTextIntoSpans(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach(el => {
    const text = el.textContent.trim();
    el.innerHTML = '';
    el.style.display = 'block';
    el.style.overflow = 'hidden';
    [...text].forEach(char => {
      const span = document.createElement('span');
      span.style.display = 'inline-block';
      span.style.transform = 'translateY(105%)';
      span.className = 'char-span';
      span.textContent = char === ' ' ? '\u00A0' : char;
      el.appendChild(span);
    });
  });
}

// Custom perspective tilt hover effect for grid cells and project items
function initTilt() {
  if (reduced) return;
  const items = document.querySelectorAll('.bento-cell, .timeline-card');
  items.forEach(item => {
    item.addEventListener('mousemove', e => {
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      // Calculate angles based on mouse position relative to card center
      const angleX = (yc - y) / 14;
      const angleY = (x - xc) / 14;
      gsap.to(item, {
        rotateX: angleX,
        rotateY: angleY,
        scale: 1.015,
        transformPerspective: 800,
        boxShadow: '0 20px 45px rgba(0, 0, 0, 0.18), 0 0 25px var(--glow)',
        ease: 'power2.out',
        duration: 0.45,
        overwrite: 'auto'
      });
    });
    item.addEventListener('mouseleave', () => {
      gsap.to(item, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        boxShadow: 'none',
        ease: 'power3.out',
        duration: 0.8,
        overwrite: 'auto'
      });
    });
  });
}

// Interactive FAQ Accordion Functionality
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const answer = item.querySelector('.faq-answer');
    
    trigger.addEventListener('click', () => {
      const active = item.classList.contains('active');
      
      // Close other items
      items.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
          otherItem.querySelector('.faq-answer').style.maxHeight = null;
        }
      });
      
      // Toggle current item
      if (active) {
        item.classList.remove('active');
        trigger.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
      
      // Refresh ScrollTrigger to recalculate layout shifts
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 360);
    });
  });
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `flex items-center gap-3 px-6 py-4 rounded-xl text-white text-sm font-semibold shadow-2xl transition-all duration-300 transform translate-y-8 opacity-0`;
  toast.style.background = 'var(--bg-2)';
  toast.style.border = '1px solid var(--border)';
  toast.innerHTML = `<span><i class="fa-solid fa-circle-check text-emerald-500 mr-2"></i>${message}</span>`;
  document.getElementById('toast-container').appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  }, 10);
  
  // Auto remove
  setTimeout(() => {
    toast.style.transform = 'translateY(8px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function intro() {
  splitTextIntoSpans('.left-name');
  splitTextIntoSpans('.right-name');

  if (reduced) {
    gsap.set('.portrait-mask', {opacity: 1});
    gsap.set('.hero-ring circle', {strokeDashoffset: 0});
    gsap.set('.char-span', {y: '0%'});
    return;
  }
  
  gsap.set('.hero', {opacity: 0});
  gsap.set('.top-nav', {y: -70, opacity: 0});
  gsap.set('.socials, .side-scroll', {x: -28, opacity: 0});
  gsap.set('.hero-ring', {opacity: 0});
  gsap.set('.hero-ring circle', {strokeDashoffset: 879.65});
  gsap.set('.portrait-mask', {y: 40, opacity: 0});
  gsap.set('.content-panel', {y: 20, opacity: 0});
  gsap.set('.center-scroll', {y: 15, opacity: 0});

  gsap.timeline({defaults: {ease: 'power3.out'}})
    .to('.hero', {opacity: 1, duration: 0.95})
    .to('.top-nav', {y: 0, opacity: 1, duration: 0.85}, '-=0.45')
    .to('.socials, .side-scroll', {x: 0, opacity: 1, duration: 0.75, stagger: 0.08}, '-=0.45')
    .to('.left-name .char-span', {y: '0%', duration: 1.1, stagger: 0.05, ease: 'power4.out'}, '-=0.35')
    .to('.right-name .char-span', {y: '0%', duration: 1.1, stagger: 0.05, ease: 'power4.out'}, '-=1.0')
    .to('.hero-ring', {opacity: 1, duration: 0.5, ease: 'power2.out'}, '-=0.7')
    .to('.hero-ring circle', {strokeDashoffset: 0, duration: 1.4, ease: 'power3.inOut'}, '<')
    .to('.portrait-mask', {y: 0, opacity: 1, duration: 1.1, ease: 'power4.out'}, '-=0.85')
    .to('.content-panel', {y: 0, opacity: 1, duration: 0.75, stagger: 0.12}, '-=0.3')
    .to('.center-scroll', {y: 0, opacity: 1, duration: 0.65}, '-=0.35')
    .add(idle);
}

function idle() {
  gsap.to('.hero-ring', {scale: 1.015, duration: 4.5, ease: 'sine.inOut', yoyo: true, repeat: -1});
}

function scrollMotion() {
  if (reduced) return;
  
  const heroOpts = {
    trigger: '.hero',
    start: 'top top',
    end: '+=500',
    scrub: 1.2
  };
  
  ScrollTrigger.create({
    trigger: '.hero',
    start: 'top top',
    end: '+=320',
    pin: true,
    pinSpacing: true
  });

  gsap.to('.left-name', {xPercent: -15, ease: 'none', scrollTrigger: heroOpts});
  gsap.to('.right-name', {xPercent: 15, ease: 'none', scrollTrigger: heroOpts});
  gsap.to('.left-panel', {x: -30, opacity: 0, ease: 'none', scrollTrigger: heroOpts});
  gsap.to('.stats', {x: 30, opacity: 0, ease: 'none', scrollTrigger: heroOpts});
  gsap.to('.portrait', {y: -40, scale: 1.04, ease: 'none', scrollTrigger: heroOpts});
  gsap.to('.hero-ring', {scale: 0.9, opacity: 0.4, ease: 'none', scrollTrigger: heroOpts});
  gsap.to('.socials, .side-scroll', {opacity: 0, ease: 'none', scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: '+=150',
    scrub: 1
  }});

  // Advanced Entry and Exit Scroll Reveals for sections
  gsap.utils.toArray('.reveal-section').forEach(section => {
    gsap.fromTo(section, 
      { opacity: 0, y: 60, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.95,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          end: 'bottom 15%',
          toggleActions: 'play reverse play reverse'
        }
      }
    );
  });

  // Staggered reveal for grid elements (excluding approach-step for customized timeline below)
  gsap.utils.toArray('.bento-cell, .timeline-card, .contact-links a').forEach((el, i) => {
    gsap.fromTo(el,
      { y: 35, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: (i % 3) * 0.05,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          end: 'bottom 10%',
          toggleActions: 'play reverse play reverse'
        }
      }
    );
  });

  // Staggered Reveal and sequential line draw for Core Competence Steps
  const stepsTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: '.approach-grid',
      start: 'top 82%',
      end: 'bottom 20%',
      toggleActions: 'play reverse play reverse'
    }
  });

  stepsTimeline.fromTo('.approach-step', 
    { y: 40, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.75, stagger: 0.15, ease: 'power3.out' }
  );

  // Cool alternating slide-in scroll reveal for editorial projects
  gsap.utils.toArray('.project-item').forEach((item, i) => {
    const isEven = i % 2 === 1;
    const imgWrapper = item.querySelector('.project-image-wrapper');
    const content = item.querySelector('.project-card-content');
    
    gsap.fromTo(imgWrapper, 
      { opacity: 0, x: isEven ? 60 : -60, scale: 0.96 },
      {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 1.0,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          end: 'bottom 20%',
          toggleActions: 'play reverse play reverse'
        }
      }
    );

    gsap.fromTo(content, 
      { opacity: 0, x: isEven ? -40 : 40 },
      {
        opacity: 1,
        x: 0,
        duration: 0.9,
        delay: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          end: 'bottom 20%',
          toggleActions: 'play reverse play reverse'
        }
      }
    );
  });

  // Timeline path drawing reveal animation
  gsap.fromTo('#timelineProgress',
    { height: '0%' },
    {
      height: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.timeline-container',
        start: 'top 30%',
        end: 'bottom 70%',
        scrub: true
      }
    }
  );

  // Staggered reveal for timeline cards sliding from left/right
  gsap.utils.toArray('.timeline-item').forEach((item) => {
    const card = item.querySelector('.timeline-card');
    const dot = item.querySelector('.timeline-dot');
    const isEven = item.classList.contains('timeline-item') && window.getComputedStyle(item).left !== '0px'; 
    // Alternate sides: on desktop: even items have left: 50% / padding-left: 48px
    // To be safe and check if it's even, we can query nth-child or simply inspect layout
    
    // We can check if it's the 2nd child, etc. among timeline items specifically
    const siblingItems = Array.from(item.parentNode.querySelectorAll('.timeline-item'));
    const index = siblingItems.indexOf(item);
    const isRightSide = index % 2 === 1;

    gsap.fromTo(card,
      { 
        opacity: 0, 
        x: isRightSide ? 50 : -50,
        scale: 0.95 
      },
      {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.95,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          end: 'bottom 20%',
          toggleActions: 'play reverse play reverse'
        }
      }
    );

    gsap.fromTo(dot,
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          end: 'bottom 20%',
          toggleActions: 'play reverse play reverse'
        }
      }
    );
  });

  // About section columns slide-up stagger animation
  gsap.fromTo('#about .num, #about > div, #about > p', 
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration: 1.0,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#about',
        start: 'top 85%',
        end: 'bottom 20%',
        toggleActions: 'play reverse play reverse'
      }
    }
  );
}

function pointerDepth() {
  if (reduced) return;
  let raf = false;
  let mx = 0, my = 0;
  const hero = document.querySelector('.hero');
  
  hero.addEventListener('mousemove', event => {
    mx = (event.clientX / window.innerWidth) * 2 - 1;
    my = (event.clientY / window.innerHeight) * 2 - 1;
    if (raf) return;
    raf = true;
    requestAnimationFrame(() => {
      raf = false;
      gsap.to('.portrait', {x: mx * 6, y: my * 4, duration: 0.8, ease: 'power2.out', overwrite: 'auto'});
      gsap.to('.hero-ring', {x: -mx * 4, y: -my * 4, duration: 1.0, ease: 'power2.out', overwrite: 'auto'});
      gsap.to('.left-name, .right-name', {x: mx * 2, y: my * 1.5, duration: 1.0, ease: 'power2.out', overwrite: 'auto'});
    });
  });

  hero.addEventListener('mouseleave', () => {
    gsap.to('.portrait, .hero-ring, .left-name, .right-name', {x: 0, y: 0, duration: 1.0, ease: 'power3.out', overwrite: 'auto'});
  });
}

function debounce(fn, wait) {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), wait);
  };
}

window.addEventListener('resize', debounce(() => {
  drawNoise();
  ScrollTrigger.refresh();
}, 150));

window.addEventListener('load', () => {
  try {
    gsap.registerPlugin(ScrollTrigger);
  } catch (e) {
    console.error("Failed to register ScrollTrigger:", e);
  }

  // Initialize Lenis smooth scroll safely
  let lenis;
  try {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      gestureOrientation: 'vertical',
      smoothWheel: true
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  } catch (e) {
    console.error("Lenis initialization failed:", e);
  }

  try {
    drawNoise();
  } catch (e) { console.error(e); }

  try {
    intro();
  } catch (e) { console.error(e); }

  try {
    scrollMotion();
  } catch (e) { console.error(e); }

  try {
    pointerDepth();
  } catch (e) { console.error(e); }

  try {
    initTilt();
  } catch (e) { console.error(e); }

  try {
    initFAQ();
  } catch (e) { console.error(e); }
});