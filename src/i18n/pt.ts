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
