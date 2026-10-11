// The technology tracks (spec §6.3): goals a student can pick, each a short ordered list of catalogue
// resources by id (one resource may serve two tracks; it is defined once). A track with no verified
// resource is `planned` and never shown. No asset imports: this module runs under Node's test runner.

export type TechTrackId =
  | 'comecar-a-programar' | 'ciencia-da-computacao' | 'desenvolvimento-web' | 'python'
  | 'inteligencia-artificial' | 'dados' | 'seguranca-e-privacidade' | 'git-e-github';

export interface TechTrack {
  id: TechTrackId;
  label: string;
  why: string;
  status: 'published' | 'planned';
  resourceIds: readonly string[];
}

export const techTracks: readonly TechTrack[] = [
  { id: 'comecar-a-programar', label: 'Começar a programar', status: 'published', why: 'Para quem nunca programou: fundamentos da computação e uma primeira linguagem, do zero.', resourceIds: ['cs50x', 'cs50p', 'fb-python'] },
  { id: 'ciencia-da-computacao', label: 'Ciência da Computação', status: 'published', why: 'A base teórica da computação em nível universitário: algoritmos, matemática para computação e álgebra linear.', resourceIds: ['cs50x', 'mit-6006', 'mit-6042j', 'mit-1806'] },
  { id: 'desenvolvimento-web', label: 'Desenvolvimento Web', status: 'published', why: 'Como sites e aplicações web são construídos, de uma primeira página a aplicações completas.', resourceIds: ['cs50w', 'fb-web'] },
  { id: 'python', label: 'Python', status: 'published', why: 'Uma linguagem muito usada para começar, de exercícios básicos à resolução de problemas com computação.', resourceIds: ['cs50p', 'mit-6100l', 'fb-python'] },
  { id: 'inteligencia-artificial', label: 'Inteligência Artificial', status: 'published', why: 'O que é inteligência artificial e como ela funciona, de uma introdução acessível aos seus algoritmos.', resourceIds: ['cs50ai', 'fluencia'] },
  { id: 'dados', label: 'Dados', status: 'published', why: 'Analisar dados, consultar bancos de dados e usar computação para responder perguntas.', resourceIds: ['fgv-datasci', 'mit-60002', 'cs50sql'] },
  { id: 'seguranca-e-privacidade', label: 'Segurança e Privacidade', status: 'published', why: 'Proteger sistemas, contas e dados pessoais: fundamentos de segurança digital e de proteção de dados.', resourceIds: ['cisco-cyber', 'fgv-security', 'fgv-privacy'] },
  { id: 'git-e-github', label: 'Git e GitHub', status: 'planned', why: 'Controlar versões de código e colaborar em projetos. Aguarda um recurso gratuito verificado.', resourceIds: [] },
];

export const publishedTracks = (): TechTrack[] => techTracks.filter((track) => track.status === 'published');
