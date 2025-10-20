// Smooth scrolling and active link highlighting
const header = document.getElementById('header');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.getElementById('navMenu');
const links = document.querySelectorAll('.nav-link');

navToggle?.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  navMenu.classList.toggle('show');
});

links.forEach(link => {
  link.addEventListener('click', e => {
    // Close mobile menu
    navMenu.classList.remove('show');
    navToggle?.setAttribute('aria-expanded', 'false');
  });
});

// Active section observer
const sectionIds = ['hero','work','about','services','testimonials','contact'];
const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
const linkById = Object.fromEntries(Array.from(links).map(a => [a.getAttribute('href')?.replace('#',''), a]));

const activeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const id = entry.target.id;
    const link = linkById[id];
    if (!link) return;
    if (entry.isIntersecting) {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 });

sections.forEach(sec => activeObserver.observe(sec));

// Header background on scroll + back to top
const toTop = document.getElementById('toTop');
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > 10;
  header.style.background = scrolled
    ? 'rgba(11,11,11,0.9)'
    : 'linear-gradient(180deg, rgba(11,11,11,0.85), rgba(11,11,11,0.35) 60%, rgba(11,11,11,0))';

  if (window.scrollY > 400) toTop.classList.add('show'); else toTop.classList.remove('show');
});

toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal-up');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
revealEls.forEach(el => revealObserver.observe(el));

// About skill bars animate when visible
const skillBars = document.querySelectorAll('.bar span');
const skillsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const bar = entry.target;
      const val = bar.getAttribute('data-progress');
      if (val) bar.style.width = val + '%';
      skillsObserver.unobserve(bar);
    }
  });
}, { threshold: 0.2 });
skillBars.forEach(b => skillsObserver.observe(b));

// Portfolio modal + hover preview
const modal = document.getElementById('videoModal');
const modalBody = document.getElementById('modalBody');

function openVideoModal(videoId) {
  if (!modal || !modalBody) return;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0&controls=1&modestbranding=1`;
  modalBody.innerHTML = `<iframe src="${src}" title="YouTube video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
}

function closeVideoModal() {
  if (!modal || !modalBody) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  modalBody.innerHTML = '';
}

modal?.addEventListener('click', (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.hasAttribute('data-close')) closeVideoModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeVideoModal();
});

// Work grid interactions
const workItems = document.querySelectorAll('.work-item');
workItems.forEach(item => {
  const videoId = item.getAttribute('data-video');
  const thumb = item.querySelector('.thumb');
  const button = item.querySelector('.play-btn');

  const enter = () => {
    if (!thumb || !videoId) return;
    if (thumb.querySelector('iframe')) return;
    const preview = document.createElement('iframe');
    preview.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&rel=0&loop=1&playlist=${videoId}`);
    preview.setAttribute('title', 'Preview');
    preview.setAttribute('frameborder', '0');
    preview.setAttribute('allow', 'autoplay; encrypted-media');
    preview.style.position = 'absolute';
    preview.style.inset = '0';
    preview.style.width = '100%';
    preview.style.height = '100%';
    thumb.appendChild(preview);
  };

  const leave = () => {
    if (!thumb) return;
    const iframe = thumb.querySelector('iframe');
    if (iframe) iframe.remove();
  };

  thumb?.addEventListener('mouseenter', enter);
  thumb?.addEventListener('mouseleave', leave);
  button?.addEventListener('click', () => videoId && openVideoModal(videoId));
});

// Services tilt
const tiltCards = document.querySelectorAll('.tilt');
tiltCards.forEach(card => {
  const damp = 20; // lower = stronger tilt
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const rx = (dy / damp) * -1;
    const ry = (dx / damp);
    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    card.style.boxShadow = '0 20px 50px rgba(139,92,246,0.18)';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.boxShadow = '';
  });
});

// Testimonials carousel
const carousels = document.querySelectorAll('[data-carousel]');
carousels.forEach(carousel => {
  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(carousel.querySelectorAll('.testimonial'));
  const dotsWrap = carousel.querySelector('.carousel-dots');
  if (!track || slides.length === 0 || !dotsWrap) return;

  let index = 0;
  const update = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
    dotsWrap.querySelectorAll('button').forEach((b, i) => b.classList.toggle('active', i === index));
  };

  slides.forEach((_, i) => {
    const b = document.createElement('button');
    if (i === 0) b.classList.add('active');
    b.addEventListener('click', () => { index = i; update(); });
    dotsWrap.appendChild(b);
  });

  let timer = setInterval(() => { index = (index + 1) % slides.length; update(); }, 4500);
  carousel.addEventListener('mouseenter', () => clearInterval(timer));
  carousel.addEventListener('mouseleave', () => { timer = setInterval(() => { index = (index + 1) % slides.length; update(); }, 4500); });
});

// Contact form basic validation (no backend)
const contactForm = document.getElementById('contactForm');
contactForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = /** @type {HTMLInputElement} */(document.getElementById('name'))?.value.trim();
  const email = /** @type {HTMLInputElement} */(document.getElementById('email'))?.value.trim();
  const message = /** @type {HTMLTextAreaElement} */(document.getElementById('message'))?.value.trim();
  if (!name || !email || !message) {
    alert('Please fill out all fields.');
    return;
  }
  const emailOk = /.+@.+\..+/.test(email);
  if (!emailOk) { alert('Please enter a valid email.'); return; }
  alert('Thanks! Your message has been noted.');
  contactForm.reset();
});

// Cursor-follow glow
const glow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', (e) => {
  glow?.style.setProperty('--mx', e.clientX + 'px');
  glow?.style.setProperty('--my', e.clientY + 'px');
});


