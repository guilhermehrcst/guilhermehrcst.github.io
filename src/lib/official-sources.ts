// Official exam pages (INEP, UERJ) that the exam guides cite. Same verification shape as the
// catalogue. Only URLs already recorded in docs/superpowers/research/2026-10-11-learning-library-sources.md
// are listed; no URL here is derived or guessed. No asset imports: runs under Node's test runner.

export type OfficialSourceId = 'inep-provas-gabaritos' | 'inep-matrizes' | 'uerj-faq';

export interface OfficialSource {
  issuer: 'inep' | 'uerj';
  title: string;
  url: string;
  verified: { on: string; by: 'official-page' };
}

export const OFFICIAL_HOSTS: ReadonlySet<string> = new Set([
  'www.gov.br',
  'sistema.vestibular.uerj.br',
  'www.revista.vestibular.uerj.br',
]);

const verified = { on: '2026-10-11', by: 'official-page' } as const;

export const officialSources: Readonly<Record<OfficialSourceId, OfficialSource>> = {
  'inep-provas-gabaritos': {
    issuer: 'inep',
    title: 'Provas e gabaritos do Enem',
    url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos',
    verified,
  },
  'inep-matrizes': {
    issuer: 'inep',
    title: 'Matrizes de referência do Enem',
    url: 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem',
    verified,
  },
  'uerj-faq': {
    issuer: 'uerj',
    title: 'Perguntas frequentes do Vestibular Estadual UERJ',
    url: 'https://sistema.vestibular.uerj.br/portal_vestibular_uerj/perguntas_frequentes/',
    verified,
  },
};
