/**
 * EXPERIENCE & EDUCATION (About page)
 * ------------------------------------------------------------
 * ✏️ EDIT HERE: replace the [placeholder] entries with your real
 *    stations — newest first, like on LinkedIn.
 *    Delete or copy blocks as needed.
 */

export type Station = {
  period: string;
  role: string;
  company: string;
  note?: string;
};

export const experience: Station[] = [
  {
    period: '2025 — Now',
    role: 'Junior Creative Designer',
    company: 'Freelance & self-initiated',
    note: 'Concept and client work: brand visuals, landing pages and app case studies.',
  },
  {
    period: '2024 — 2025',
    role: 'Design Intern',
    company: '[Company Name], [City]',
    note: 'Supported the team with social media assets, presentations and first UI tasks.',
  },
  {
    period: '2023 — 2024',
    role: 'Working Student — Marketing & Design',
    company: '[Company Name], [City]',
    note: 'Created campaign visuals and learned the day-to-day of a design team.',
  },
];

export const education: Station[] = [
  {
    period: '2022 — 2025',
    role: 'B.A. Media & Communication Design',
    company: '[University / College], [City]',
    note: 'Focus on digital product design and branding.',
  },
];
