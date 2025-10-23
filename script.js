// Smooth scrolling and active link highlighting
const header = document.getElementById('header');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.getElementById('navMenu');
const links = document.querySelectorAll('.nav-link');

// Fixed navbar scroll effect
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

navToggle?.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  navMenu.classList.toggle('show');
});

// Handle navigation for both navbar links and hero buttons
const allNavigationLinks = document.querySelectorAll('a[href^="#"]');
allNavigationLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    
    // Close mobile menu if it's open
    if (navMenu) {
      navMenu.classList.remove('show');
    }
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'false');
    }
    
    // Get target section
    const targetId = link.getAttribute('href')?.replace('#', '');
    const targetSection = document.getElementById(targetId);
    
    if (targetSection) {
      // Calculate offset to account for fixed header
      const headerHeight = 100; // Further increased to ensure hero section is completely hidden
      const targetPosition = targetSection.offsetTop - headerHeight;
      
      // Smooth scroll to section with proper offset
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Additional specific handler for hero buttons to ensure they work identically
document.addEventListener('DOMContentLoaded', () => {
  const watchWorkBtn = document.querySelector('a[href="#work"]');
  if (watchWorkBtn) {
    watchWorkBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const workSection = document.getElementById('work');
      if (workSection) {
        const headerHeight = 100;
        const targetPosition = workSection.offsetTop - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  }
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
}, { rootMargin: '-10% 0px -10% 0px', threshold: 0.01 });

sections.forEach(sec => activeObserver.observe(sec));

// Simple skills animation system
let skillsAnimated = false;

function animateSkills() {
  if (skillsAnimated) return;
  
            const bars = document.querySelectorAll('.bar span');
  
  bars.forEach((bar, index) => {
    const progress = bar.getAttribute('data-progress');
    if (!progress) return;
    
    // Reset and animate
    bar.style.width = '0%';
    bar.style.transition = 'width 1.5s ease-out';
    
                setTimeout(() => {
                  bar.style.width = progress + '%';
                }, index * 300);
  });
  
  skillsAnimated = true;
}

function resetSkills() {
  const bars = document.querySelectorAll('.bar span');
  bars.forEach(bar => {
    bar.style.width = '0%';
  });
  skillsAnimated = false;
}

// Simple intersection observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateSkills();
    } else {
      resetSkills();
    }
  });
}, { threshold: 0.5 });

// Start observing
            document.addEventListener('DOMContentLoaded', () => {
              const aboutSection = document.getElementById('about');
              if (aboutSection) {
                observer.observe(aboutSection);
              }
            });

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
  const animationStates = new Map(); // Track animation states
  
  // Enhanced animation with reverse scrolling support
  const servicesObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      const card = entry.target;
      const cardId = card.getAttribute('data-card-id') || Math.random().toString(36);
      
      if (!card.getAttribute('data-card-id')) {
        card.setAttribute('data-card-id', cardId);
      }
      
      if (entry.isIntersecting) {
        // Animate in
        if (!animationStates.get(cardId) || animationStates.get(cardId) === 'hidden') {
          animationStates.set(cardId, 'animating');
          
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
            card.style.filter = 'blur(0px)';
            card.style.boxShadow = '0 20px 40px rgba(139,92,246,0.15)';
            animationStates.set(cardId, 'visible');
          }, index * 150);
        }
      } else {
        // Animate out (reverse scrolling)
        if (animationStates.get(cardId) === 'visible') {
          animationStates.set(cardId, 'animating');
          
          setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px) scale(0.9)';
            card.style.filter = 'blur(5px)';
            card.style.boxShadow = '0 0 0 rgba(139,92,246,0)';
            animationStates.set(cardId, 'hidden');
          }, index * 100);
        }
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  serviceCards.forEach((card, index) => {
    // Set initial state with more dramatic effect
    card.style.opacity = '0';
    card.style.transform = 'translateY(50px) scale(0.9)';
    card.style.filter = 'blur(5px)';
    card.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.8s ease, box-shadow 0.8s ease';
    card.style.boxShadow = '0 0 0 rgba(139,92,246,0)';
    
    // Check if card is already in viewport
    const rect = card.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      // Card is already visible, show it with animation
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
        card.style.filter = 'blur(0px)';
        card.style.boxShadow = '0 20px 40px rgba(139,92,246,0.15)';
        animationStates.set(card.getAttribute('data-card-id'), 'visible');
      }, index * 100);
    }
    
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

  // Clear any existing validation messages on focus
  nameInput.addEventListener('focus', () => {
    nameInput.setCustomValidity('');
  });

  phoneInput.addEventListener('focus', () => {
    phoneInput.setCustomValidity('');
  });

  const emailInput = document.getElementById('email');
  emailInput.addEventListener('focus', () => {
    emailInput.setCustomValidity('');
  });

  messageInput.addEventListener('focus', () => {
    messageInput.setCustomValidity('');
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
    
    // Check email (optional field)
    if (email.length > 0 && email.length > 20) {
      emailInput.setCustomValidity('Email must be maximum 20 characters long');
      emailInput.reportValidity();
      isValid = false;
    } else if (email.length > 0) {
      // Basic email format validation if provided
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        emailInput.setCustomValidity('Please enter a valid email address');
        emailInput.reportValidity();
        isValid = false;
      }
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
  
  // Detect mobile and adjust scroll amount
  const isMobile = window.innerWidth <= 768;
  const scrollAmount = isMobile ? window.innerWidth - 20 : 520; // Mobile: full width, Desktop: card width
  
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
  
  // Show/hide arrows based on scroll position and content width
  function updateArrows() {
    const scrollLeft = workGrid.scrollLeft;
    const maxScroll = workGrid.scrollWidth - workGrid.clientWidth;
    
    // Check if scrolling is needed
    const needsScroll = workGrid.scrollWidth > workGrid.clientWidth;
    
    if (!needsScroll) {
      // Hide both arrows if content fits without scrolling
      leftBtn.style.display = 'none';
      rightBtn.style.display = 'none';
      return;
    } else {
      // Show arrows if scrolling is needed
      leftBtn.style.display = 'flex';
      rightBtn.style.display = 'flex';
    }
    
    // Update arrow states based on scroll position
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
  
  // Update arrows on window resize and when content loads
  window.addEventListener('resize', updateArrows);
  
  // Check arrows after a delay to ensure videos are loaded
  setTimeout(updateArrows, 500);
  updateArrows(); // Initial state
}

// Initialize typewriter animation when page loads
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initTypewriter, 300); // Reduced initial delay
  initServicesAnimation(); // Initialize services animation
  initStatsAnimation(); // Initialize stats animation
  handleContactForm(); // Initialize contact form
  initWorkSlider(); // Initialize work slider navigation
  initWorkAutoRotate(); // Initialize auto-rotating carousel
});

// Auto-rotating work carousel (Netflix/Amazon style)
function initWorkAutoRotate() {
  
  const workGrid = document.querySelector('.work-grid');
  if (!workGrid) {
    return;
  }
  
  let rotationInterval;
  let isAutoRotating = false;
  
  function startAutoRotation() {
    
    const workItems = document.querySelectorAll('.work-item');
    
    if (workItems.length <= 1) {
      return;
    }
    
    // Check if content is scrollable
    const isScrollable = workGrid.scrollWidth > workGrid.clientWidth;
    if (!isScrollable) {
    return;
  }
    
    isAutoRotating = true;
    let currentPosition = 0;
    // Detect mobile and adjust scroll amount
    const isMobile = window.innerWidth <= 768;
    const scrollAmount = isMobile ? window.innerWidth - 20 : 520; // Mobile: full width, Desktop: card width
    const rotationSpeed = 1500; // 1.5 seconds - very fast rotation
    
    rotationInterval = setInterval(() => {
      if (!isAutoRotating) return;
      
      
      currentPosition += scrollAmount;
      const maxScroll = workGrid.scrollWidth - workGrid.clientWidth;
      
      if (currentPosition >= maxScroll) {
        // Reset to beginning
        currentPosition = 0;
        workGrid.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      } else {
        workGrid.scrollBy({
          left: scrollAmount,
          behavior: 'smooth'
        });
      }
    }, rotationSpeed);
  }
  
  function stopAutoRotation() {
    isAutoRotating = false;
    if (rotationInterval) {
      clearInterval(rotationInterval);
      rotationInterval = null;
    }
  }
  
  // Pause on hover
  workGrid.addEventListener('mouseenter', stopAutoRotation);
  workGrid.addEventListener('mouseleave', () => {
    if (!rotationInterval) {
      startAutoRotation();
    }
  });
  
  // Pause on manual scroll
  let scrollTimeout;
  workGrid.addEventListener('scroll', () => {
    stopAutoRotation();
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      startAutoRotation();
    }, 2000); // Reduced pause time from 3s to 2s
  });
  
  // Start rotation after a delay
  setTimeout(() => {
    startAutoRotation();
  }, 2000); // Reduced delay from 3s to 2s
}



