import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * PROJECTS COLLECTION
 * ------------------------------------------------------------
 * Every folder inside `src/content/projects/` that contains an
 * `index.md` becomes one project (folder name = URL slug).
 *
 * ✏️ To add a project: copy an existing folder, rename it,
 *    swap the images and edit index.md — that's it.
 */
const projects = defineCollection({
  loader: glob({
    pattern: '**/index.md',
    base: './src/content/projects',
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      /** Project name shown on the card + page */
      title: z.string(),
      /** Shown as "Product Design | SaaS" under the title */
      categories: z.array(z.string()).default([]),
      /** 1–2 sentences. Used on the card and as page intro */
      description: z.string(),
      /** e.g. "2025" or "2024 — 2025" */
      year: z.string().optional(),
      /** e.g. "UX & UI Design" */
      role: z.string().optional(),
      /** e.g. ["Figma", "Photoshop"] */
      tools: z.array(z.string()).default([]),
      /** Card/page cover image, relative to this folder */
      cover: image(),
      coverAlt: z.string().optional(),
      /** Optional link to a live site / prototype */
      externalUrl: z.string().url().optional(),
      /** Lower number = shown first */
      order: z.number().default(99),
      /** Set false to hide from the landing page grid */
      featured: z.boolean().default(true),
      /** Set true to hide the project completely */
      draft: z.boolean().default(false),
    }),
});

export const collections = { projects };
