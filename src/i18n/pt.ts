import type { Dict } from './types';

// Limite factual: tudo aqui já existia na versão anterior do site (ver o
// histórico do git). Não adicionar métricas, usuários nem cargos.
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
  shell: {
    resume: {
      title: 'Currículo — Guilherme Henrique',
      description: 'Currículo de Guilherme Henrique. Em preparação.',
      heading: 'Currículo',
      body: 'Em preparação. O currículo completo será publicado nesta página.',
    },
    courses: {
      title: 'Cursos — Guilherme Henrique',
      description: 'Uma curadoria de cursos gratuitos. Em preparação.',
      heading: 'Cursos',
      body: 'Em preparação. Esta página reunirá uma curadoria de cursos gratuitos, com links diretos para as plataformas onde estão disponíveis.',
    },
    back: 'Voltar ao início',
  },
};
