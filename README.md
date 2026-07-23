# visualsbymarvin ✳

Personal portfolio of **Marvin Gehlen — Creative Designer**.

Bold, minimal, highly animated. Built with [Astro 5](https://astro.build), [Tailwind CSS 4](https://tailwindcss.com), [GSAP](https://gsap.com) (motion) and [Lenis](https://lenis.darkroom.engineering) (smooth scroll). Fully static — deploys anywhere for free.

---

## Quickstart

```bash
npm install     # once
npm run dev     # local dev server → http://localhost:4321
npm run build   # production build into dist/
npm run preview # preview the production build
```

---

## Where to edit what

| I want to change… | File |
| --- | --- |
| **My projects / case studies** | `src/content/projects/<project>/index.md` |
| Name, **email**, socials, status badge | `src/data/site.ts` |
| **Experience & education** (About page) | `src/data/experience.ts` |
| Hero texts ("I'm Marvin", subline) | `src/pages/index.astro` |
| About page bio texts | `src/pages/about.astro` |
| **My photo** | `src/assets/image_pill_me.png` (just replace the file) |
| Floating tool icons + their positions | `src/components/Tools.astro` |
| **Colors & fonts** | `src/styles/global.css` (the `@theme` block at the top) |
| Footer / CTA texts | `src/components/Footer.astro` |
| Imprint (Impressum) | `src/pages/imprint.astro` |
| Animations | `src/scripts/app.js` |
| Domain for SEO tags | `astro.config.mjs` → `site` |

Files with editable content have a `✏️ EDIT HERE` comment at the top.

---

## Adding / editing a project

Each project is **one folder** in `src/content/projects/`:

```
src/content/projects/
└── conjure/
    ├── index.md    ← all text + settings
    ├── cover.jpg   ← card + page cover image
    ├── 01.jpg      ← images used inside the page
    └── 02.jpg
```

**To add a project:** copy an existing folder, rename it (the folder name becomes the URL, e.g. `myproject` → `/work/myproject/`), drop your images in, and edit `index.md`:

```md
---
title: 'Conjure'
categories: ['Mobile App', 'Case Study']   # shown as "Mobile App | Case Study"
description: 'One or two sentences. Used on the card and as the page intro.'
year: '2025'
role: 'UX & UI Design'
tools: ['Figma', 'Illustrator']
cover: './cover.jpg'
coverAlt: 'Short image description'
order: 1            # lower number = shown first
# externalUrl: 'https://…'   # optional: adds a "Live" link
# featured: false            # hide from the landing grid
# draft: true                # hide the project completely
---

A short intro sentence or two.

![Describe the image](./01.jpg)

## Optional small heading

Only write text for the really important stuff — the images do the talking.

![Another image](./02.jpg)
```

That's the whole system: **images with a few short sentences in between.** Every image you reference gets optimized automatically (WebP, responsive sizes).

**Cover images:** use a **16:9** ratio — **1600 × 900 px** is ideal (a YouTube-thumbnail export drops straight in). The card preview shows the whole cover with only a tiny (~3%) trim at the edges, so keep important text a little away from the very border. Inside-the-page images (the `![](...)` ones) can be any size — they show at full width, uncropped.

The four demo projects (Conjure, TrialMatch, Epoch, Bionova) are placeholders — replace them with your real work.

---

## Your photos

- `src/assets/image_pill_me.png` — used in the hero pill **and** on the About page. Replace it with any wide image (~1400×450, the pill shape is baked in / cropped by the container).
- `public/og.jpg` — the preview image shown when you share your link (1200×630).

---

## Before you go live — checklist

- [ ] Replace the 4 demo projects with real work
- [ ] Fill in `src/data/experience.ts` (everything in `[brackets]`)
- [ ] Check email + add social links in `src/data/site.ts`
- [ ] Fill in your address in `src/pages/imprint.astro` (**legally required in Germany**)
- [ ] Set your real domain in `astro.config.mjs`
- [ ] Optional: swap `public/og.jpg` for a designed share image

---

## Animations — how they work

All motion lives in `src/scripts/app.js` and is driven by small `data-` attributes you can put on any element:

| Attribute / class | Effect |
| --- | --- |
| `data-enter` | fades up as part of the page-load choreography |
| `data-reveal` | fades up when scrolled into view |
| `data-mask` + `.mask > .mi` spans | masked line reveal (text slides out of a clipped box) |
| `data-cover` | big image clip-reveal on page load |
| `data-card` / `data-card-img` | project card reveal + parallax + hover zoom |
| `data-parallax` | gentle vertical parallax |
| `.magnetic` | element sticks slightly to the cursor |
| `.hero-tools` / `.tool-float` | tool icons that float around the hero title (bob + cursor parallax) |

The floating hero icons orbit the title on desktop/tablet and fall back to a
tidy row under the subtext on phones. Reposition or restyle them in
`src/components/Tools.astro` (each icon's `dx`/`dy` = desktop position).

Smooth scrolling, the custom cursor and all animations automatically switch off for users with `prefers-reduced-motion`, and the site is fully readable with JavaScript disabled.

The **Smooth / Instant toggle** in the top bar lets any visitor turn the eased (Lenis) scrolling off in favour of native instant scrolling; the choice is remembered in their browser (`localStorage`). Default is smooth, or instant when the OS requests reduced motion.

---

## Deploying (free)

The site is 100% static. Easiest options:

- **Vercel / Netlify:** import the GitHub repo → framework "Astro" is auto-detected → deploy. Every push deploys automatically.
- **Cloudflare Pages:** same flow; build command `npm run build`, output `dist`.

Then connect your domain in the host's dashboard and update `site` in `astro.config.mjs`.
