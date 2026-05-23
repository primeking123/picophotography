// ============================================
// PICO SHOTS PHOTOGRAPHY - MAIN.JS
// Performance-optimized with throttled events
// ============================================

// Utility: Throttle function to limit event firing rate
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Utility: Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  // Add loaded class to body for cursor visibility
  document.body.classList.add('loaded');

  // Initialize all modules
  initMobileMenu();
  initCustomCursor();
  initMagneticButtons();
  initScrollEffects();
  initParticles();
  initFormHandling();
  initGalleryLightbox();
});

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (!menuToggle || !navLinks) return;

  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
  });

  // Close menu when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

// ============================================
// CUSTOM CURSOR - Optimized with throttling
// ============================================
function initCustomCursor() {
  // Check if device supports hover (not touch) - PERFORMANCE: Skip on touch devices
  if (window.matchMedia('(hover: none)').matches) {
    return;
  }

  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cursor);

  const cursorDot = document.createElement('div');
  cursorDot.className = 'cursor-dot';
  cursorDot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cursorDot);

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let dotX = 0, dotY = 0;

  // THROTTLED: Limit mousemove event to improve performance
  const throttledMouseMove = throttle((e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, 16); // ~60fps

  document.addEventListener('mousemove', throttledMouseMove);

  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.12;
    cursorY += (mouseY - cursorY) * 0.12;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';

    dotX += (mouseX - dotX) * 0.4;
    dotY += (mouseY - dotY) * 0.4;
    cursorDot.style.left = dotX + 'px';
    cursorDot.style.top = dotY + 'px';

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Cursor hover effects - optimized with throttling
  const interactiveElements = document.querySelectorAll(
    'a, button, .gallery-item, .service-card, .preview-item, .team-card, input, textarea, select, .social-btn, .cta-btn, .submit-btn, .input-group'
  );

  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hover');
      cursorDot.style.transform = 'translate(-50%, -50%) scale(0.5)';
    });

    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hover');
      cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  });

  const textElements = document.querySelectorAll('h1, h2, h3, h4, p, .section-title, .service-icon');
  textElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hover-text');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hover-text');
    });
  });
}

// ============================================
// MAGNETIC BUTTONS - Optimized with throttling
// ============================================
function initMagneticButtons() {
  const magneticElements = document.querySelectorAll(
    '.cta-btn, .submit-btn, .social-btn, .nav-links a, .logo, .preview-item, .gallery-item, .service-card, .team-card, .input-group'
  );

  magneticElements.forEach(el => {
    // THROTTLED: Limit mousemove to improve performance
    const throttledMouseMove = throttle((e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const distance = Math.sqrt(x * x + y * y);
      const maxDistance = Math.max(rect.width, rect.height);

      // REDUCED: Lower maxDistance for less aggressive movement
      if (distance < maxDistance * 1.2) {
        const strength = 0.10; // REDUCED: From 0.15 to 0.10 for subtler effect
        const moveX = x * strength;
        const moveY = y * strength;
        el.style.transform = `translate(${moveX}px, ${moveY}px)`;
      }
    }, 16); // ~60fps

    el.addEventListener('mousemove', throttledMouseMove);

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0, 0)';
    });
  });
}

// ============================================
// SCROLL EFFECTS
// ============================================
function initScrollEffects() {
  // Navbar background on scroll - DEBOUNCED for performance
  const nav = document.getElementById('navbar');
  if (nav) {
    const debouncedScroll = debounce(() => {
      if (window.scrollY > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }, 10);
    window.addEventListener('scroll', debouncedScroll);
  }

  // Reveal animations on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal, .reveal-fast, .reveal-slow').forEach(el => {
    observer.observe(el);
  });

  // Parallax effects - DEBOUNCED for performance
  let ticking = false;
  const debouncedParallax = debounce(() => {
    const scrolled = window.pageYOffset;

    // Parallax for hero videos - only on non-touch devices
    if (!window.matchMedia('(hover: none)').matches) {
      document.querySelectorAll('.hero-bg, .contact-hero-video, .hero-video-bg').forEach(video => {
        video.style.transform = `scale(1.1) translateY(${scrolled * 0.3}px)`;
      });
    }

    ticking = false;
  }, 16);

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        debouncedParallax();
        ticking = false;
      });
      ticking = true;
    }
  });
}

// ============================================
// PARTICLE SYSTEM
// ============================================
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const colors = ['#ee6352', '#5b5f97', '#c2e812'];

  for (let i = 0; i < 40; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 10 + 's';
    particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    particle.style.width = Math.random() * 4 + 2 + 'px';
    particle.style.height = particle.style.width;
    container.appendChild(particle);
  }
}

// ============================================
// FORM HANDLING
// ============================================
function initFormHandling() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', handleSubmit);
}

function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const submitBtn = form.querySelector('.submit-btn');

  // Basic validation
  const formData = new FormData(form);
  const required = getRequiredFields(form);
  let isValid = true;

  required.forEach(fieldName => {
    const input = form.querySelector(`[name="${fieldName}"]`);
    if (!formData.get(fieldName) || formData.get(fieldName).trim() === '') {
      isValid = false;
      highlightError(input);
    }
  });

  if (!isValid) {
    return;
  }

  // Email validation
  const email = formData.get('email');
  if (email && !isValidEmail(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  // SECURITY: Form data should be sanitized on the server to prevent XSS
  // Server-side should implement:
  // 1. Input sanitization (remove HTML/script tags)
  // 2. CAPTCHA verification (Google reCAPTCHA v3 or Cloudflare Turnstile)
  // 3. Rate limiting to prevent spam
  // 4. Content-Security-Policy headers

  // Show loading state
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;

  // Simulate form submission
  setTimeout(() => {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;

    // Hide form and show success
    form.style.display = 'none';
    const successModal = document.getElementById('successModal');
    if (successModal) {
      successModal.classList.add('show');
    }
  }, 2000);
}

function getRequiredFields(form) {
  const fields = [];
  form.querySelectorAll('[required]').forEach(input => {
    fields.push(input.name);
  });
  return fields;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function highlightError(input) {
  input.style.borderColor = 'var(--accent1)';
  input.style.animation = 'shake 0.5s ease';
  setTimeout(() => {
    input.style.borderColor = '';
    input.style.animation = '';
  }, 2000);
}

function closeSuccessModal() {
  const successModal = document.getElementById('successModal');
  const contactForm = document.getElementById('contactForm');
  if (successModal && contactForm) {
    successModal.classList.remove('show');
    contactForm.style.display = 'flex';
    contactForm.reset();
  }
}

// ============================================
// GALLERY LIGHTBOX & FILTERING
// ============================================
function initGalleryLightbox() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');

  if (filterBtns.length === 0) return;

  // Filter functionality
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.textContent.toLowerCase();

      galleryItems.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
          item.style.display = 'block';
          item.style.animation = 'fadeIn 0.6s var(--ease-out-expo)';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Lightbox functionality
  if (lightbox && lightboxImg) {
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        lightboxImg.src = img.src;
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      });
    });

    // Close lightbox on button click
    const closeBtn = lightbox.querySelector('button');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
      });
    }

    // Close lightbox on background click
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    });
  }
}

// ============================================
// SMOOTH SCROLL
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ============================================
// ANIMATION KEYFRAMES (injected dynamically)
// ============================================
const animationStyles = document.createElement('style');
animationStyles.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes float-particle {
    0% {
      transform: translateY(100vh) rotate(0deg) scale(0);
      opacity: 0;
    }
    10% {
      opacity: 0.6;
      transform: translateY(90vh) rotate(45deg) scale(1);
    }
    90% {
      opacity: 0.6;
    }
    100% {
      transform: translateY(-10vh) rotate(720deg) scale(0);
      opacity: 0;
    }
  }

  /* Respect reduced motion preferences */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;
document.head.appendChild(animationStyles);

// ============================================
// EXPORT FUNCTIONS FOR GLOBAL ACCESS
// ============================================
window.closeSuccess = closeSuccessModal;
window.handleSubmit = handleSubmit;

// Additional export for inline onclick handlers
function closeSuccess() {
  closeSuccessModal();
}

// ============================================
// PAGE-SPECIFIC INITIALIZATION
// ============================================
const currentPage = window.location.pathname.split('/').pop() || 'home.html';

switch(currentPage) {
  case 'home.html':
    initHomePage();
    break;
  case 'about.html':
    initAboutPage();
    break;
  case 'gallery.html':
    initGalleryPage();
    break;
  case 'services.html':
    initServicesPage();
    break;
  case 'contact.html':
    initContactPage();
    break;
}

function initHomePage() {
  console.log('Home page initialized');
}

function initAboutPage() {
  console.log('About page initialized');
}

function initGalleryPage() {
  console.log('Gallery page initialized');
}

function initServicesPage() {
  console.log('Services page initialized');
}

function initContactPage() {
  console.log('Contact page initialized');
}
