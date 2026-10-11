// Interface copy, in Brazilian Portuguese. Names of objectives, areas and subjects live in
// src/lib/taxonomy.ts; official resource titles are never translated.
import type { Dict } from './types';

export const pt: Dict = {
  htmlLang: 'pt-BR',
  ogLocale: 'pt_BR',
  siteName: 'Pexis Academy',
  skip: 'Pular para o conteúdo',
  nav: { label: 'Principal', home: 'Pexis Academy, página inicial' },
  footer: {
    tagline: 'Recursos gratuitos e verificados, organizados com direção.',
    objectives: 'Objetivos',
    subjects: 'Matérias',
    academy: 'Pexis Academy',
    verified: (date) => `Recursos verificados em ${date}.`,
    licenses: 'Licenças',
  },
  pages: {
    home: {
      title: 'Pexis Academy: aprenda com direção',
      description: 'Estude para o ENEM, a UERJ, o Ensino Médio e vestibulares com recursos gratuitos e verificados, organizados por objetivo, área e matéria.',
      heading: 'Aprenda com direção.',
      lead: 'Escolha um objetivo e siga um caminho claro até materiais gratuitos, oficiais e verificados.',
    },
    enem: {
      title: 'ENEM | Pexis Academy',
      description: 'Prepare-se para o ENEM: entenda a prova pelas fontes oficiais do INEP, estude por área e pratique com material oficial e gratuito.',
      eyebrow: 'Objetivo',
      heading: 'ENEM',
      lead: 'Um ponto de partida para a preparação: o que a prova avalia, por onde estudar cada área e onde praticar com material oficial.',
    },
    uerj: {
      title: 'UERJ | Pexis Academy',
      description: 'Prepare-se para o Vestibular Estadual da UERJ: entenda a prova pela fonte oficial e resolva questões comentadas de edições anteriores.',
      eyebrow: 'Objetivo',
      heading: 'UERJ',
      lead: 'A UERJ tem um processo próprio. Comece pelas regras oficiais e faça das questões de provas anteriores a base da sua preparação.',
    },
    'ensino-medio': {
      title: 'Ensino Médio | Pexis Academy',
      description: 'Estude as matérias do Ensino Médio por área, com cursos e materiais gratuitos e verificados, de Matemática a Idiomas.',
      eyebrow: 'Objetivo',
      heading: 'Ensino Médio',
      lead: 'As matérias da escola organizadas por área, cada uma com recursos gratuitos para estudar no seu ritmo.',
    },
    vestibulares: {
      title: 'Vestibulares | Pexis Academy',
      description: 'Prepare-se para vestibulares com recursos gratuitos e verificados por matéria, e com um caminho próprio para a UERJ.',
      eyebrow: 'Objetivo',
      heading: 'Vestibulares',
      lead: 'Uma base comum para vestibulares em geral, com recursos por matéria e um caminho específico para a UERJ.',
    },
    tecnologia: {
      title: 'Tecnologia | Pexis Academy',
      description: 'Aprenda programação, ciência da computação, web, dados, inteligência artificial e segurança com cursos gratuitos de Harvard, MIT e outros.',
      eyebrow: 'Objetivo e área',
      heading: 'Tecnologia',
      lead: 'Trilhas para começar a programar e aprofundar em computação, com cursos gratuitos de universidades e instituições reconhecidas.',
    },
    materias: {
      title: 'Matérias | Pexis Academy',
      description: 'As matérias da Pexis Academy por área: Matemática, Linguagens, Ciências da Natureza, Ciências Humanas, Idiomas e Tecnologia.',
      eyebrow: 'Explorar',
      heading: 'Explore por área',
      lead: 'Escolha uma matéria para ver onde estudar e onde praticar, sempre com recursos gratuitos e verificados.',
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
  home: {
    cta: 'Escolher meu objetivo',
    areas: { heading: 'Explore por área' },
    curation: {
      heading: 'Como escolhemos os recursos',
      rules: [
        { title: 'Gratuito de verdade', body: 'Todo o conteúdo de estudo é gratuito. Sem período de teste, sem trechos de amostra, sem link de afiliado. Alguns pedem uma conta gratuita.' },
        { title: 'Direto da fonte', body: 'Cada link leva à página oficial do curso, da instituição ou da prova, nunca a um agregador.' },
        { title: 'Verificado com data', body: 'Conferimos cada recurso na fonte antes de publicar e registramos quando.' },
      ],
      more: 'Como verificamos',
    },
    objectives: {
      heading: 'Qual é o seu objetivo?',
      items: {
        enem: 'Entenda a prova, estude por área e pratique com material oficial do INEP.',
        uerj: 'Comece pelas regras oficiais e pratique com questões de provas anteriores.',
        'ensino-medio': 'As matérias da escola, organizadas por área, com recursos gratuitos para cada uma.',
        vestibulares: 'Uma base comum, matéria por matéria, para vestibulares em geral.',
        tecnologia: 'Trilhas para aprender programação, computação, dados e inteligência artificial.',
      },
    },
  },
  about: {
    intro: 'A Pexis Academy é um produto da Pexis. Ela não produz aulas: organiza, por objetivo, área e matéria, materiais gratuitos de universidades, instituições públicas e plataformas educacionais, e diz por onde começar.',
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
    formats: { course: 'Curso', track: 'Trilha', playlist: 'Playlist', lessons: 'Aulas', practice: 'Prática' },
    languages: { pt: 'Em português', en: 'Em inglês', es: 'Em espanhol' },
    registration: { required: 'Conta gratuita necessária', 'not-required': 'Sem cadastro' },
    certificates: { none: 'Sem certificado', statement: 'Declaração de conclusão', available: 'Certificado disponível' },
    units: { hours: 'h', weeks: 'semanas' },
    newTab: 'abre o site do provedor em nova aba',
  },
};
