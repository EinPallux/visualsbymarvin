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
   SMOOTH SCROLL — lifecycle + user toggle
   ------------------------------------------------------------
   The top-bar toggle switches Lenis smooth scrolling on/off.
   Smooth is the standard default; a visitor's own choice is then
   remembered in localStorage. (The OS "reduce motion" setting is
   respected — those users default to instant.)
   ============================================================ */
// bump the suffix if you ever want to reset everyone back to the default
const SCROLL_KEY = 'scrollMode-v2';

function readScrollPref() {
  let stored = null;
  try {
    stored = localStorage.getItem(SCROLL_KEY);
  } catch {}
  if (stored === 'smooth') return true;
  if (stored === 'instant') return false;
  return !reduced; // default: smooth (unless the OS asks to reduce motion)
}

function lenisRaf(time) {
  lenis && lenis.raf(time * 1000);
}

function enableSmooth() {
  if (lenis) return;
  lenis = new Lenis({ lerp: 0.115 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(lenisRaf);
  gsap.ticker.lagSmoothing(0);
  lenis.scrollTo(window.scrollY, { immediate: true, force: true });
}

function disableSmooth() {
  if (!lenis) return;
  gsap.ticker.remove(lenisRaf);
  lenis.destroy();
  lenis = null;
  ScrollTrigger.refresh();
}

function applyScrollMode(smooth, persist) {
  if (persist) {
    try {
      localStorage.setItem(SCROLL_KEY, smooth ? 'smooth' : 'instant');
    } catch {}
  }
  if (smooth) enableSmooth();
  else disableSmooth();
  // reflect the state on every toggle currently in the DOM
  $$('.scroll-toggle').forEach((t) => (t.dataset.active = smooth ? 'smooth' : 'instant'));
  $$('.scroll-toggle [data-scroll-mode]').forEach((b) =>
    b.setAttribute(
      'aria-pressed',
      b.dataset.scrollMode === (smooth ? 'smooth' : 'instant') ? 'true' : 'false'
    )
  );
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
  // Astro resets <html>'s classes to the server-rendered set on every swap,
  // dropping the classes our client code owns. Re-apply them before paint so
  // e.g. the scroll toggle (gated on `.js`) stays visible on every page.
  const cl = document.documentElement.classList;
  cl.add('js');
  if (lenis) cl.add('lenis', 'lenis-smooth');
  // keep Lenis in sync with the scroll position Astro restored
  lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
});

function initPage() {
  pageCtl = new AbortController();
  const { signal } = pageCtl;

  initClock(signal);
  initAnchors(signal);
  initScrollToggle(signal);

  if (reduced) {
    html.classList.add('booted');
    return;
  }

  initCursor(signal);
  initMagnetic(signal);
  initToolFloat(signal);

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
  const floats = $$('.tool-float');
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
    // yPercent (not y) so the JS cursor-parallax can add y in px later
    gsap.set(floats, { yPercent: 40, opacity: 0, scale: 0.85 });
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
    if (floats.length)
      tl.to(
        floats,
        { yPercent: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.6)', stagger: 0.08 },
        0.8
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
    if (floats.length)
      tl.fromTo(
        floats,
        { yPercent: 30, opacity: 0, scale: 0.9 },
        { yPercent: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.6)', stagger: 0.05 },
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

/* ---- floating hero icons: gentle cursor parallax (desktop) ---- */
function initToolFloat(signal) {
  if (!finePointer) return;
  const hero = $('.hero-sec');
  const items = $$('.hero-tools .tool-float');
  if (!hero || !items.length) return;

  const movers = items.map((el, i) => ({
    xTo: gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3' }),
    yTo: gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3' }),
    // alternate direction + vary strength so icons drift independently
    depth: (i % 2 === 0 ? -1 : 1) * (0.6 + (i % 3) * 0.32),
  }));
  const clamp = (v) => Math.max(-0.6, Math.min(0.6, v));

  hero.addEventListener(
    'pointermove',
    (e) => {
      if (window.innerWidth < 768) return; // icons sit in a static row on phones
      const r = hero.getBoundingClientRect();
      const nx = clamp((e.clientX - (r.left + r.width / 2)) / r.width);
      const ny = clamp((e.clientY - (r.top + r.height / 2)) / r.height);
      movers.forEach((m) => {
        m.xTo(nx * 48 * m.depth);
        m.yTo(ny * 40 * m.depth);
      });
    },
    { signal }
  );
  hero.addEventListener(
    'pointerleave',
    () => movers.forEach((m) => (m.xTo(0), m.yTo(0))),
    { signal }
  );
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
        // smooth mode → eased Lenis scroll; instant/reduced → jump
        if (lenis) {
          lenis.scrollTo(target, { duration: 1.4 });
        } else if (target === 0) {
          window.scrollTo({ top: 0, behavior: 'instant' });
        } else {
          target.scrollIntoView({ behavior: 'instant' });
        }
      },
      { signal }
    );
  });
}

function initScrollToggle(signal) {
  // apply the saved (or default) mode, then bind the buttons
  applyScrollMode(readScrollPref(), false);
  $$('.scroll-toggle [data-scroll-mode]').forEach((btn) => {
    btn.addEventListener(
      'click',
      () => applyScrollMode(btn.dataset.scrollMode === 'smooth', true),
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
