import type { Dict } from './types';

// Limite factual: tudo aqui já existia na versão anterior do site (ver o
// histórico do git). Não adicionar métricas, usuários nem cargos.
export const pt: Dict = {
  htmlLang: 'pt-BR',
  meta: {
    title: 'Guilherme Henrique — engenharia de software, sistemas, IA',
    description:
      'Guilherme Henrique, Rio de Janeiro. Engenharia de software, sistemas e IA: Pexiscale e Lume, com a evidência de cada afirmação.',
    ogLocale: 'pt_BR',
  },
  skip: 'Ir para o conteúdo',
  nav: { label: 'Principal', home: 'Home', resume: 'Currículo', courses: 'Cursos', language: 'Idioma' },
  hero: {
    metaLabels: ['Prática', 'Base', 'Agora'],
    meta: ['Engenharia de software / Sistemas / IA', 'Rio de Janeiro, Brasil', 'Pexiscale + Lume'],
  },
  statement: {
    label: '01 / Manifesto',
    mark: 'evidência',
    text: 'Construo software, sistemas e experimentos, e mostro a evidência.',
    aside:
      'Trabalho com backends transacionais e com a forma como os dados são representados na memória: lugares onde uma resposta errada custa dinheiro ou confiança. Uso ferramentas de IA o tempo todo e trato o que elas produzem como não verificado até que um teste, uma medição ou uma consulta diga o contrário.',
  },
  lume: {
    label: '02 / Pesquisa',
    name: 'Lume',
    question:
      'Dá para representar software e dados com menos memória e menos movimentação de dados, sem perder correção?',
    body: 'Um projeto de pesquisa aberto. Núcleo em C++20 com uma base em C. A primeira regra: nenhuma afirmação de otimização sem medição.',
    link: {
      href: 'https://github.com/guilhermehrcst/lume',
      text: 'github.com/guilhermehrcst/lume',
      note: 'Público. Antes chamado PXIR.',
    },
    facts: [
      {
        title: 'Verificado, ou não executa',
        body: 'Um verificador é o único caminho para obter um programa executável. O sistema de tipos torna impossível escrever a execução de uma IR não verificada.',
      },
      {
        title: 'Hipótese, medição, resultado',
        body: 'Cada marco declara os três, inclusive as hipóteses que foram falsificadas.',
      },
      {
        title: 'Sanitizers em três plataformas',
        body: 'O CI compila em Linux, macOS e Windows e roda os testes com AddressSanitizer e UBSan.',
      },
    ],
    ledger: {
      evidenceLabel: 'Evidência',
      evidence:
        'Código, benchmarks e um texto por marco são públicos. Em um benchmark, reaproveitar um buffer morto reduziu os page faults de 2.016 para 0 por chamada (1M de elementos, medido).',
      openLabel: 'Em aberto',
      open: 'Pesquisa inicial. Sem afirmações de desempenho para produção ou universais; os resultados valem para as cargas e máquinas descritas.',
    },
    figure: {
      alt: 'Esquema: blocos de memória espalhados por um espaço de endereços são compactados numa única região contígua.',
      caption: 'Fig. 02 — Esquema, não dados. Alocações espalhadas se compactam num layout contíguo conforme a página rola; o azul marca dados em movimento.',
      states: ['espalhado', 'compactando', 'contíguo'],
      axis: 'Espaço de endereços →',
      legend: ['vivo', 'em movimento', 'morto, reaproveitado'],
    },
  },
  pexiscale: {
    label: '03 / Produto',
    name: 'Pexiscale',
    question: 'Uma plataforma multi-tenant para o trabalho do dia a dia de pequenas e médias empresas.',
    body: 'Clientes, catálogo, estoque, orçamentos e pedidos numa plataforma em que os dados de cada empresa ficam isolados. Eu projeto e construo.',
    link: { href: 'https://pexiscale.com', text: 'pexiscale.com', note: 'No ar.' },
    facts: [
      {
        title: 'Quem decide é o servidor',
        body: 'O PostgreSQL é a fonte da verdade comercial. Preço, estoque e estado do pedido são decididos no servidor. A IA interpreta o pedido e sugere; quem decide é o domínio comercial.',
      },
      {
        title: 'O isolamento vive no banco',
        body: 'Toda linha de uma empresa carrega o id da organização e é protegida por row-level security, e não por filtro no cliente.',
      },
      {
        title: 'Fronteiras vigiadas',
        body: 'Guardas de CI em script quebram o build quando as fronteiras de legado, de deploy ou de marketing regridem, e quando segredos são commitados.',
      },
    ],
    ledger: {
      evidenceLabel: 'Evidência',
      evidence:
        'Pull requests para a branch principal passam por um gate de CI que inclui guardas de fronteira e varredura de segredos.',
      openLabel: 'Em aberto',
      open: 'Nem toda capacidade implementada está ativa em produção. Algumas dependem de aprovação de provedores e de rollout, e só listo uma capacidade como ativa quando ela é.',
    },
    figure: {
      alt: 'Composição abstrata de uma interface de trabalho: painéis, listas e uma tabela cujas linhas se agrupam por organização.',
      caption: 'Fig. 03 — Composição abstrata, não uma captura do produto. Os módulos se montam; cada linha fica com a sua organização.',
    },
  },
  principles: {
    label: '04 / Método',
    items: [
      {
        title: 'Correção',
        body: 'Onde uma resposta errada custa dinheiro ou confiança, quem decide é o servidor. O cliente pergunta; o domínio responde.',
      },
      {
        title: 'Simplicidade',
        body: 'O menor desenho que continua correto, observável e recuperável. Menos partes móveis, menos lugares para errar.',
      },
      {
        title: 'Evidência',
        body: 'Não verificado até que um teste, uma medição ou uma consulta diga o contrário — inclusive o que as ferramentas de IA produzem. Hipóteses falsificadas ficam no registro.',
      },
    ],
  },
  about: {
    label: '05 / Sobre',
    heading: 'Engenheiro autodidata no Rio de Janeiro.',
    body: 'Trabalho entre engenharia de software, sistemas e IA: construo produtos e faço experimentos sobre como computação e dados são representados. Projeto e construo o Pexiscale, e pesquiso memória e movimentação de dados no Lume.',
    also: 'Também: Paulex, o backend de pedidos e pagamentos da minha marca de varejo. Pedidos nascem só no servidor, e uma requisição repetida nunca cria um segundo pedido. O repositório é privado.',
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
  footer: { place: 'Rio de Janeiro, Brasil', updated: 'Atualizado em 2026-10-06', top: 'Voltar ao topo' },
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
      body: 'Em preparação. Uma curadoria de cursos gratuitos, cada um com o link para onde é publicado.',
    },
    back: 'Voltar ao início',
  },
};
