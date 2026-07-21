/**
 * ANIMATION ENGINE
 * ------------------------------------------------------------
 * Smooth scroll (Lenis) + all motion (GSAP). Everything respects
 * `prefers-reduced-motion` and the site works fully without JS.
 *
 * Hooks you can use in any .astro file:
 *   data-enter            → animates in on page load (staggered)
 *   data-reveal           → fades/slides up when scrolled into view
 *   data-mask   + .mask/.mi → masked line reveal on scroll
 *   data-card / data-card-img → project card reveal + parallax + hover zoom
 *   data-parallax         → gentle vertical parallax while scrolling
 *   data-cover            → big cover image clip reveal on page load
 *   .magnetic             → element gently sticks to the cursor
 *   .gate-mi              → masked line revealed by the load timeline
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const html = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

let lenis = null;
let pageCtl = null; // aborts per-page listeners on navigation

/* ============================================================
   BOOT — runs once per real page load
   ============================================================ */
if (!reduced) {
  lenis = new Lenis({ lerp: 0.115 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis && lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ============================================================
   PAGE LIFECYCLE (works with Astro view transitions)
   ============================================================ */
document.addEventListener('astro:page-load', initPage);
document.addEventListener('astro:before-swap', () => {
  pageCtl?.abort();
  ScrollTrigger.getAll().forEach((t) => t.kill());
});
document.addEventListener('astro:after-swap', () => {
  // keep Lenis in sync with the scroll position Astro restored
  lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
});

function initPage() {
  pageCtl = new AbortController();
  const { signal } = pageCtl;

  initClock(signal);
  initAnchors(signal);

  if (reduced) {
    html.classList.add('booted');
    return;
  }

  initCursor(signal);
  initMagnetic(signal);

  entrance(!html.classList.contains('booted'));
  initReveals();
  initMasks();
  initCards(signal);
  initParallax();

  requestAnimationFrame(() => ScrollTrigger.refresh());
}

/* ============================================================
   LOAD CHOREOGRAPHY
   ============================================================ */
function entrance(firstVisit) {
  const pill = $('.hero-pill');
  const pillImg = $('.hero-pill-img');
  const masks = $$('.gate-mi');
  const enters = $$('[data-enter]');
  const chips = $$('.tool-chip');
  const cover = $('[data-cover]');

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

  if (firstVisit) {
    // explicitly set start states, then release the CSS gate
    if (pill) {
      gsap.set(pill, { clipPath: 'inset(0% 50% 0% 50% round 999px)' });
      gsap.set(pillImg, { scale: 1.35 });
    }
    // y:0 clears the px offset gsap parses from the CSS gate transform,
    // otherwise it stays as a residual translate after yPercent animates
    gsap.set(masks, { y: 0, yPercent: 115 });
    gsap.set(enters, { y: 26, opacity: 0 });
    gsap.set(chips, { y: 16, opacity: 0, scale: 0.9 });
    gsap.set('.navpill', { y: 110, opacity: 0 });
    gsap.set('.topbar', { opacity: 0, y: -10 });
    if (cover) gsap.set(cover, { clipPath: 'inset(12% 4% round 40px)', y: 40 });
    html.classList.add('booted');

    if (pill) {
      tl.to(pill, { clipPath: 'inset(0% 0% 0% 0% round 999px)', duration: 1.25 }, 0.1);
      tl.to(pillImg, { scale: 1, duration: 1.25 }, 0.1);
    }
    tl.to(masks, { yPercent: 0, duration: 1.15, stagger: 0.12 }, pill ? 0.35 : 0.15);
    if (cover) tl.to(cover, { clipPath: 'inset(0% 0% round 28px)', y: 0, duration: 1.2 }, 0.5);
    tl.to(enters, { y: 0, opacity: 1, duration: 0.9, stagger: 0.07 }, pill ? 0.65 : 0.4);
    if (chips.length)
      tl.to(
        chips,
        { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.7)', stagger: 0.06 },
        0.85
      );
    tl.to('.topbar', { opacity: 1, y: 0, duration: 0.8 }, 0.7);
    tl.to('.navpill', { y: 0, opacity: 1, duration: 0.9 }, 0.95);
  } else {
    // soft entrance on internal navigation (view transition already fades)
    if (masks.length)
      tl.fromTo(masks, { y: 0, yPercent: 115 }, { yPercent: 0, duration: 0.9, stagger: 0.09 }, 0);
    if (cover)
      tl.fromTo(
        cover,
        { clipPath: 'inset(10% 3% round 36px)', y: 28 },
        { clipPath: 'inset(0% 0% round 28px)', y: 0, duration: 0.9 },
        0.1
      );
    if (enters.length)
      tl.fromTo(enters, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.05 }, 0.1);
    if (chips.length)
      tl.fromTo(
        chips,
        { y: 12, opacity: 0, scale: 0.94 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.6)', stagger: 0.05 },
        0.2
      );
  }
}

/* ============================================================
   SCROLL REVEALS
   ============================================================ */
function initReveals() {
  $$('[data-reveal]').forEach((el) => {
    gsap.fromTo(
      el,
      { y: 34, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      }
    );
  });
}

function initMasks() {
  $$('[data-mask]').forEach((group) => {
    const lines = $$('.mi', group);
    if (!lines.length) return;
    gsap.fromTo(
      lines,
      { y: 0, yPercent: 115 },
      {
        yPercent: 0,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.1,
        scrollTrigger: { trigger: group, start: 'top 85%', once: true },
      }
    );
  });
}

/* ============================================================
   PROJECT CARDS — reveal, parallax, hover zoom
   ============================================================ */
function initCards(signal) {
  $$('[data-card]').forEach((card) => {
    const wrap = $('[data-card-img]', card);
    const img = wrap && $('img', wrap);

    gsap.fromTo(
      card,
      { y: 56, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 90%', once: true },
      }
    );

    if (!img) return;

    gsap.fromTo(
      img,
      { scale: 1.22 },
      {
        scale: 1,
        duration: 1.5,
        ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 90%', once: true },
      }
    );

    // parallax drift while the card passes through the viewport
    gsap.fromTo(
      img,
      { yPercent: -5.5 },
      {
        yPercent: 5.5,
        ease: 'none',
        scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: true },
      }
    );

    if (finePointer) {
      card.addEventListener(
        'mouseenter',
        () => gsap.to(img, { scale: 1.07, duration: 0.7, ease: 'power3.out' }),
        { signal }
      );
      card.addEventListener(
        'mouseleave',
        () => gsap.to(img, { scale: 1, duration: 0.7, ease: 'power3.out' }),
        { signal }
      );
    }
  });
}

function initParallax() {
  $$('[data-parallax]').forEach((el) => {
    gsap.fromTo(
      el,
      { yPercent: -4 },
      {
        yPercent: 4,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      }
    );
  });
}

/* ============================================================
   CURSOR + MAGNETIC BUTTONS
   ============================================================ */
function initCursor(signal) {
  const cursor = $('.cursor');
  if (!cursor || !finePointer) return;

  const xTo = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });

  window.addEventListener(
    'pointermove',
    (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
      cursor.classList.add('is-on');
    },
    { signal }
  );
  document.addEventListener(
    'mouseover',
    (e) => {
      const view = e.target.closest?.('[data-cursor="view"]');
      const link = e.target.closest?.('a, button');
      cursor.classList.toggle('is-view', !!view);
      cursor.classList.toggle('is-link', !!link && !view);
    },
    { signal }
  );
  document.addEventListener('mousedown', () => cursor.classList.add('is-press'), { signal });
  document.addEventListener('mouseup', () => cursor.classList.remove('is-press'), { signal });
  html.addEventListener('mouseleave', () => cursor.classList.remove('is-on'), { signal });
}

function initMagnetic(signal) {
  if (!finePointer) return;
  $$('.magnetic').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' });
    el.addEventListener(
      'pointermove',
      (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.4);
      },
      { signal }
    );
    el.addEventListener(
      'pointerleave',
      () => {
        xTo(0);
        yTo(0);
      },
      { signal }
    );
  });
}

/* ============================================================
   SMOOTH ANCHORS + CLOCK
   ============================================================ */
function initAnchors(signal) {
  $$('a[href*="#"]').forEach((a) => {
    a.addEventListener(
      'click',
      (e) => {
        const href = a.getAttribute('href') || '';
        const [path, hash] = href.split('#');
        if (!hash) return;
        // only intercept when we're already on the target page
        if (path && path !== window.location.pathname) return;
        const target = hash === 'top' ? 0 : document.getElementById(hash);
        if (target === null) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { duration: 1.4 });
        else if (target === 0) window.scrollTo({ top: 0, behavior: 'smooth' });
        else target.scrollIntoView({ behavior: 'smooth' });
      },
      { signal }
    );
  });
}

function initClock(signal) {
  const el = $('[data-time]');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Berlin',
  });
  const tick = () => (el.textContent = fmt.format(new Date()));
  tick();
  const id = setInterval(tick, 10_000);
  signal.addEventListener('abort', () => clearInterval(id));
}
