'use strict';

/**
 * Initializes the scroll reveal effect using IntersectionObserver.
 * Elements with class .reveal will fade in and slide up when entering the viewport.
 */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/**
 * Initializes header behavior including scroll state and active section highlighting.
 */
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  }, { passive: true });

  // Active section detection
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.header__link');

  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(link => {
          link.classList.toggle('header__link--active',
            link.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' });

  sections.forEach(s => sectionObs.observe(s));
}

/**
 * Initializes the mobile menu toggle functionality.
 */
function initMobileMenu() {
  const toggle = document.getElementById('header-toggle');
  const nav = document.getElementById('header-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.classList.toggle('is-active');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  nav.querySelectorAll('.header__link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.classList.remove('is-active');
      document.body.style.overflow = '';
    });
  });
}

/**
 * Initializes smooth scrolling for anchor links.
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const header = document.getElementById('header');
      const offset = header ? header.offsetHeight + 20 : 20;
      const pos = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: pos, behavior: 'smooth' });
    });
  });
}

/**
 * Initializes the skill bar animation with stagger effect.
 */
function initSkillBars() {
  const categories = document.querySelectorAll('.skill-category');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const blocks = entry.target.querySelectorAll('.skill-bar__block.filled');
        blocks.forEach((block, i) => {
          setTimeout(() => {
            block.classList.add('skill-bar__block--animate');
          }, i * 50);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  categories.forEach(cat => observer.observe(cat));
}

/**
 * Initializes stat counters animation.
 */
function initCounters() {
  const counters = document.querySelectorAll('.stat__number');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/**
 * Animates a counter element from 0 to its target value.
 * @param {HTMLElement} el - The element containing the target number.
 */
function animateCounter(el) {
  const text = el.textContent.trim();
  const match = text.match(/^(\d+)(.*)?$/);
  if (!match) return;
  const target = parseInt(match[1], 10);
  const suffix = match[2] || '';
  const duration = 1200;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  el.textContent = '0' + suffix;
  requestAnimationFrame(update);
}

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initHeader();
  initMobileMenu();
  initSmoothScroll();
  initSkillBars();
  initCounters();
});
