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

/**
 * 8-Bit Chiptune Background Music Generator & Interactive Player.
 * Generates an authentic, cozy retro RPG town theme using Web Audio API.
 * Completely self-contained with zero external audio assets.
 */
function initBGM() {
  const toggleBtn = document.getElementById('bgm-toggle');
  const headerBtn = document.getElementById('header-bgm-toggle');
  const stateLabel = document.getElementById('bgm-state');

  if (!toggleBtn && !headerBtn) return;

  let audioCtx = null;
  let masterGain = null;
  let masterFilter = null;
  let isPlaying = false;
  let nextNoteTime = 0;
  let timerId = null;
  let step = 0;

  // Frequencies in Hz for 8-bit notes
  const NOTES = {
    C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
    C6: 1046.50
  };

  // 64-step pattern (4 bars looped, 16 sixteenth notes per bar)
  const bassPattern = [
    // Bar 1: C major
    'C3', null, 'C3', null, 'G3', null, 'C3', null, 'E3', null, 'C3', null, 'G3', null, 'B2', null,
    // Bar 2: G major
    'G2', null, 'G2', null, 'D3', null, 'G2', null, 'B2', null, 'G2', null, 'D3', null, 'G2', null,
    // Bar 3: A minor
    'A2', null, 'A2', null, 'E3', null, 'A2', null, 'C3', null, 'A2', null, 'E3', null, 'A2', null,
    // Bar 4: F major
    'F2', null, 'F2', null, 'C3', null, 'F2', null, 'A2', null, 'F2', null, 'G2', null, 'B2', null
  ];

  const leadPattern = [
    // Bar 1: C major melody
    'E5', null, 'G5', null, 'C5', null, 'D5', null, 'E5', null, 'G5', null, 'D5', null, null, null,
    // Bar 2: G major melody
    'D5', null, 'B4', null, 'G4', null, 'A4', null, 'B4', null, 'D5', null, 'C5', null, null, null,
    // Bar 3: A minor melody
    'C5', null, 'E5', null, 'A4', null, 'B4', null, 'C5', null, 'E5', null, 'D5', null, 'C5', null,
    // Bar 4: F major melody
    'A4', null, 'C5', null, 'F5', null, 'E5', null, 'D5', null, 'G4', null, 'C5', null, null, null
  ];

  const arpChords = [
    ['C4', 'E4', 'G4'], // Bar 1: C
    ['B3', 'D4', 'G4'], // Bar 2: G
    ['A3', 'C4', 'E4'], // Bar 3: Am
    ['A3', 'C4', 'F4']  // Bar 4: F
  ];

  const tempo = 114; // BPM
  const secondsPerBeat = 60.0 / tempo;
  const secondsPer16th = secondsPerBeat / 4;

  function initAudio() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtxClass();

      // Warm lowpass filter to create authentic, non-fatiguing 8-bit sound
      masterFilter = audioCtx.createBiquadFilter();
      masterFilter.type = 'lowpass';
      masterFilter.frequency.setValueAtTime(1800, audioCtx.currentTime);
      masterFilter.Q.setValueAtTime(1.0, audioCtx.currentTime);

      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);

      masterFilter.connect(masterGain);
      masterGain.connect(audioCtx.destination);
    }
  }

  function playTone(freq, startTime, duration, type, gainValue) {
    if (!audioCtx || !freq || !masterFilter) return;
    try {
      const osc = audioCtx.createOscillator();
      const noteGain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      // Envelope
      noteGain.gain.setValueAtTime(0.0001, startTime);
      noteGain.gain.linearRampToValueAtTime(gainValue, startTime + 0.015);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(noteGain);
      noteGain.connect(masterFilter);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.04);
    } catch (e) {
      // Audio node scheduling guard
    }
  }

  function scheduleNotes() {
    if (!audioCtx) return;
    const lookahead = 0.12; // 120ms lookahead
    while (nextNoteTime < audioCtx.currentTime + lookahead) {
      const currentStep = step % 64;
      const barIndex = Math.floor(currentStep / 16);

      // 1. Bass (Triangle wave, warm rounded bottom-end)
      const bassNote = bassPattern[currentStep];
      if (bassNote && NOTES[bassNote]) {
        playTone(NOTES[bassNote], nextNoteTime, secondsPer16th * 1.7, 'triangle', 0.13);
      }

      // 2. Arpeggio Chords (Square wave, quick rhythmic chiptune pulses)
      const chord = arpChords[barIndex];
      const chordNote = chord[currentStep % chord.length];
      if (chordNote && NOTES[chordNote]) {
        playTone(NOTES[chordNote], nextNoteTime, secondsPer16th * 0.7, 'square', 0.022);
      }

      // 3. Lead Melody (Square wave, gentle retro melody)
      const leadNote = leadPattern[currentStep];
      if (leadNote && NOTES[leadNote]) {
        playTone(NOTES[leadNote], nextNoteTime, secondsPer16th * 1.9, 'square', 0.055);
      }

      nextNoteTime += secondsPer16th;
      step++;
    }
  }

  function startMusic() {
    initAudio();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    if (isPlaying) return;

    isPlaying = true;
    updateUI(true);

    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 0.35);

    nextNoteTime = audioCtx.currentTime + 0.05;
    step = 0;
    timerId = setInterval(scheduleNotes, 35);
  }

  function pauseMusic() {
    if (!isPlaying) return;
    isPlaying = false;
    updateUI(false);

    if (masterGain && audioCtx) {
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
    }
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function toggleMusic(userInitiated = true) {
    if (isPlaying) {
      pauseMusic();
      if (userInitiated) localStorage.setItem('portfolio_bgm_state', 'off');
    } else {
      startMusic();
      if (userInitiated) localStorage.setItem('portfolio_bgm_state', 'on');
    }
  }

  function updateUI(playing) {
    if (stateLabel) stateLabel.textContent = playing ? 'ON' : 'OFF';
    if (toggleBtn) toggleBtn.classList.toggle('is-playing', playing);
    if (headerBtn) {
      headerBtn.classList.toggle('is-playing', playing);
      const headerText = headerBtn.querySelector('.bgm-state-text');
      if (headerText) headerText.textContent = playing ? 'BGM: ON' : 'BGM: OFF';
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMusic(true);
    });
  }

  if (headerBtn) {
    headerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMusic(true);
    });
  }

  // Auto-play on first user interaction anywhere on the page
  const autoPlayHandler = () => {
    const savedState = localStorage.getItem('portfolio_bgm_state');
    if (savedState !== 'off' && !isPlaying) {
      startMusic();
    }
    window.removeEventListener('click', autoPlayHandler);
    window.removeEventListener('keydown', autoPlayHandler);
    window.removeEventListener('touchstart', autoPlayHandler);
    window.removeEventListener('scroll', autoPlayHandler);
  };

  window.addEventListener('click', autoPlayHandler, { once: true });
  window.addEventListener('keydown', autoPlayHandler, { once: true });
  window.addEventListener('touchstart', autoPlayHandler, { once: true });
  window.addEventListener('scroll', autoPlayHandler, { once: true });
}

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initHeader();
  initMobileMenu();
  initSmoothScroll();
  initSkillBars();
  initCounters();
  initBGM();
});
