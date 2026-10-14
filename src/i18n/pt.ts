// Interface copy, in Brazilian Portuguese. Names of objectives, areas and subjects live in
// src/lib/taxonomy.ts; official resource titles are never translated.
import type { Dict } from './types';

export const pt: Dict = {
  htmlLang: 'pt-BR',
  ogLocale: 'pt_BR',
  siteName: 'Pexis Academy',
  skip: 'Pular para o conteúdo',
  nav: {
    label: 'Principal',
    home: 'Pexis Academy, página inicial',
    mobile: 'Menu principal',
    menu: 'Menu',
    paths: 'Caminhos',
    search: 'Buscar',
    types: {
      cursos: { label: 'Cursos', what: 'Cursos, playlists e videoaulas' },
      livros: { label: 'Livros', what: 'Livros digitais, apostilas e leituras' },
      provas: { label: 'Provas', what: 'Provas anteriores, simulados e gabaritos' },
    },
    count: (n) => (n === 1 ? '1 publicado' : `${n} publicados`),
    explore: (name) => `Explorar ${name}`,
    of: (name) => `de ${name}`,
    libraries: 'Bibliotecas',
    allCourses: 'Todos os cursos',
    allMaterials: 'Todos os materiais',
  },
  breadcrumb: { label: 'Você está em', home: 'Início' },
  footer: {
    subjects: 'Matérias',
    verified: (date) => `Recursos verificados em ${date}.`,
    licenses: 'Licenças',
    independence: 'A Pexis Academy é um produto da Pexis, independente das instituições cujos materiais indica.',
    nav: { courses: 'Cursos', materials: 'Materiais', explore: 'Explorar', search: 'Buscar', about: 'Sobre', verification: 'Como verificamos' },
    about: 'Uma plataforma gratuita para estudar com direção: organiza, por caminho, área e matéria, materiais gratuitos verificados na fonte.',
    formation: 'Formação',
    explore: 'Explorar',
    marks: 'Os nomes e as marcas das instituições citadas pertencem aos seus titulares.',
  },
  pages: {
    home: {
      title: 'Pexis Academy: aprenda com direção',
      description: 'Estude com direção: Ensino Fundamental, Médio, Vestibular, Pré-Militar, Ensino Superior e Tecnologia, com recursos gratuitos verificados na fonte.',
      heading: 'Aprenda com direção.',
      lead: 'Escolha um objetivo e siga um caminho claro até materiais gratuitos, oficiais e verificados.',
    },
    enem: {
      title: 'ENEM | Pexis Academy',
      description: 'Prepare-se para o ENEM: entenda a prova pelas fontes oficiais do INEP, estude por área e pratique com material oficial e gratuito.',
      eyebrow: 'Prova',
      heading: 'ENEM',
      lead: 'Um ponto de partida para a preparação: o que a prova avalia, por onde estudar cada área e onde praticar com material oficial.',
    },
    uerj: {
      title: 'UERJ | Pexis Academy',
      description: 'Prepare-se para o Vestibular Estadual da UERJ: entenda a prova pela fonte oficial e resolva questões comentadas de edições anteriores.',
      eyebrow: 'Prova',
      heading: 'UERJ',
      lead: 'A UERJ tem um processo próprio. Comece pelas regras oficiais e faça das questões de provas anteriores a base da sua preparação.',
    },
    'ensino-medio': {
      title: 'Ensino Médio | Pexis Academy',
      description: 'Estude as matérias do Ensino Médio por área, com cursos e materiais gratuitos e verificados, de Matemática a Idiomas.',
      eyebrow: 'Caminho',
      heading: 'Ensino Médio',
      lead: 'As matérias da escola organizadas por área, cada uma com recursos gratuitos para estudar no seu ritmo.',
    },
    vestibulares: {
      title: 'Vestibular | Pexis Academy',
      description: 'Prepare-se para o vestibular: guias do ENEM e da UERJ com material oficial, e uma base comum de recursos gratuitos por matéria.',
      eyebrow: 'Caminho',
      heading: 'Vestibular',
      lead: 'ENEM, UERJ e uma base comum para vestibulares em geral, matéria por matéria.',
    },
    tecnologia: {
      title: 'Tecnologia | Pexis Academy',
      description: 'Aprenda programação, ciência da computação, web, dados, inteligência artificial e segurança com cursos gratuitos de Harvard, MIT e outros.',
      eyebrow: 'Caminho e área',
      heading: 'Tecnologia',
      lead: 'Trilhas para começar a programar e aprofundar em computação, com cursos gratuitos de universidades e instituições reconhecidas.',
    },
    'ensino-fundamental': {
      title: 'Ensino Fundamental | Pexis Academy',
      eyebrow: 'Caminho',
      heading: 'Ensino Fundamental',
    },
    'pre-militar': {
      title: 'Pré-Militar | Pexis Academy',
      eyebrow: 'Caminho',
      heading: 'Pré-Militar',
    },
    'ensino-superior': {
      title: 'Ensino Superior | Pexis Academy',
      description: 'Disciplinas universitárias gratuitas, de Matemática e Computação, publicadas por universidades como o MIT e Harvard e verificadas na fonte.',
      eyebrow: 'Caminho',
      heading: 'Ensino Superior',
      lead: 'Disciplinas de cursos universitários, publicadas gratuitamente pelas próprias universidades.',
    },
    materias: {
      title: 'Explorar | Pexis Academy',
      description: 'Os seis caminhos da Pexis Academy e todas as matérias, por área: de Matemática a Idiomas e Tecnologia, com recursos gratuitos e verificados.',
      eyebrow: 'Explorar',
      heading: 'Explorar',
      lead: 'Comece por um caminho ou vá direto a uma matéria. Tudo com recursos gratuitos e verificados na fonte.',
    },
    cursos: {
      title: 'Cursos | Pexis Academy',
      description: 'Cursos gratuitos, trilhas, playlists e videoaulas selecionados pela Pexis Academy e verificados na fonte, de universidades e instituições reconhecidas.',
      eyebrow: 'Biblioteca',
      heading: 'Cursos',
      lead: 'Cursos gratuitos, trilhas, playlists e videoaulas para estudar do começo ao fim, cada um verificado na fonte.',
    },
    materiais: {
      title: 'Materiais | Pexis Academy',
      description: 'Exercícios, simulados, provas anteriores e materiais de referência gratuitos selecionados pela Pexis Academy e verificados na fonte.',
      eyebrow: 'Biblioteca',
      heading: 'Materiais',
      lead: 'Exercícios, simulados, provas anteriores e materiais de referência para praticar e consultar, cada um verificado na fonte.',
    },
    buscar: {
      title: 'Buscar | Pexis Academy',
      description: 'Encontre objetivos, áreas, matérias, trilhas e recursos gratuitos da Pexis Academy em um índice completo e pesquisável.',
      heading: 'Buscar',
      lead: 'Tudo o que a Pexis Academy organiza, reunido num só índice.',
    },
    sobre: {
      title: 'Sobre | Pexis Academy',
      description: 'Como a Pexis Academy escolhe e verifica recursos: acesso realmente gratuito, fontes primárias e data de verificação registrada.',
      heading: 'Sobre a Pexis Academy',
      lead: 'Um lugar para estudar com direção, usando apenas recursos gratuitos que verificamos na fonte.',
    },
    notFound: {
      title: 'Página não encontrada | Pexis Academy',
      description: 'O endereço procurado não existe na Pexis Academy. Volte ao início, explore as matérias ou use a busca para continuar.',
      heading: 'Página não encontrada',
      lead: 'Este endereço não existe ou deixou de existir. Escolha por onde continuar.',
    },
  },
  preparing: {
    label: 'Em preparação',
    why: 'Só publicamos um recurso depois de conferi-lo na página de quem o publica. Esta área ainda não tem nenhum recurso verificado, por isso não mostra nenhum.',
    meanwhile: 'Enquanto isso',
  },
  fundamental: {
    byState: {
      preparing: {
        description: 'Ensino Fundamental na Pexis Academy: uma área em preparação, organizada por anos e disciplinas, que só receberá recursos verificados.',
        lead: 'Do 1º ao 9º ano, organizado por etapa e por disciplina. Esta área ainda não tem recursos publicados.',
        stagesTitle: 'Como esta área vai se organizar',
        stagesWhy: 'O Ensino Fundamental tem nove anos, em duas etapas. Cada etapa terá seus próprios materiais.',
        subjectsTitle: 'Disciplinas previstas',
        subjectsWhy: 'Cada disciplina entra quando houver material gratuito, adequado à etapa e verificado na fonte.',
      },
      active: {
        description: 'Ensino Fundamental na Pexis Academy: recursos gratuitos do 1º ao 9º ano, organizados por etapa e conferidos na página de quem os publica.',
        lead: 'Do 1º ao 9º ano, organizado por etapa, com recursos gratuitos conferidos na página de quem os publica.',
        stagesTitle: 'Como esta área se organiza',
        stagesWhy: 'O Ensino Fundamental tem nove anos, em duas etapas. Cada recurso aparece na etapa que a sua fonte indica.',
      },
    },
    stages: [
      { title: 'Anos iniciais', body: 'Do 1º ao 5º ano.' },
      { title: 'Anos finais', body: 'Do 6º ao 9º ano.' },
    ],
    subjects: ['Português', 'Matemática', 'Ciências', 'História', 'Geografia', 'Inglês'],
    rule: 'Materiais do Ensino Médio não são apresentados aqui como se servissem ao Fundamental.',
    medio: 'Já está no Ensino Médio? Veja as matérias por área',
  },
  preMilitar: {
    byState: {
      preparing: {
        description: 'Pré-Militar na Pexis Academy: uma central em preparação para entender os processos seletivos de escolas e academias militares.',
        lead: 'Uma central para entender os processos seletivos de escolas e academias militares, com cada detalhe conferido no edital oficial.',
        practice: {
          title: 'Estude as matérias-base',
          text: 'Enquanto esta área é preparada, revise as matérias do Ensino Médio, organizadas por área.',
          link: 'Estude as matérias do Ensino Médio por área',
        },
      },
      active: {
        description: 'Pré-Militar na Pexis Academy: materiais gratuitos para os processos seletivos de escolas e academias militares, conferidos na fonte oficial.',
        lead: 'Os processos seletivos de escolas e academias militares, com materiais gratuitos conferidos na fonte oficial. Requisitos e datas valem sempre pelo edital.',
        practice: {
          title: 'Pratique com provas oficiais',
          text: 'Provas anteriores publicadas pela própria instituição, conferidas na fonte. Elas não substituem o edital mais recente.',
          link: 'Ver os materiais publicados',
        },
      },
    },
    startTitle: 'Como começar',
    start: [
      { title: 'Entenda o processo seletivo', text: 'Cada escola e academia tem etapas, matérias e requisitos próprios. Comece pela instituição que você pretende prestar.' },
      { title: 'Consulte o edital vigente', text: 'Requisitos, datas e matérias valem sempre pelo edital publicado na página oficial da instituição.' },
    ],
    materialsTitle: 'Materiais para estudar e praticar',
    materialsWhy: 'Cursos, aulas, exercícios, materiais de apoio e provas anteriores aparecem conforme são verificados e publicados. Conteúdo de professores independentes é identificado separadamente das provas oficiais.',
    processesTitle: 'Instituições e processos',
    processesWhy: 'Cada escola e academia tem o próprio processo seletivo, com etapas, matérias e requisitos definidos no edital. Nenhum deles é resumido aqui antes de ser conferido na fonte oficial.',
    branches: [
      { force: 'Exército', schools: [
        { acronym: 'ESA', name: 'Escola de Sargentos das Armas' },
        { acronym: 'EsPCEx', name: 'Escola Preparatória de Cadetes do Exército' },
        { acronym: 'IME', name: 'Instituto Militar de Engenharia' },
      ] },
      { force: 'Marinha', schools: [
        { acronym: 'CN', name: 'Colégio Naval' },
        { acronym: 'EN', name: 'Escola Naval' },
      ] },
      { force: 'Aeronáutica', schools: [
        { acronym: 'EEAR', name: 'Escola de Especialistas de Aeronáutica' },
        { acronym: 'EPCAR', name: 'Escola Preparatória de Cadetes do Ar' },
        { acronym: 'AFA', name: 'Academia da Força Aérea' },
        { acronym: 'ITA', name: 'Instituto Tecnológico de Aeronáutica', resourceId: 'ita-provas-anteriores' },
      ] },
    ],
    available: 'Provas anteriores disponíveis',
    scope: 'Esta área não oferece treinamento físico, avaliação médica nem simulados.',
  },
  explore: { paths: 'Caminhos', areas: 'Áreas e matérias' },
  bottomNav: { label: 'Seções da Academy', home: 'Início', courses: 'Cursos', materials: 'Materiais', explore: 'Explorar', search: 'Buscar' },
  courseLibrary: {
    catalogue: 'Catálogo de cursos',
    filterLegend: 'Filtrar por caminho',
    all: 'Tudo',
    empty: 'Ainda não há cursos publicados. Os primeiros chegam assim que forem verificados na fonte.',
    emptyPath: (path) => `Ainda não há cursos de ${path} publicados. Eles entram aqui assim que forem verificados na fonte.`,
    view: (path, n) => `${path}: ${n === 1 ? '1 curso' : `${n} cursos`}`,
    search: 'Buscar nos cursos',
    page: {
      provider: 'Oferecido por',
      facts: 'Sobre o curso',
      summary: 'O que você vai estudar',
      modules: 'Módulos',
      checked: (date) => `Conferido na página oficial em ${date}.`,
      open: 'Acessar curso',
      watch: 'Assistir no YouTube',
      related: 'Cursos relacionados',
      back: 'Todos os cursos',
    },
  },
  library: {
    groups: { course: 'Cursos gratuitos', track: 'Trilhas', playlist: 'Playlists', lessons: 'Séries de aulas', lesson: 'Aulas', practice: 'Exercícios e prática', simulator: 'Simulados', 'past-exam': 'Provas anteriores', reference: 'Materiais de referência' },
    count: (n) => (n === 1 ? '1 recurso' : `${n} recursos`),
    note: 'Cada recurso abre no site da instituição que o oferece. Para estudar com um percurso, comece por um caminho em Explorar.',
    other: {
      cursos: { label: 'Ver os cursos', text: 'Procurando cursos, trilhas e videoaulas?' },
      materiais: { label: 'Ver os materiais', text: 'Procurando exercícios, simulados e provas anteriores?' },
    },
    views: {
      all: 'Ver todos os materiais',
      count: (n) => (n === 1 ? '1 publicado' : `${n} publicados`),
      empty: {
        livros: (path) => `Ainda não há livros, apostilas ou leituras de ${path} publicados. Entram aqui assim que passarem pela verificação editorial.`,
        provas: (path) => `Ainda não há provas anteriores ou simulados de ${path} publicados. Entram aqui assim que forem verificados na fonte.`,
      },
    },
  },
  superior: {
    note: 'Por enquanto, Matemática e Computação: são as áreas em que já verificamos cursos universitários gratuitos. Outras áreas do conhecimento entram à medida que verificarmos cursos na fonte.',
    groupsTitle: 'Áreas',
    byAreas: (labels) => {
      const join = (items: readonly string[]) =>
        items.length <= 1 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`;
      const full = join(labels);
      const short = labels.length > 3
        ? `${labels.slice(0, 2).join(', ')} e mais ${labels.length - 2} áreas`
        : full;
      return {
        description: `Materiais gratuitos de nível superior em ${short}, verificados na fonte e disponibilizados pelas instituições responsáveis.`,
        note: `As áreas com materiais gratuitos verificados no catálogo são ${full}. A Academy organiza recursos de estudo, mas não oferece matrícula ou diploma acadêmico.`,
        objective: `Materiais gratuitos de nível superior em ${short}.`,
      };
    },
  },
  home: {
    hero: {
      eyebrow: 'Gratuito para estudar · Conferido na fonte',
      headingLead: 'Aprenda',
      headingStrong: 'com direção.',
      lead: 'Encontre cursos e materiais gratuitos para aprender no seu ritmo.',
      searchLabel: 'Buscar na Pexis Academy',
      searchPlaceholder: 'O que você quer aprender?',
      searchSubmit: 'Buscar',
      primary: 'Explorar cursos',
      secondary: 'Escolher meu caminho',
      compositionCaption: 'Foto do curso',
      compositionLink: 'Ver todos os cursos',
    },
    areas: {
      eyebrow: 'Explore por área e matéria',
      heading: 'O que você quer estudar?',
      lead: 'As matérias como na escola. Cada uma reúne o que estudar e onde praticar.',
      subjects: (n) => (n === 1 ? '1 matéria' : `${n} matérias`),
      swipe: 'Deslize para ver as seis áreas',
    },
    tracks: {
      eyebrow: 'Trilhas de aprendizagem',
      heading: 'Comece por um caminho pronto.',
      lead: 'Guias e trilhas com as etapas em ordem.',
      kinds: { guide: 'Guia', track: 'Trilha' },
      titles: { enem: 'Preparação para o ENEM', uerj: 'Preparação para a UERJ' },
      why: {
        enem: 'Entenda a prova, estude por área e pratique com material oficial do INEP.',
        uerj: 'Comece pelas regras oficiais e pratique com questões de provas anteriores.',
      },
      steps: (n) => `${n} etapas`,
      first: 'Primeiros passos',
      more: (n) => (n === 1 ? 'e mais 1 etapa' : `e mais ${n} etapas`),
      links: { enem: 'Abrir o guia do ENEM', uerj: 'Abrir o guia da UERJ', track: 'Abrir a trilha' },
    },
    curation: {
      eyebrow: 'Compromisso',
      heading: 'Nossos compromissos',
      lead: 'O que a Pexis Academy garante em cada indicação.',
      verified: (date) => `Catálogo verificado em ${date}`,
      commitments: [
        { title: 'Gratuito para estudar', body: 'Todo conteúdo de estudo indicado é gratuito, sem período de teste nem link de afiliado. Certificados, quando existem, são de quem publica e podem ser pagos.' },
        { title: 'Conferido na fonte', body: 'Cada recurso é conferido na página de quem o publica antes de entrar, com a data registrada.' },
        { title: 'Independente', body: 'A Academy não produz aulas e não tem parceria com as instituições que indica. Os nomes e as marcas são delas.' },
      ],
      more: 'Ler as regras completas',
    },
    faq: {
      heading: 'Perguntas frequentes',
      items: [
        { q: 'A Pexis Academy é gratuita?', a: 'Sim. A Academy não cobra nada, e todo recurso indicado pode ser estudado de graça. Certificados, quando existem, são de quem publica o curso, podem ser pagos e são sempre opcionais.' },
        { q: 'Preciso criar uma conta?', a: 'Não na Pexis Academy: aqui não há cadastro. Alguns recursos pedem uma conta gratuita no site de quem os publica; quando conferimos essa exigência, ela aparece indicada no recurso.' },
        { q: 'Os cursos são da Pexis?', a: 'Não. A Pexis Academy não produz aulas. Ela organiza materiais gratuitos de universidades, instituições públicas e plataformas educacionais, e leva você à página oficial de quem os publica.' },
        { q: 'Há material oficial para o ENEM?', a: 'Sim. O guia do ENEM leva às provas e aos gabaritos publicados pelo INEP e às Matrizes de Referência, que descrevem o que cada área avalia.' },
        { q: 'Como os recursos são escolhidos?', a: 'O conteúdo precisa ser gratuito de verdade, o link vai à página oficial de quem publica e cada recurso é conferido nessa página antes de entrar, com a data registrada. O que não conseguimos confirmar fica de fora até ser verificado.' },
        { q: 'A Academy guarda o meu progresso?', a: 'Não. Como não há conta na Pexis Academy, nada é salvo aqui. Você estuda na página de quem publica, e o progresso, quando existe, fica lá.' },
      ],
    },
    objectives: {
      eyebrow: 'Escolha seu caminho',
      heading: 'Qual é o seu objetivo?',
      lead: 'Seis caminhos, da escola à universidade e à tecnologia.',
      items: {
        'ensino-fundamental': 'Do 1º ao 9º ano, por etapa e por disciplina.',
        'ensino-medio': 'As matérias da escola, organizadas por área, com recursos gratuitos para cada uma.',
        vestibulares: 'ENEM, UERJ e uma base comum, matéria por matéria, com material oficial para praticar.',
        'pre-militar': 'Os processos seletivos de escolas e academias militares, conferidos no edital.',
        'ensino-superior': 'Disciplinas universitárias de Matemática e Computação, publicadas pelas universidades.',
        tecnologia: 'Trilhas para aprender programação, computação, dados e inteligência artificial.',
      },
      facts: (resources, tracks) =>
        [`${resources} ${resources === 1 ? 'recurso' : 'recursos'}`, tracks && `${tracks} ${tracks === 1 ? 'trilha' : 'trilhas'}`].filter(Boolean).join(' · '),
    },
    sources: {
      eyebrow: 'Instituições e fontes',
      heading: 'Quem publica os cursos indicados',
      lead: 'Cada indicação leva à página oficial de quem a publica. Os nomes e as marcas são das instituições.',
      count: (resources, page) => `${resources} ${resources === 1 ? 'curso' : 'cursos'} em ${page}`,
      countAreas: (resources, areas) => `${resources} ${resources === 1 ? 'curso' : 'cursos'} em ${areas.length > 1 ? `${areas.slice(0, -1).join(', ')} e ${areas.at(-1)}` : areas[0]}`,
      exams: 'Para as provas, a fonte é quem as aplica:',
      examLinks: { enem: 'INEP, no guia do ENEM', uerj: 'Vestibular Estadual UERJ, no guia da UERJ' },
    },
    courses: {
      eyebrow: 'Cursos em destaque',
      heading: 'Explore novas possibilidades.',
      lead: 'Cursos gratuitos da biblioteca, conferidos na fonte e escolhidos pelos editores.',
      all: 'Explorar todos os cursos',
      swipe: 'Deslize para ver os quatro cursos',
    },
  },
  about: {
    intro: 'A Pexis Academy é um produto da Pexis. Ela não produz aulas: organiza, por caminho, área e matéria, materiais gratuitos de universidades, instituições públicas e plataformas educacionais, e diz por onde começar.',
    curation: {
      heading: 'Regras de curadoria',
      rules: [
        { title: 'Acesso realmente gratuito', body: 'O conteúdo de estudo precisa ser inteiramente gratuito. Não publicamos períodos de teste, trechos de amostra, conteúdo atrás de pagamento nem links de afiliado. Uma conta gratuita pode ser exigida; um certificado pago e opcional não impede a publicação, desde que as aulas sejam gratuitas.' },
        { title: 'Link para a fonte primária', body: 'Cada recurso leva à página oficial do curso ou da instituição. Nunca deduzimos um endereço a partir da estrutura de um site.' },
        { title: 'Material oficial para as provas', body: 'Para ENEM e UERJ, a prática começa pelo material publicado por quem faz a prova: o INEP e o Vestibular Estadual da UERJ.' },
        { title: 'Relevância, não promessa', body: 'Marcar um recurso como útil para o ENEM ou para vestibulares é uma indicação editorial, não uma alegação de que o provedor prepara oficialmente para aquela prova.' },
      ],
    },
    verification: {
      heading: 'Como verificamos',
      body: [
        'Antes de publicar, abrimos cada recurso na página do próprio provedor e confirmamos que o conteúdo de estudo é gratuito. Registramos a data e a forma dessa verificação junto com o recurso.',
        'Um recurso promissor que não conseguimos confirmar fica fora do site, com uma nota explicando o motivo, até ser verificado.',
      ],
      latest: (date) => `A verificação mais recente do catálogo foi em ${date}.`,
    },
    independence: {
      heading: 'Independência',
      body: [
        'A Pexis Academy não tem vínculo com o INEP, com a UERJ nem com os provedores dos recursos indicados. Os nomes e as marcas pertencem aos seus titulares e aparecem apenas para identificar a origem de cada material.',
        'Não usamos links de afiliado: indicar um recurso não depende de nenhum acordo com quem o oferece.',
      ],
    },
  },
  tecnologia: { chooser: 'Escolha uma trilha' },
  sectionNav: { areas: 'Escolha uma área', page: 'Nesta página' },
  pathResources: {
    other: { title: 'Outras provas e materiais', why: 'Provas anteriores e materiais de outros vestibulares, publicados pelas próprias instituições e conferidos na fonte.' },
    general: { title: 'Recursos', why: 'Materiais gratuitos para este caminho, conferidos na página de quem os publica.' },
    stages: { 'anos-iniciais': 'Anos iniciais (1º ao 5º ano)', 'anos-finais': 'Anos finais (6º ao 9º ano)', none: 'Outros materiais' },
  },
  featured: {
    title: 'Destaques',
    why: 'Uma seleção editorial para começar por este caminho, conferida na fonte. O acervo completo continua abaixo.',
  },
  search: {
    label: 'Buscar na Pexis Academy',
    placeholder: 'Matéria, prova, trilha ou curso',
    groups: { biblioteca: 'Bibliotecas', objetivo: 'Caminhos e provas', area: 'Áreas', materia: 'Matérias', trilha: 'Trilhas de tecnologia', recurso: 'Recursos' },
    results: (n) => (n === 1 ? '1 resultado' : `${n} resultados`),
    empty: 'Nada encontrado. Tente outra palavra, ou explore pelas áreas.',
    filters: {
      title: 'Filtrar recursos',
      note: 'Os filtros valem para os recursos. Marque mais de uma opção para ampliar dentro do mesmo filtro.',
      facets: { caminho: 'Caminho', materia: 'Matéria', instituicao: 'Instituição', idioma: 'Idioma', formato: 'Formato' },
      clear: 'Limpar filtros',
      emptyFiltered: 'Nenhum recurso atende a todos os filtros marcados.',
    },
    languages: { pt: 'Português', en: 'Inglês', es: 'Espanhol' },
  },
  vestibulares: {
    exams: {
      title: 'Escolha a prova',
      why: 'Cada prova tem um guia próprio, com o que ela avalia, onde estudar e onde praticar com material oficial.',
      items: {
        enem: { name: 'ENEM', what: 'Exame Nacional do Ensino Médio, aplicado pelo INEP.', link: 'Abrir o guia do ENEM' },
        uerj: { name: 'UERJ', what: 'Vestibular Estadual da Universidade do Estado do Rio de Janeiro.', link: 'Abrir o guia da UERJ' },
      },
    },
    note: {
      title: 'Sobre esta seleção',
      body: 'Os recursos abaixo cobrem conteúdos do Ensino Médio cobrados em vestibulares. Indicá-los para vestibulares é uma escolha editorial: não significa que o provedor prepare oficialmente para um vestibular específico.',
    },
  },
  objectiveMap: {
    more: (subject) => `Tudo sobre ${subject}`,
    technology: {
      title: 'Tecnologia',
      why: 'Programação, computação, dados e inteligência artificial têm trilhas próprias, para começar do zero ou aprofundar.',
      link: 'Ver as trilhas de tecnologia',
    },
  },
  guides: {
    count: (n) => (n === 1 ? '1 recurso' : `${n} recursos`),
    uerj: {
      entenda: {
        title: 'Entenda a prova',
        body: ['No Exame Discursivo da UERJ, todos os candidatos fazem a prova de Redação e duas disciplinas específicas.'],
      },
      prepare: {
        title: 'Monte sua preparação',
        body: [
          'As disciplinas específicas dependem do curso que você pretende disputar, e as regras oficiais dizem quais são.',
          'Escolha o curso, descubra as suas duas disciplinas e dê a elas a maior parte do seu tempo, sem deixar a Redação de lado.',
        ],
      },
      materias: { title: 'Estude por matéria', why: 'As matérias com questões da UERJ para praticar. Cada página reúne também cursos gratuitos para estudar o conteúdo.' },
      provas: { title: 'Resolva provas anteriores', why: 'A Revista do Vestibular da UERJ reúne questões comentadas de edições atuais e anteriores. É a forma mais direta de conhecer o estilo da prova.' },
    },
    enem: {
      entenda: {
        title: 'Entenda a prova',
        body: [
          'O Enem avalia quatro áreas do conhecimento (Linguagens, Códigos e suas Tecnologias; Ciências Humanas e suas Tecnologias; Ciências da Natureza e suas Tecnologias; Matemática e suas Tecnologias) e uma redação.',
          'As matrizes de referência do INEP descrevem o que cada área avalia. São o ponto de partida mais seguro para decidir o que estudar.',
        ],
      },
      areas: { title: 'Estude por área', why: 'As matérias de cada área, como o INEP organiza a prova. Comece pela que mais precisa da sua atenção.' },
      pratique: { title: 'Pratique', why: 'Resolver provas anteriores é a forma mais direta de conhecer o exame. O INEP publica as provas e os gabaritos das edições anteriores.' },
      aprofunde: { title: 'Aprofunde por área', why: 'Cursos gratuitos para revisar o conteúdo de cada área do Enem.' },
    },
  },
  source: { label: 'Fonte oficial:', verified: (date) => `verificada em ${date}` },
  subject: {
    map: 'Mapa de estudo',
    eyebrow: 'Matéria',
    content: 'Para estudar',
    practice: 'Para praticar',
    reference: 'Para consultar',
    objectives: 'Por objetivo',
    objectivesLead: (subject) => `Veja como ${subject} entra na preparação de cada objetivo.`,
  },
  subjectPage: (subject, area) => ({
    title: `${subject} | Pexis Academy`,
    description: `Estude ${subject} com recursos gratuitos e verificados para o Ensino Médio, o ENEM e vestibulares, com links diretos para as fontes.`,
    eyebrow: area,
    heading: subject,
    lead: `O que estudar em ${subject} e onde encontrar material gratuito e verificado.`,
  }),
  notFound: { home: 'Página inicial', subjects: 'Explorar as matérias', search: 'Buscar' },
  resource: {
    openSource: 'Abrir na fonte',
    accessLabel: 'Acesso',
    formats: { course: 'Curso', track: 'Trilha', playlist: 'Playlist', lessons: 'Aulas', lesson: 'Aula', practice: 'Prática', 'past-exam': 'Prova anterior', simulator: 'Simulado', reference: 'Material de referência' },
    languages: { pt: 'Em português', en: 'Em inglês', es: 'Em espanhol' },
    registration: { required: 'Conta gratuita necessária', 'not-required': 'Sem cadastro' },
    certificates: { none: 'Sem certificado', statement: 'Declaração de conclusão', participation: 'Declaração de participação', available: 'Certificado disponível' },
    units: { hours: 'h', weeks: 'semanas' },
    schoolYears: (years) => {
      const ord = years.map((y) => `${y}º`);
      const consecutive = years.length > 2 && years.every((y, i) => i === 0 || y === years[i - 1]! + 1);
      if (years.length === 1) return `${ord[0]} ano`;
      if (consecutive) return `${ord[0]} ao ${ord[ord.length - 1]} ano`;
      return `${ord.slice(0, -1).join(', ')} e ${ord[ord.length - 1]} ano`;
    },
    newTab: 'abre o site do provedor em nova aba',
  },
};
