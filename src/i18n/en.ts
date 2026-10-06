import type { Dict } from './types';

// Factual limit: every claim here already existed on the previous version of
// this site (see git history). Do not add metrics, users or titles.
export const en: Dict = {
  htmlLang: 'en',
  meta: {
    title: 'Guilherme Henrique — software engineering, systems, AI',
    description:
      'Guilherme Henrique, Rio de Janeiro. Software engineering, systems and AI: Pexiscale and Lume, with the evidence for each claim.',
    ogLocale: 'en_US',
  },
  skip: 'Skip to content',
  nav: { label: 'Main', home: 'Home', resume: 'Résumé', courses: 'Courses', language: 'Language' },
  hero: {
    meta: ['Rio de Janeiro, Brazil', 'Software engineering / Systems / AI', 'Now / Pexiscale + Lume'],
    blurb: 'I build software, systems and experiments to solve real problems and explore new possibilities.',
    cta: 'View résumé',
    photoAlt: 'Guilherme Henrique in an olive work jacket, with a black backpack, taking a photo of himself in a mirror.',
  },
  statement: {
    label: '01 / Statement',
    text: 'I build software, systems and experiments, and I show the evidence.',
    aside:
      'I work on transactional backends and on how data is represented in memory: places where a wrong answer costs money or trust. I use AI tools heavily and treat what they produce as unverified until a test, a measurement or a query says otherwise.',
  },
  lume: {
    label: '02 / Research',
    name: 'Lume',
    question:
      'Can software and data be represented with less memory and less data movement, without losing correctness?',
    body: 'An open research project. C++20 core with a C baseline. The first rule: no optimization claim without a measurement.',
    link: {
      href: 'https://github.com/guilhermehrcst/lume',
      text: 'github.com/guilhermehrcst/lume',
      note: 'Public. Formerly named PXIR.',
    },
    facts: [
      {
        title: 'Verified, or not runnable',
        body: 'A verifier is the only way to obtain an executable program. The type system makes running unverified IR impossible to write.',
      },
      {
        title: 'Hypothesis, measurement, outcome',
        body: 'Each milestone states all three, including the hypotheses that were falsified.',
      },
      {
        title: 'Sanitized on three platforms',
        body: 'CI builds on Linux, macOS and Windows, and runs the tests under AddressSanitizer and UBSan.',
      },
    ],
    ledger: {
      evidenceLabel: 'Evidence',
      evidence:
        'Code, benchmarks and a write-up per milestone are public. In one benchmark, reusing a dead buffer cut page faults from 2,016 to 0 per call (1M elements, measured).',
      openLabel: 'Still open',
      open: 'Early research. No production or universal performance claims; results hold for the stated workloads and machines.',
    },
    figure: {
      alt: 'Schematic: blocks of memory scattered across an address space are compacted into one contiguous region.',
      caption: 'Fig. 02 — Schematic, not data. Scattered allocations compact into a contiguous layout as the page scrolls; blue marks data in motion.',
      states: ['scattered', 'compacting', 'contiguous'],
      axis: 'Address space →',
      legend: ['live', 'moving', 'dead, reclaimed'],
    },
  },
  pexiscale: {
    label: '03 / Product',
    name: 'Pexiscale',
    question: 'A multi-tenant platform for the everyday work of small and medium businesses.',
    body: "Customers, catalog, inventory, quotes and orders on one platform, where each company's data stays its own. I design and build it.",
    link: { href: 'https://pexiscale.com', text: 'pexiscale.com', note: 'Live.' },
    facts: [
      {
        title: 'The server decides',
        body: 'PostgreSQL is the source of commercial truth. Price, stock and order state are decided on the server. AI interprets a request and suggests; the commercial domain decides.',
      },
      {
        title: 'Isolation lives in the database',
        body: 'Every tenant-owned row carries an organization id and is protected by row-level security, not by filtering in the client.',
      },
      {
        title: 'Guarded boundaries',
        body: 'Scripted CI guards fail the build when the legacy, deploy or marketing boundaries regress, and when secrets are committed.',
      },
    ],
    ledger: {
      evidenceLabel: 'Evidence',
      evidence:
        'Pull requests into the main branch go through a CI gate that includes boundary and secret-scanning guards.',
      openLabel: 'Still open',
      open: 'Not every implemented capability is switched on in production. Some depend on provider approval and rollout, and I list a capability as live only when it is.',
    },
    figure: {
      alt: 'Abstract composition of a work interface: panels, lists and a table whose rows are grouped by organization.',
      caption: 'Fig. 03 — Abstract composition, not a product screenshot. Modules assemble; every row stays with its organization.',
    },
  },
  principles: {
    label: '04 / Method',
    items: [
      {
        title: 'Correctness',
        body: 'Where a wrong answer costs money or trust, the server decides. The client asks; the domain answers.',
      },
      {
        title: 'Simplicity',
        body: 'The smallest design that stays correct, observable and recoverable. Fewer moving parts, fewer places to be wrong.',
      },
      {
        title: 'Evidence',
        body: 'Unverified until a test, a measurement or a query says otherwise — including what AI tools produce. Falsified hypotheses stay on the record.',
      },
    ],
  },
  about: {
    label: '05 / About',
    heading: 'Self-taught engineer in Rio de Janeiro.',
    body: 'I work across software engineering, systems and AI: building products, and running experiments on how computation and data are represented. I design and build Pexiscale, and I research memory and data movement in Lume.',
    also: 'Also: Paulex, the order and payment backend for my retail brand. Orders are created only on the server, and a retried request never creates a second order. The repository is private.',
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
  footer: { place: 'Rio de Janeiro, Brazil', updated: 'Last updated 2026-10-06', top: 'Back to top' },
  shell: {
    resume: {
      title: 'Résumé — Guilherme Henrique',
      description: 'Résumé of Guilherme Henrique. In preparation.',
      heading: 'Résumé',
      body: 'In preparation. The full résumé will be published on this page.',
    },
    courses: {
      title: 'Courses — Guilherme Henrique',
      description: 'A curated list of free courses. In preparation.',
      heading: 'Courses',
      body: 'In preparation. A curated list of free courses, each linking to where it is published.',
    },
    back: 'Back to home',
  },
};
