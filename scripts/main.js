'use strict';

/**
 * TypeWriter class for animating text typing effect
 */
class TypeWriter {
  /**
   * @param {HTMLElement} element - The DOM element to write text into
   * @param {string[]} phrases - Array of strings to cycle through
   * @param {number} typeSpeed - Delay in ms between each character typed
   * @param {number} deleteSpeed - Delay in ms between each character deleted
   * @param {number} pauseTime - Time in ms to pause after typing a full phrase
   */
  constructor(element, phrases, typeSpeed = 80, deleteSpeed = 40, pauseTime = 2000) {
    this.element = element;
    this.phrases = phrases;
    this.typeSpeed = typeSpeed;
    this.deleteSpeed = deleteSpeed;
    this.pauseTime = pauseTime;
    this.currentPhrase = 0;
    this.currentChar = 0;
    this.isDeleting = false;
    this.tick();
  }

  tick() {
    const phrase = this.phrases[this.currentPhrase];
    
    if (this.isDeleting) {
      this.currentChar--;
    } else {
      this.currentChar++;
    }

    this.element.textContent = phrase.substring(0, this.currentChar);

    let delay = this.isDeleting ? this.deleteSpeed : this.typeSpeed;

    if (!this.isDeleting && this.currentChar === phrase.length) {
      delay = this.pauseTime;
      this.isDeleting = true;
    } else if (this.isDeleting && this.currentChar === 0) {
      this.isDeleting = false;
      this.currentPhrase = (this.currentPhrase + 1) % this.phrases.length;
      delay = 500;
    }

    setTimeout(() => this.tick(), delay);
  }
}

/**
 * Initialize scroll reveal animation with IntersectionObserver fallback
 */
function initScrollReveal() {
  // Skip if browser supports CSS scroll-driven animations natively
  if (CSS.supports && CSS.supports('(animation-timeline: view()) and (animation-range: entry)')) {
    // CSS @supports block in stylesheet handles these natively
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/**
 * Initialize navbar behaviors (scroll effect and active link highlighting)
 */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 50) {
      navbar.classList.add('nav--scrolled');
    } else {
      navbar.classList.remove('nav--scrolled');
    }
  }, { passive: true });

  // Active section highlighting
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.remove('nav__link--active');
          if (link.getAttribute('href') === `#${entry.target.id}`) {
            link.classList.add('nav__link--active');
          }
        });
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '-80px 0px -50% 0px'
  });

  sections.forEach(section => sectionObserver.observe(section));
}

/**
 * Initialize mobile menu toggle behavior
 */
function initMobileMenu() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('nav__menu--open');
    toggle.classList.toggle('nav__toggle--active');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  menu.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('nav__menu--open');
      toggle.classList.remove('nav__toggle--active');
      document.body.style.overflow = '';
    });
  });
}

/**
 * Initialize smooth scroll for internal anchor links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(targetId);
      if (!target) return;

      const navbar = document.getElementById('navbar');
      const navHeight = navbar ? navbar.offsetHeight : 0;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  });
}

/**
 * Initialize stat counter animations using requestAnimationFrame
 */
function initCounterAnimation() {
  const counters = document.querySelectorAll('.stat-card__number');
  if (!counters.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

/**
 * Animate a single counter element
 * @param {HTMLElement} element 
 */
function animateCounter(element) {
  const text = element.textContent.trim();
  const match = text.match(/^(\d+)(.*)?$/);
  if (!match) return;
  
  const target = parseInt(match[1], 10);
  const suffix = match[2] || '';
  const duration = 1500;
  const start = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    
    element.textContent = current + suffix;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  element.textContent = '0' + suffix;
  requestAnimationFrame(update);
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize typing animation
  const typingElement = document.getElementById('typing-text');
  if (typingElement) {
    new TypeWriter(typingElement, [
      'Django REST APIs',
      'Real-time WebSocket systems',
      'Async task pipelines with Celery',
      'PostgreSQL query optimization',
      'Production deployments on AWS',
      'JWT authentication flows'
    ]);
  }

  // Initialize all modules
  initScrollReveal();
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initCounterAnimation();
});
