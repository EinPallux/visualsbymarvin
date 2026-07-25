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
    period: '2026 — Now',
    role: 'Graphic Designer | REMOTE',
    company: 'Adler Werbegeschenke, Saarbrücken, Germany',
    note: 'My business partner hired me as a graphic designer on the Customer Service Art Team effective April 1, 2026 (after I completed my studies). Here, I work on customer logos and prepare them for printing and production at our factory.',
  },
  {
    period: '2022 — 2026',
    role: 'Media Design - Dual Student | REMOTE',
    company: 'Adler Werbegeschenke, Saarbrücken, Germany',
    note: 'My internship partner during my college years, where I worked 20 hours a week during the academic term and 40 hours a week during internship periods. I was part of the marketing team as an in-house designer for: organic and paid social media ads, email ads',
  },
];

export const education: Station[] = [
  {
    period: '2022 — 2026',
    role: 'Student: B.A. Media Design | HYBRID',
    company: 'IU International University of Applied Sciences, Bad Honnef, Germany',
    note: 'Focus on UI/UX Design and Online & Social Media-Brandmanagement',
  },
];
