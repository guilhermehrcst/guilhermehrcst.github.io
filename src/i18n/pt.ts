import type { Dict } from './types';

// Limite factual: tudo aqui já existia na versão anterior do site (ver o
// histórico do git) ou, no currículo, foi fornecido pelo Guilherme para ele
// (contagem de migrations e Edge Functions, resultado do M7, formação e cursos).
// Não adicionar métricas, usuários, clientes, cargos nem níveis.
export const pt: Dict = {
  htmlLang: 'pt-BR',
  meta: {
    title: 'Guilherme Henrique — engenharia de software, sistemas e IA',
    description:
      'Guilherme Henrique, no Rio de Janeiro. Engenharia de software, sistemas e IA, com trabalhos como Pexiscale e Lume e foco em correção, evidência e experimentação.',
    ogLocale: 'pt_BR',
  },
  skip: 'Pular para o conteúdo',
  nav: { label: 'Principal', home: 'Início', resume: 'Currículo', courses: 'Cursos', language: 'Idioma' },
  hero: {
    meta: ['Rio de Janeiro, Brasil', 'Engenharia de software / Sistemas / IA', 'Agora / Pexiscale + Lume'],
    blurb: 'Construo software, sistemas e experimentos para resolver problemas reais e explorar novas possibilidades.',
    cta: 'Ver currículo',
    photoAlt: 'Guilherme Henrique tirando uma foto no espelho de um elevador.',
  },
  statement: {
    label: '01 / Manifesto',
    mark: 'evidências',
    text: 'Construo software, sistemas e experimentos e mostro as evidências.',
    aside:
      'Trabalho com backends transacionais e com a forma como os dados são representados na memória: áreas em que uma resposta errada pode custar dinheiro ou confiança. Uso ferramentas de IA extensivamente e trato as respostas delas como não verificadas até que um teste, uma medição ou uma consulta mostre o contrário.',
  },
  lume: {
    label: '02 / Pesquisa',
    name: 'Lume',
    question:
      'É possível representar software e dados usando menos memória e menos movimentação de dados, sem abrir mão da correção?',
    body: 'Um projeto de pesquisa aberto, com núcleo em C++20 e uma baseline em C. Primeira regra: nenhuma afirmação de otimização sem medição.',
    link: {
      href: 'https://github.com/guilhermehrcst/lume',
      text: 'github.com/guilhermehrcst/lume',
      note: 'Público. Antes chamado PXIR.',
    },
    facts: [
      {
        title: 'Verificado ou não executa',
        body: 'Um verificador é o único caminho para obter um programa executável. O sistema de tipos torna impossível executar uma IR que não tenha sido verificada.',
      },
      {
        title: 'Hipótese, medição, resultado',
        body: 'Cada marco registra os três, inclusive as hipóteses que foram refutadas.',
      },
      {
        title: 'Sanitizers em três plataformas',
        body: 'O CI compila no Linux, no macOS e no Windows e roda os testes com AddressSanitizer e UBSan.',
      },
    ],
    ledger: {
      evidenceLabel: 'Evidência',
      evidence:
        'O código, os benchmarks e um relatório de cada marco são públicos. Em um benchmark, reaproveitar um buffer morto reduziu os page faults de 2.016 para 0 por chamada (1 milhão de elementos, medido).',
      openLabel: 'Em aberto',
      open: 'Pesquisa em estágio inicial. Nenhuma afirmação de desempenho em produção ou de validade universal; os resultados valem para as cargas de trabalho e as máquinas descritas.',
    },
    figure: {
      alt: 'Esquema: blocos de memória espalhados por um espaço de endereçamento são compactados em uma única região contígua.',
      caption: 'Fig. 02 — Esquema ilustrativo, não dados reais. Conforme a página rola, as alocações espalhadas se compactam em um layout contíguo; o azul indica dados em movimento.',
      states: ['espalhado', 'compactando', 'contíguo'],
      axis: 'Espaço de endereçamento →',
      legend: ['vivo', 'em movimento', 'morto, recuperado'],
    },
  },
  pexiscale: {
    label: '03 / Produto',
    name: 'Pexiscale',
    question: 'Uma plataforma multi-tenant para o trabalho do dia a dia de pequenas e médias empresas.',
    body: 'Clientes, catálogo, estoque, orçamentos e pedidos em uma única plataforma, com os dados de cada empresa mantidos isolados. Eu projeto e desenvolvo a plataforma.',
    link: { href: 'https://pexiscale.com', text: 'pexiscale.com', note: 'No ar.' },
    facts: [
      {
        title: 'Quem decide é o servidor',
        body: 'O PostgreSQL é a fonte de verdade dos dados comerciais. Preços, estoque e estado dos pedidos são decididos no servidor. A IA interpreta solicitações e sugere ações; a decisão final cabe ao domínio comercial.',
      },
      {
        title: 'O isolamento fica no banco',
        body: 'Toda linha que pertence a uma empresa carrega o ID da organização e é protegida por row-level security, não por filtros no cliente.',
      },
      {
        title: 'Fronteiras protegidas',
        body: 'Verificações automatizadas de CI fazem o build falhar se houver regressão nas fronteiras de código legado, deploy ou marketing, ou se segredos forem commitados.',
      },
    ],
    ledger: {
      evidenceLabel: 'Evidência',
      evidence:
        'Pull requests para a branch principal passam por um gate de CI que inclui verificações de fronteira e varredura de segredos.',
      openLabel: 'Em aberto',
      open: 'Nem toda funcionalidade implementada está ativa em produção. Algumas dependem de aprovação de provedores e de rollout, e só apresento uma funcionalidade como ativa quando ela de fato está.',
    },
    figure: {
      alt: 'Composição abstrata de uma interface de trabalho: painéis, listas e uma tabela com as linhas agrupadas por organização.',
      caption: 'Fig. 03 — Composição abstrata, não uma captura de tela do produto. Os módulos se encaixam; cada linha permanece agrupada com a sua organização.',
    },
  },
  principles: {
    label: '04 / Método',
    items: [
      {
        title: 'Correção',
        body: 'Onde uma resposta errada pode custar dinheiro ou confiança, quem decide é o servidor. O cliente pergunta; o domínio responde.',
      },
      {
        title: 'Simplicidade',
        body: 'A menor arquitetura que continua correta, observável e recuperável. Menos partes móveis, menos lugares para errar.',
      },
      {
        title: 'Evidência',
        body: 'Tudo é tratado como não verificado até que um teste, uma medição ou uma consulta mostre o contrário, inclusive o que as ferramentas de IA produzem. Hipóteses refutadas continuam registradas.',
      },
    ],
  },
  about: {
    label: '05 / Sobre',
    heading: 'Engenheiro autodidata no Rio de Janeiro.',
    body: 'Atuo na interseção entre engenharia de software, sistemas e IA. Construo produtos e faço experimentos sobre como computação e dados são representados. Projeto e desenvolvo o Pexiscale e pesquiso memória e movimentação de dados no Lume.',
    also: 'Também desenvolvo o backend de pedidos e pagamentos da Paulex, minha marca de varejo. Os pedidos são criados apenas no servidor, e uma requisição repetida nunca gera um segundo pedido. O repositório é privado.',
    cta: 'Ver currículo',
  },
  contact: {
    label: '06 / Contato',
    heading: 'Contato',
    items: [
      { icon: 'email', label: 'E-mail', value: 'guilhermehrcst@gmail.com', href: 'mailto:guilhermehrcst@gmail.com' },
      { icon: 'linkedin', label: 'LinkedIn', value: 'Guilherme Henrique', href: 'https://www.linkedin.com/in/guilherme-henrique-8927093b6' },
      { icon: 'github', label: 'GitHub', value: 'guilhermehrcst', href: 'https://github.com/guilhermehrcst' },
      { icon: 'instagram', label: 'Instagram', value: '@guilhermehrcst', href: 'https://www.instagram.com/guilhermehrcst/' },
    ],
  },
  footer: { place: 'Rio de Janeiro, Brasil', updated: 'Atualizado em 6 de outubro de 2026', top: 'Voltar ao topo' },
  resume: {
    meta: {
      title: 'Currículo — Guilherme Henrique',
      description:
        'Currículo de Guilherme Henrique, engenheiro de software no Rio de Janeiro com atuação em backend, sistemas e IA: trabalhos selecionados em Pexiscale, Lume e Paulex, competências, formação e cursos.',
    },
    heading: 'Currículo',
    print: 'Imprimir currículo',
    whoami: {
      role: 'Engenheiro de Software | Backend, Sistemas e IA',
      place: 'Rio de Janeiro, Brasil',
      summary:
        'Engenheiro de software com trajetória predominantemente autodidata e experiência prática em backend, sistemas, bancos de dados, segurança e construção de produtos. Desenvolvo aplicações de ponta a ponta com TypeScript, React e PostgreSQL e exploro programação de sistemas e desempenho com C++. Trabalho com arquitetura multi-tenant, autorização, transações, concorrência, idempotência, testes automatizados e CI/CD. Uso IA de forma estruturada no processo de engenharia e valido o resultado com testes, medições e evidências.',
    },
    work: {
      title: 'Trabalhos selecionados',
      note: 'Projetos independentes que projeto e desenvolvo. Não são vínculos empregatícios.',
      pexiscale: {
        name: 'Pexiscale',
        kind: 'SaaS multi-tenant / Engenharia de produto',
        stack: 'TypeScript / React / PostgreSQL / Supabase',
        points: [
          'Projetei uma arquitetura SaaS multi-tenant com PostgreSQL, RLS, RBAC e autorização server-side, mantendo o isolamento entre organizações e a separação explícita entre autenticação e autorização.',
          'Evoluí o banco de dados por meio de mais de 100 migrations PostgreSQL, trabalhando com integridade, transações, concorrência, idempotência e os contratos entre aplicação e banco.',
          'Desenvolvi cerca de 25 Edge Functions e fluxos server-side para billing e assinaturas com Stripe, integrações e funcionalidades assistidas por IA.',
          'Automatizei verificações de CI para migrations, fronteiras arquiteturais, vazamento de secrets, contratos entre cliente e banco, topologia de deploy, segurança e performance budgets.',
        ],
        figures: [
          { value: '100+', label: 'migrations PostgreSQL' },
          { value: '~25', label: 'Edge Functions' },
        ],
        link: { href: 'https://pexiscale.com', text: 'pexiscale.com' },
      },
      lume: {
        name: 'Lume',
        kind: 'Pesquisa experimental em sistemas, open source',
        stack: 'C++20 / CMake / GCC / Clang',
        description: 'Plataforma experimental de pesquisa em sistemas, com IR tipada e foco em representação, memória, movimentação de dados e execução eficiente.',
        points: [
          'Investiguei como layout de memória, reaproveitamento de buffers e fusão de operações alteram a movimentação de dados, medindo cada hipótese com benchmarks.',
          'Desenvolvi o núcleo em C++20, com a correção garantida por um verificador: uma IR não verificada não pode ser executada.',
          'Validei o código em CI no Linux, macOS e Windows, com AddressSanitizer e UBSan em Ubuntu/GCC.',
        ],
        link: { href: 'https://github.com/guilhermehrcst/lume', text: 'github.com/guilhermehrcst/lume' },
        method: {
          label: 'Todo resultado é classificado',
          items: [
            { term: 'Medido', definition: 'Observado em um benchmark.' },
            { term: 'Inferido', definition: 'Derivado de medições, sem medição direta.' },
            { term: 'Refutado', definition: 'Hipótese rejeitada pelos dados.' },
            { term: 'Ainda desconhecido', definition: 'Em aberto. Nenhuma afirmação é feita.' },
          ],
        },
        experiment: {
          label: 'Experimento controlado / M7',
          movement: { value: '24 → 16', label: 'bytes por elemento, modelo lógico de movimentação de dados' },
          time: { value: '≈0,79–0,82×', label: 'tempo medido em relação ao baseline' },
          text: 'No workload controlado do experimento M7, a fusão reduziu o modelo lógico de movimentação de dados de 24 para 16 bytes por elemento; a execução medida ficou em aproximadamente 0,79–0,82× o tempo do baseline. Um resultado desse workload, não uma afirmação geral.',
        },
      },
      paulex: {
        name: 'Paulex',
        kind: 'E-commerce / Engenharia de produto para varejo',
        stack: 'React / TypeScript / PostgreSQL / Supabase / Vitest / Playwright',
        domains: ['Catálogo', 'Estoque', 'Pedidos', 'Reservas', 'Pagamentos', 'Webhooks'],
        points: [
          'Desenvolvi um sistema de e-commerce que cobre catálogo, estoque, pedidos, reservas, pagamentos, cupons, autenticação e painel administrativo.',
          'Implementei testes concorrentes em PostgreSQL para cenários como duas sessões disputando estoque, compra simultânea da última unidade e alterações concorrentes em estruturas de preços.',
          'Estruturei os pagamentos para manter o backend como autoridade sobre os valores: os pedidos são criados apenas no servidor, as requisições são idempotentes e a confirmação chega de forma assíncrona por webhook.',
          'Automatizei testes com Vitest, Playwright, SQL e GitHub Actions.',
        ],
        note: 'Repositório privado.',
        figure: { value: '60+', label: 'migrations PostgreSQL' },
      },
    },
    capabilities: {
      title: 'Competências',
      groups: [
        { title: 'Linguagens', items: ['TypeScript', 'JavaScript', 'SQL', 'C++', 'HTML', 'CSS'] },
        {
          title: 'Backend e dados',
          items: ['PostgreSQL', 'Supabase', 'Edge Functions', 'APIs', 'Modelagem de bancos de dados', 'Migrations', 'Transações', 'Concorrência', 'Idempotência', 'Row Level Security', 'RBAC', 'Autenticação', 'Autorização'],
        },
        { title: 'Frontend e produto', items: ['React', 'Vite', 'TypeScript', 'Desenvolvimento de interfaces', 'Engenharia de produto'] },
        {
          title: 'Testes e infraestrutura',
          items: ['Git', 'GitHub', 'GitHub Actions', 'CI/CD', 'Vitest', 'Playwright', 'Testes de integração', 'Testes em SQL', 'CMake', 'GCC', 'Clang', 'ASan', 'UBSan'],
        },
        {
          title: 'Sistemas e desempenho',
          items: ['C++', 'Memória', 'Buffers', 'Movimentação de dados', 'Engenharia de desempenho', 'Benchmarking', 'Representações intermediárias', 'Metodologia experimental'],
        },
      ],
    },
    ai: {
      title: 'Engenharia assistida por IA',
      body: 'Uso diferentes modelos e agentes conforme a natureza da tarefa: arquitetura, especificação, implementação assistida, revisão, debugging, testes, análise de segurança, pesquisa técnica, benchmarks e refatoração. Saídas produzidas por IA são tratadas como não verificadas até serem sustentadas por código, testes, medições ou revisão técnica.',
      flowLabel: 'Fluxo de trabalho',
      flow: ['Especificar', 'Implementar', 'Verificar', 'Medir'],
      models: { label: 'Modelos e assistentes', items: ['ChatGPT', 'Claude', 'Gemini', 'DeepSeek'] },
      agents: { label: 'Agentes e plataformas', items: ['Claude Code', 'Codex', 'Google Antigravity', 'Hermes Agent'] },
    },
    education: {
      title: 'Formação',
      items: [
        { institution: 'unisuam', school: 'UNISUAM', program: 'Análise e Desenvolvimento de Sistemas', status: 'Graduação iniciada, não concluída' },
        { institution: 'marques-rodrigues', school: 'Colégio Marques Rodrigues', program: 'Ensino médio', status: 'Concluído' },
        { institution: 'joao-paulo', school: 'Jardim Escola João Paulo de Bangu', program: '1º e 2º anos do ensino médio', status: 'Primeiro contato com tecnologia da informação' },
      ],
    },
    coursework: {
      title: 'Cursos e estudos',
      items: [
        { institution: 'harvard', school: 'Harvard University', program: 'CS50: Introduction to Computer Science', status: 'Conteúdo cursado parcialmente' },
        { institution: 'bradesco', school: 'Fundação Bradesco', program: 'Estudos em tecnologia da informação' },
      ],
    },
    influences: {
      title: 'Inspirações',
      intro: 'Referências que influenciam como penso sobre tecnologia, produto, sistemas, engenharia e construção de longo prazo.',
      descriptions: {
        jensen: 'Visão sistêmica, computação e execução de longo prazo.',
        elon: 'Engenharia ambiciosa, primeiros princípios e construção orientada ao futuro.',
        mark: 'Produto, plataformas e construção em escala.',
        steve: 'Produto, design, simplicidade e integração entre tecnologia e experiência.',
        'larry-sergey': 'Informação, sistemas, pesquisa e construção em escala global.',
      },
      quote: 'Referências não são modelos para copiar. São lentes para expandir o que considero possível construir.',
    },
  },
  courses: {
    meta: {
      title: 'Cursos gratuitos de tecnologia, programação e IA | Guilherme Henrique',
      description:
        'Uma curadoria de cursos gratuitos de Harvard, MIT, FGV, Microsoft, Fundação Bradesco e Cisco para aprender programação, inteligência artificial, dados e tecnologia.',
    },
    eyebrow: ['Curadoria', 'Educação', '2026'],
    heading: 'cursos-gratuitos-para-aprender-de-verdade',
    intro:
      'Uma curadoria de cursos gratuitos em programação, inteligência artificial, dados e tecnologia. Selecionados para quem quer aprender melhor, construir projetos e evoluir profissionalmente.',
    nav: {
      label: 'Categorias de cursos',
      jump: 'Ir para',
      items: { all: 'Todos', programming: 'Programação', ai: 'IA', data: 'Dados', systems: 'Sistemas', security: 'Cibersegurança' },
    },
    anchors: { all: 'catalogo', data: 'ciencia-de-dados' },
    sections: {
      build: {
        title: 'aprender-e-construir',
        intro: 'Fundamentos sólidos para começar a programar, entender computadores e transformar ideias em software.',
      },
      data: {
        title: 'dados-e-inteligencia',
        intro: 'Explore inteligência artificial, ciência de dados e novas formas de trabalhar com informação.',
      },
      systems: {
        title: 'entender-os-sistemas',
        intro: 'Algoritmos, bancos de dados e matemática para compreender o que existe por baixo das interfaces.',
      },
      security: {
        title: 'proteger-e-conectar',
        intro: 'Segurança, infraestrutura e fundamentos essenciais para construir sistemas mais confiáveis.',
      },
    },
    categories: {
      cs: 'Ciência da Computação',
      python: 'Python',
      web: 'Web',
      webdev: 'Desenvolvimento Web',
      ai: 'Inteligência Artificial',
      genai: 'IA Generativa',
      datasci: 'Ciência de Dados',
      'data-computing': 'Dados e Computação',
      databases: 'Banco de Dados',
      algorithms: 'Algoritmos',
      'math-cs': 'Matemática e Computação',
      math: 'Matemática',
      cybersecurity: 'Cibersegurança',
      security: 'Segurança',
      privacy: 'Privacidade e Segurança',
      'cloud-ai': 'Cloud e IA',
    },
    levels: { beginner: 'Iniciante', 'beginner-intermediate': 'Iniciante a intermediário', intermediate: 'Intermediário' },
    languages: { en: 'Inglês', pt: 'Português' },
    certificates: {
      none: 'Sem certificado',
      statement: 'Declaração de conclusão',
      available: 'Certificado disponível',
    },
    units: { hours: 'h', weeks: 'semanas' },
    labels: {
      category: 'Categoria',
      level: 'Nível',
      language: 'Idioma',
      certificate: 'Certificado',
      duration: 'Duração',
      courses: 'cursos',
      curated: 'Escolha da curadoria',
      cta: 'Acessar curso',
      newTab: 'abre o site oficial em nova aba',
    },
    closing: {
      title: 'continue-aprendendo',
      body: 'Esta seleção evolui com o tempo. Novos cursos entram quando realmente merecem estar aqui.',
      prompt: 'Encontrou um curso gratuito excelente?',
      cta: 'Sugerir curso',
    },
  },
};
