import type { Dict } from './types';

// Factual limit: every claim here already existed on the previous version of
// this site (see git history), or, for the résumé, was supplied by Guilherme
// for it (the migration and Edge Function counts, the M7 result, education and
// coursework). Do not add metrics, users, clients, titles or levels.
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
  resume: {
    meta: {
      title: 'Résumé — Guilherme Henrique',
      description:
        'Résumé of Guilherme Henrique, a software engineer in Rio de Janeiro working on backend, systems, and AI: selected work on Pexiscale, Lume, and Paulex, capabilities, education, and coursework.',
    },
    heading: 'Résumé',
    print: 'Print résumé',
    whoami: {
      role: 'Software Engineer | Backend, Systems & AI',
      place: 'Rio de Janeiro, Brazil',
      summary:
        'Software engineer, largely self-taught, with hands-on experience in backend, systems, databases, security, and building products. I build end-to-end applications with TypeScript, React, and PostgreSQL, and explore systems programming and performance in C++. My work covers multi-tenant architecture, authorization, transactions, concurrency, idempotency, automated testing, and CI/CD. I use AI as a structured part of the engineering process and validate its output with tests, measurements, and evidence.',
    },
    work: {
      title: 'Selected work',
      note: 'Independent projects I design and build. Not formal employment.',
      pexiscale: {
        name: 'Pexiscale',
        kind: 'Multi-tenant SaaS / Product engineering',
        stack: 'TypeScript / React / PostgreSQL / Supabase',
        points: [
          'Designed a multi-tenant SaaS architecture with PostgreSQL, RLS, RBAC, and server-side authorization, keeping organizations isolated and authentication explicitly separate from authorization.',
          'Evolved the database through more than 100 PostgreSQL migrations, working on integrity, transactions, concurrency, idempotency, and the contracts between application and database.',
          'Built about 25 Edge Functions and server-side flows for billing and subscriptions with Stripe, integrations, and AI-assisted features.',
          'Automated CI checks for migrations, architectural boundaries, secret leaks, client/database contracts, deploy topology, security, and performance budgets.',
        ],
        figures: [
          { value: '100+', label: 'PostgreSQL migrations' },
          { value: '~25', label: 'Edge Functions' },
        ],
        link: { href: 'https://pexiscale.com', text: 'pexiscale.com' },
      },
      lume: {
        name: 'Lume',
        kind: 'Open-source experimental systems research',
        stack: 'C++20 / CMake / GCC / Clang',
        description: 'Experimental systems research platform with a typed IR, focused on representation, memory, data movement and efficient execution.',
        points: [
          'Investigated how memory layout, buffer reuse, and operation fusion change data movement, measuring each hypothesis with benchmarks.',
          'Built the core in C++20 with correctness enforced by a verifier: unverified IR cannot be executed.',
          'Validated the code in CI across Linux, macOS and Windows, with AddressSanitizer and UBSan running on Ubuntu/GCC.',
        ],
        link: { href: 'https://github.com/guilhermehrcst/lume', text: 'github.com/guilhermehrcst/lume' },
        method: {
          label: 'Every result is labeled',
          items: [
            { term: 'Measured', definition: 'Observed in a benchmark.' },
            { term: 'Inferred', definition: 'Derived from measurements, not measured directly.' },
            { term: 'Falsified', definition: 'A hypothesis the data rejected.' },
            { term: 'Not yet known', definition: 'Open. No claim is made.' },
          ],
        },
        experiment: {
          label: 'Controlled experiment / M7',
          movement: { value: '24 → 16', label: 'bytes per element, logical data-movement model' },
          time: { value: '≈0.79–0.82×', label: 'measured time relative to the baseline' },
          text: 'In the controlled workload of experiment M7, fusion reduced the logical data-movement model from 24 to 16 bytes per element; measured execution time was about 0.79–0.82× that of the baseline. A result for that workload, not a general claim.',
        },
      },
      paulex: {
        name: 'Paulex',
        kind: 'E-commerce / Retail product engineering',
        stack: 'React / TypeScript / PostgreSQL / Supabase / Vitest / Playwright',
        domains: ['Catalog', 'Inventory', 'Orders', 'Reservations', 'Payments', 'Webhooks'],
        points: [
          'Built an e-commerce system covering catalog, inventory, orders, reservations, payments, coupons, authentication, and an admin panel.',
          'Implemented concurrent PostgreSQL tests for scenarios including two sessions competing for stock, simultaneous purchase of the last unit and concurrent updates to pricing structures.',
          'Structured payments so the backend remains the authority on amounts: orders are created only on the server, requests are idempotent, and confirmation arrives asynchronously by webhook.',
          'Automated tests with Vitest, Playwright, SQL, and GitHub Actions.',
        ],
        note: 'Private repository.',
        figure: { value: '60+', label: 'PostgreSQL migrations' },
      },
    },
    capabilities: {
      title: 'Capabilities',
      groups: [
        { title: 'Languages', items: ['TypeScript', 'JavaScript', 'SQL', 'C++', 'HTML', 'CSS'] },
        {
          title: 'Backend & data',
          items: ['PostgreSQL', 'Supabase', 'Edge Functions', 'APIs', 'Database modeling', 'Migrations', 'Transactions', 'Concurrency', 'Idempotency', 'Row Level Security', 'RBAC', 'Authentication', 'Authorization'],
        },
        { title: 'Frontend & product', items: ['React', 'Vite', 'TypeScript', 'Interface development', 'Product engineering'] },
        {
          title: 'Testing & infrastructure',
          items: ['Git', 'GitHub', 'GitHub Actions', 'CI/CD', 'Vitest', 'Playwright', 'Integration testing', 'SQL testing', 'CMake', 'GCC', 'Clang', 'ASan', 'UBSan'],
        },
        {
          title: 'Systems & performance',
          items: ['C++', 'Memory', 'Buffers', 'Data movement', 'Performance engineering', 'Benchmarking', 'Intermediate representations', 'Experimental methodology'],
        },
      ],
    },
    ai: {
      title: 'AI-assisted software engineering',
      body: 'I choose models and agents according to the task: architecture, specification, assisted implementation, review, debugging, testing, security analysis, technical research, benchmarks, and refactoring. AI output is treated as unverified until code, tests, measurements, or technical review support it.',
      flowLabel: 'Workflow',
      flow: ['Specify', 'Implement', 'Verify', 'Measure'],
      models: { label: 'Models and assistants', items: ['ChatGPT', 'Claude', 'Gemini', 'DeepSeek'] },
      agents: { label: 'Agents and platforms', items: ['Claude Code', 'Codex', 'Google Antigravity', 'Hermes Agent'] },
    },
    education: {
      title: 'Education',
      items: [
        { institution: 'unisuam', school: 'UNISUAM', program: 'Systems Analysis and Development', status: 'Undergraduate program, started and not completed' },
        { institution: 'marques-rodrigues', school: 'Colégio Marques Rodrigues', program: 'High school', status: 'Completed' },
        { institution: 'joao-paulo', school: 'Jardim Escola João Paulo de Bangu', program: 'First and second years of high school', status: 'First exposure to information technology' },
      ],
    },
    coursework: {
      title: 'Coursework',
      items: [
        { institution: 'harvard', school: 'Harvard University', program: 'CS50: Introduction to Computer Science', status: 'Part of the course material completed' },
        { institution: 'bradesco', school: 'Fundação Bradesco', program: 'Information technology studies' },
      ],
    },
    influences: {
      title: 'Influences',
      intro: 'References that shape how I think about technology, product, systems, engineering and long-term building.',
      descriptions: {
        jensen: 'Systems thinking, computing and long-term execution.',
        elon: 'Ambitious engineering, first principles and future-oriented building.',
        mark: 'Product, platforms and building at scale.',
        steve: 'Product, design, simplicity and integration between technology and experience.',
        'larry-sergey': 'Information, systems, search and building at global scale.',
      },
      quote: 'References are not models to copy. They are lenses that expand what I consider possible to build.',
    },
  },
  courses: {
    meta: {
      title: 'Free courses in technology, programming and AI | Guilherme Henrique',
      description:
        'A curated selection of free courses from Harvard, MIT, FGV, Microsoft, Fundação Bradesco and Cisco to learn programming, artificial intelligence, data and technology.',
    },
    eyebrow: ['Curation', 'Education', '2026'],
    heading: 'free-courses-to-actually-learn',
    intro:
      'A curated selection of free courses in programming, artificial intelligence, data and technology. Chosen for people who want to learn properly, build projects and grow professionally.',
    nav: {
      label: 'Course categories',
      jump: 'Jump to',
      items: { all: 'All', programming: 'Programming', ai: 'AI', data: 'Data', systems: 'Systems', security: 'Cybersecurity' },
    },
    anchors: { all: 'catalogue', data: 'data-science' },
    sections: {
      build: {
        title: 'learn-and-build',
        intro: 'Solid foundations to start programming, understand computers and turn ideas into software.',
      },
      data: {
        title: 'data-and-intelligence',
        intro: 'Explore artificial intelligence, data science and new ways of working with information.',
      },
      systems: {
        title: 'understand-the-systems',
        intro: 'Algorithms, databases and mathematics to understand what lies beneath the interfaces.',
      },
      security: {
        title: 'protect-and-connect',
        intro: 'Security, infrastructure and the essential foundations for building more reliable systems.',
      },
    },
    categories: {
      cs: 'Computer Science',
      python: 'Python',
      web: 'Web',
      webdev: 'Web Development',
      ai: 'Artificial Intelligence',
      genai: 'Generative AI',
      datasci: 'Data Science',
      'data-computing': 'Data and Computing',
      databases: 'Databases',
      algorithms: 'Algorithms',
      'math-cs': 'Mathematics and Computing',
      math: 'Mathematics',
      cybersecurity: 'Cybersecurity',
      security: 'Security',
      privacy: 'Privacy and Security',
      'cloud-ai': 'Cloud and AI',
    },
    levels: { beginner: 'Beginner', 'beginner-intermediate': 'Beginner to intermediate', intermediate: 'Intermediate' },
    languages: { en: 'English', pt: 'Portuguese' },
    certificates: {
      none: 'No certificate',
      statement: 'Completion statement',
      available: 'Certificate available',
    },
    units: { hours: 'h', weeks: 'weeks' },
    labels: {
      category: 'Category',
      level: 'Level',
      language: 'Language',
      certificate: 'Certificate',
      duration: 'Length',
      courses: 'courses',
      curated: 'Curator’s pick',
      cta: 'Go to course',
      newTab: 'opens the official site in a new tab',
    },
    closing: {
      title: 'keep-learning',
      body: 'This selection changes over time. New courses come in only when they truly deserve a place here.',
      prompt: 'Found an excellent free course?',
      cta: 'Suggest a course',
    },
  },
};
