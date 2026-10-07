import type { Dict } from './types';

// Factual limit: every claim here already existed on the previous version of
// this site (see git history). Do not add metrics, users or titles.
export const en: Dict = {
  htmlLang: 'en',
  meta: {
    title: 'Guilherme Henrique — software engineering, systems, and AI',
    description:
      'Guilherme Henrique in Rio de Janeiro. Software engineering, systems, and AI, with work including Pexiscale and Lume and an emphasis on correctness, evidence, and experimentation.',
    ogLocale: 'en_US',
  },
  skip: 'Skip to content',
  nav: { label: 'Main', home: 'Home', resume: 'Résumé', courses: 'Courses', language: 'Language' },
  hero: {
    meta: ['Rio de Janeiro, Brazil', 'Software engineering / Systems / AI', 'Currently / Pexiscale + Lume'],
    blurb: 'I build software, systems, and experiments to solve real problems and explore new possibilities.',
    cta: 'View résumé',
    photoAlt: 'Guilherme Henrique taking a mirror photo in an elevator.',
  },
  statement: {
    label: '01 / Manifesto',
    mark: 'evidence',
    text: 'I build software, systems, and experiments, and I show the evidence behind them.',
    aside:
      'I work on transactional backends and on how data is represented in memory: areas where a wrong answer can cost money or trust. I use AI tools extensively and treat their output as unverified until a test, a measurement, or a query shows otherwise.',
  },
  lume: {
    label: '02 / Research',
    name: 'Lume',
    question:
      'Can software and data be represented using less memory and less data movement without sacrificing correctness?',
    body: 'An open research project with a C++20 core and a C baseline. First rule: no optimization claim without a measurement.',
    link: {
      href: 'https://github.com/guilhermehrcst/lume',
      text: 'github.com/guilhermehrcst/lume',
      note: 'Public. Formerly called PXIR.',
    },
    facts: [
      {
        title: "Verified, or it doesn't run",
        body: 'A verifier is the only way to obtain an executable program. The type system makes it impossible to execute unverified IR.',
      },
      {
        title: 'Hypothesis, measurement, outcome',
        body: 'Every milestone records all three, including the hypotheses that were falsified.',
      },
      {
        title: 'Sanitizers across three platforms',
        body: 'CI builds on Linux, macOS, and Windows and runs the tests under AddressSanitizer and UBSan.',
      },
    ],
    ledger: {
      evidenceLabel: 'Evidence',
      evidence:
        'Code, benchmarks, and a write-up for each milestone are public. In one benchmark, reusing a dead buffer cut page faults from 2,016 to 0 per call (1M elements, measured).',
      openLabel: 'Still open',
      open: 'Early-stage research. No production or universal performance claims; results apply to the stated workloads and machines.',
    },
    figure: {
      alt: 'Schematic: blocks of memory scattered across an address space are compacted into one contiguous region.',
      caption: 'Fig. 02 — Illustrative schematic, not real data. As the page scrolls, scattered allocations compact into a contiguous layout; blue marks data in motion.',
      states: ['scattered', 'compacting', 'contiguous'],
      axis: 'Address space →',
      legend: ['live', 'moving', 'dead, reclaimed'],
    },
  },
  pexiscale: {
    label: '03 / Product',
    name: 'Pexiscale',
    question: 'A multi-tenant platform for the day-to-day work of small and medium-sized businesses.',
    body: "Customers, catalog, inventory, quotes, and orders in one platform, with each company's data kept isolated. I design and build it.",
    link: { href: 'https://pexiscale.com', text: 'pexiscale.com', note: 'Live.' },
    facts: [
      {
        title: 'The server decides',
        body: 'PostgreSQL is the source of truth for commercial data. Prices, inventory, and order state are decided on the server. AI interprets requests and suggests actions; the commercial domain makes the final decision.',
      },
      {
        title: 'Isolation lives in the database',
        body: 'Every tenant-owned row carries an organization ID and is protected by row-level security, not by client-side filtering.',
      },
      {
        title: 'Guarded boundaries',
        body: 'Automated CI checks fail the build if the boundaries around legacy code, deployment, or marketing regress, or if secrets are committed.',
      },
    ],
    ledger: {
      evidenceLabel: 'Evidence',
      evidence:
        'Pull requests to the main branch go through a CI gate that includes boundary checks and secret scanning.',
      openLabel: 'Still open',
      open: 'Not every implemented capability is enabled in production. Some depend on provider approval and rollout, and I list a capability as live only once it is.',
    },
    figure: {
      alt: 'Abstract composition of a work interface: panels, lists, and a table whose rows are grouped by organization.',
      caption: 'Fig. 03 — Abstract composition, not a product screenshot. The modules come together; every row stays grouped with its organization.',
    },
  },
  principles: {
    label: '04 / Method',
    items: [
      {
        title: 'Correctness',
        body: 'Where a wrong answer can cost money or trust, the server decides. The client asks; the domain answers.',
      },
      {
        title: 'Simplicity',
        body: 'The smallest architecture that remains correct, observable, and recoverable. Fewer moving parts, fewer places for things to go wrong.',
      },
      {
        title: 'Evidence',
        body: 'Everything is treated as unverified until a test, a measurement, or a query shows otherwise, including what AI tools produce. Falsified hypotheses stay on the record.',
      },
    ],
  },
  about: {
    label: '05 / About',
    heading: 'Self-taught engineer in Rio de Janeiro.',
    body: 'I work at the intersection of software engineering, systems, and AI. I build products and run experiments on how computation and data are represented. I design and build Pexiscale, and I research memory and data movement in Lume.',
    also: 'I also build the order and payment backend for Paulex, my retail brand. Orders are created only on the server, and a retried request never creates a second order. The repository is private.',
    cta: 'View résumé',
  },
  contact: {
    label: '06 / Contact',
    heading: 'Contact',
    items: [
      { icon: 'email', label: 'Email', value: 'guilhermehrcst@gmail.com', href: 'mailto:guilhermehrcst@gmail.com' },
      { icon: 'linkedin', label: 'LinkedIn', value: 'Guilherme Henrique', href: 'https://www.linkedin.com/in/guilherme-henrique-8927093b6' },
      { icon: 'github', label: 'GitHub', value: 'guilhermehrcst', href: 'https://github.com/guilhermehrcst' },
      { icon: 'instagram', label: 'Instagram', value: '@guilhermehrcst', href: 'https://www.instagram.com/guilhermehrcst/' },
    ],
  },
  footer: { place: 'Rio de Janeiro, Brazil', updated: 'Last updated October 6, 2026', top: 'Back to top' },
  shell: {
    resume: {
      title: 'Résumé — Guilherme Henrique',
      description: "Guilherme Henrique's résumé. In preparation.",
      heading: 'Résumé',
      body: 'In preparation. The full résumé will be published on this page.',
    },
    courses: {
      title: 'Courses — Guilherme Henrique',
      description: 'A curated selection of free courses. In preparation.',
      heading: 'Courses',
      body: 'In preparation. This page will feature a curated selection of free courses, with direct links to the platforms where they are available.',
    },
    back: 'Back to home',
  },
};
