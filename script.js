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

// Ensure about section content is visible when navigated to
function ensureAboutContentVisible() {
  const aboutSection = document.getElementById('about');
  if (aboutSection) {
    const aboutRevealElements = aboutSection.querySelectorAll('.reveal-up');
    aboutRevealElements.forEach(el => {
      el.classList.add('in-view');
    });
  }
}

// Listen for navigation clicks to about section
document.addEventListener('click', (e) => {
  if (e.target.matches('a[href="#about"]') || e.target.closest('a[href="#about"]')) {
    // Small delay to ensure smooth scroll completes
    setTimeout(ensureAboutContentVisible, 100);
  }
});

// About skill bars animate when visible
let skillBarsAnimated = false;
let scrollTimeout = null;

function animateSkillBars() {
  const skillBars = document.querySelectorAll('.bar span');
  skillBars.forEach((bar, index) => {
    const val = bar.getAttribute('data-progress');
    if (val) {
      bar.style.width = '0%';
      setTimeout(() => {
        bar.style.width = val + '%';
      }, index * 200); // Stagger animation for each bar
    }
  });
  skillBarsAnimated = true;
}

function resetSkillBars() {
  const skillBars = document.querySelectorAll('.bar span');
  skillBars.forEach(bar => {
    bar.style.width = '0%';
  });
  skillBarsAnimated = false;
}

// Debounced scroll listener for skills animation
function handleSkillsScroll() {
  const aboutSection = document.getElementById('about');
  if (!aboutSection) return;
  
  const rect = aboutSection.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  
  // More mobile-friendly viewport detection
  const isInView = rect.top < viewportHeight * 0.7 && rect.bottom > viewportHeight * 0.3;
  
  if (isInView && !skillBarsAnimated) {
    animateSkillBars();
  } else if (!isInView && skillBarsAnimated) {
    resetSkillBars();
  }
}

// Debounced scroll handler
window.addEventListener('scroll', () => {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  scrollTimeout = setTimeout(handleSkillsScroll, 16); // ~60fps
});

// Portfolio modal + hover preview
const modal = document.getElementById('videoModal');
const modalBody = document.getElementById('modalBody');

function openVideoModal(videoId) {
  if (!modal || !modalBody) return;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  
  // Enhanced YouTube embed with better controls
  const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0&controls=1&modestbranding=1&showinfo=0&fs=1&cc_load_policy=1`;
  modalBody.innerHTML = `
    <div class="video-container">
      <iframe 
        src="${src}" 
        title="YouTube video player" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        allowfullscreen>
      </iframe>
      <div class="video-actions">
        <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" class="external-link">
          🎬 Watch on YouTube
        </a>
      </div>
    </div>
  `;
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

// Contact form is now handled by handleContactForm() function

// Typewriter Animation - Optimized
function initTypewriter() {
  const typewriterElements = document.querySelectorAll('.typewriter-text');
  
  typewriterElements.forEach((element, index) => {
    const text = element.getAttribute('data-text');
    element.textContent = '';
    
    // Stagger the animation for multiple elements
    setTimeout(() => {
      typeText(element, text, 0);
    }, index * 800); // Reduced delay for faster animation
  });
}

function typeText(element, text, index) {
  if (index < text.length) {
    element.textContent += text.charAt(index);
    setTimeout(() => typeText(element, text, index + 1), 50); // Faster typing speed
  } else {
    element.classList.add('typing-complete');
  }
}

// Services scroll animation
function initServicesAnimation() {
  const serviceCards = document.querySelectorAll('.service-card');
  
  const servicesObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Reset animation state
        entry.target.classList.remove('animate');
        
        // Force reflow to ensure reset is applied
        entry.target.offsetHeight;
        
        // Add a small delay to make it feel more natural
        setTimeout(() => {
          entry.target.classList.add('animate');
        }, 100);
      } else {
        // Reset when leaving viewport
        entry.target.classList.remove('animate');
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
  });

  serviceCards.forEach(card => {
    servicesObserver.observe(card);
  });
}

// Stats animation
function initStatsAnimation() {
  const statNumbers = document.querySelectorAll('.stat-number');
  const statLabels = document.querySelectorAll('.stat-label');
  
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Animate numbers first
        setTimeout(() => {
          entry.target.classList.add('animate');
        }, 100);
      } else {
        // Reset animation when scrolling out
        entry.target.classList.remove('animate');
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '0px 0px -100px 0px'
  });

  // Observe both numbers and labels
  statNumbers.forEach(stat => {
    statsObserver.observe(stat);
  });
  
  statLabels.forEach(label => {
    statsObserver.observe(label);
  });
}

// Contact form submission with validation
function handleContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  // Add real-time validation
  const nameInput = document.getElementById('name');
  const phoneInput = document.getElementById('phone');
  const messageInput = document.getElementById('message');

  // Name validation
  nameInput.addEventListener('blur', () => {
    const name = nameInput.value.trim();
    if (name.length === 0) {
      nameInput.setCustomValidity('Name is required');
      nameInput.reportValidity();
    } else if (name.length > 30) {
      nameInput.setCustomValidity('Name must be maximum 30 characters long');
      nameInput.reportValidity();
    } else {
      nameInput.setCustomValidity('');
    }
  });

  // Phone validation
  phoneInput.addEventListener('blur', () => {
    const phone = phoneInput.value.trim();
    if (phone.length === 0) {
      phoneInput.setCustomValidity('Phone number is required');
      phoneInput.reportValidity();
    } else {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone)) {
        phoneInput.setCustomValidity('Please enter a valid 10-digit phone number');
        phoneInput.reportValidity();
      } else {
        phoneInput.setCustomValidity('');
      }
    }
  });

  // Email validation
  const emailInput = document.getElementById('email');
  emailInput.addEventListener('blur', () => {
    const email = emailInput.value.trim();
    if (email.length > 20) {
      emailInput.setCustomValidity('Email must be maximum 20 characters long');
      emailInput.reportValidity();
    } else {
      emailInput.setCustomValidity('');
    }
  });

  // Message validation
  messageInput.addEventListener('blur', () => {
    const message = messageInput.value.trim();
    if (message.length === 0) {
      messageInput.setCustomValidity('Message is required');
      messageInput.reportValidity();
    } else {
      messageInput.setCustomValidity('');
    }
  });

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate all required fields
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const message = messageInput.value.trim();
    
    let isValid = true;
    
    // Check name - required but no minimum length
    if (name.length === 0) {
      nameInput.setCustomValidity('Name is required');
      nameInput.reportValidity();
      isValid = false;
    } else if (name.length > 30) {
      nameInput.setCustomValidity('Name must be maximum 30 characters long');
      nameInput.reportValidity();
      isValid = false;
    }
    
    // Check email
    if (email.length > 20) {
      emailInput.setCustomValidity('Email must be maximum 20 characters long');
      emailInput.reportValidity();
      isValid = false;
    }
    
    // Check phone - required and must be 10 digits
    if (phone.length === 0) {
      phoneInput.setCustomValidity('Phone number is required');
      phoneInput.reportValidity();
      isValid = false;
    } else {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone)) {
        phoneInput.setCustomValidity('Please enter a valid 10-digit phone number');
        phoneInput.reportValidity();
        isValid = false;
      }
    }
    
    // Check message - required but no minimum length
    if (message.length === 0) {
      messageInput.setCustomValidity('Message is required');
      messageInput.reportValidity();
      isValid = false;
    }
    
    if (!isValid) {
      return; // Stop submission if validation fails
    }
    
    const formData = new FormData(contactForm);
    const submission = {
      id: Date.now().toString(),
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
      timestamp: new Date().toISOString(),
      status: 'new'
    };

    try {
      // Save to cloud storage via API
      const api = new PortfolioAPI();
      const portfolioData = await api.getData();
      
      // Ensure submissions array exists
      if (!portfolioData.submissions) {
        portfolioData.submissions = [];
      }
      
      // Add new submission
      portfolioData.submissions.push(submission);
      
      // Save to cloud
      await api.saveData(portfolioData);
      

      // Show success message
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = '✅ Message Sent!';
      submitBtn.disabled = true;
      
      // Reset form
      contactForm.reset();
      
      // Reset button after 3 seconds
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }, 3000);

    } catch (error) {
      console.error('Error saving contact submission:', error);
      alert('There was an error sending your message. Please try again.');
    }
  });
}

// Work slider navigation
function initWorkSlider() {
  const workGrid = document.querySelector('.work-grid');
  const leftBtn = document.querySelector('.work-nav-left');
  const rightBtn = document.querySelector('.work-nav-right');
  
  if (!workGrid || !leftBtn || !rightBtn) return;
  
  const scrollAmount = 320; // Scroll by one card width + gap
  
  leftBtn.addEventListener('click', () => {
    workGrid.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
  });
  
  rightBtn.addEventListener('click', () => {
    workGrid.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  });
  
  // Show/hide arrows based on scroll position
  function updateArrows() {
    const scrollLeft = workGrid.scrollLeft;
    const maxScroll = workGrid.scrollWidth - workGrid.clientWidth;
    
    if (scrollLeft > 0) {
      leftBtn.classList.remove('disabled');
    } else {
      leftBtn.classList.add('disabled');
    }
    
    if (scrollLeft < maxScroll - 10) {
      rightBtn.classList.remove('disabled');
    } else {
      rightBtn.classList.add('disabled');
    }
  }
  
  workGrid.addEventListener('scroll', updateArrows);
  updateArrows(); // Initial state
}

// Initialize typewriter animation when page loads
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initTypewriter, 300); // Reduced initial delay
  initServicesAnimation(); // Initialize services animation
  initStatsAnimation(); // Initialize stats animation
  handleContactForm(); // Initialize contact form
  initWorkSlider(); // Initialize work slider navigation
});

// Cursor-follow glow
const glow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', (e) => {
  glow?.style.setProperty('--mx', e.clientX + 'px');
  glow?.style.setProperty('--my', e.clientY + 'px');
});


