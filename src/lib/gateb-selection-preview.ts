// Gate B T2 preview: ordered editorial selection and factual placement gaps.
// This module is staging-only. It never releases or publishes resources, and it is not
// imported by any page, layout, component or production script.
//
// Selection stores IDs, not a second resource catalogue. Every ID and position is
// independently compared in tests to the Gate B review-05 JSON manifesto.
import {
  publishedResources, resourceProblems,
  type LearningResource, type PublishedLearningResource,
} from './learning-resources.ts';
import { STAGED_RESOURCES } from './staging.ts';
import { GATEB_NEW_RESOURCES } from './staging-gateb.ts';
import { featuredProblems } from './featured.ts';
import { placementOf } from './placement.ts';
import { PATH_ORDER, type PathId } from './taxonomy.ts';

export const GATEB_SELECTION_AUTHORIZES_PUBLICATION = false as const;
export const GATEB_DRAFT_SELECTION: Readonly<Record<PathId, readonly string[]>> = {
  'ensino-fundamental': [
    'ef-sme-alfabeto-1',
    'sme-goiania-letras-e-palavras',
    'ef-sme-vegetacao-3',
    'ef-sme-municipio-4',
    'ef-sme-vestigios-5',
    'sme-goiania-leitura-em-foco',
    'ef-obmep-fracoes-6',
    'ef-sme-tecnologia-vida-7',
    'ef-obmep-potenciacao-8',
    'ef-sme-funcoes-9',
  ],
  'ensino-medio': [
    'kultivi-math-enem',
    'kultivi-portuguese-enem',
    'kultivi-physics-enem',
    'kultivi-chemistry-enem',
    'kultivi-biology-enem',
    'kultivi-history-enem',
    'kultivi-geography-enem',
    'kultivi-philosophy-enem',
    'kultivi-sociology-enem',
    'kultivi-english-enem',
  ],
  'vestibulares': [
    'kultivi-enem-completo',
    'kultivi-writing-enem',
    'inep-enem-provas-gabaritos',
    'fuvest-acervo-2026',
    'inep-writing-2026',
    'cecierj-pvs-portugues-v1',
    'cecierj-pvs-matematica-mod1',
    'cecierj-pvs-historia-mod2',
    'cecierj-pvs-geografia-mod1',
    'cecierj-pvs-fisica-v1',
  ],
  'pre-militar': [
    'ita-provas-anteriores',
    'pm-cn-provas',
    'pm-en-provas',
    'pm-eear-provas',
    'pm-eam-provas',
    'pm-afa-provas',
    'pm-epcar-provas',
    'cecierj-aprovarj',
    'pm-esa-provas-2026',
    'pm-ime-provas',
  ],
  'ensino-superior': [
    'mit-1801sc',
    'mit-801sc',
    'mit-7012',
    'yale-psyc-110',
    'yale-econ-252',
    'ou-environment-treading-lightly',
    'mit-6100l',
    'mit-60002',
    'mit-6006',
    'mit-6042j',
  ],
  'tecnologia': [
    'cs50x',
    'cs50p',
    'odin-foundations',
    'google-mlcc',
    'ms-learn-cloud-concepts',
    'fb-python',
    'fb-web',
    'cs50w',
    'cs50ai',
    'cs50sql',
  ],
};

/** An unresolved placement, not a promise that the user-facing page already displays it. */
export interface GateBPlacementRequirement {
  readonly target: '/ensino-superior/' | '/tecnologia/';
  readonly next: string;
}

/** Nine candidates whose rendering relies on the conditional grouping/track plans.
 *  These plans define potential page anchors, not actual publication or activation.
 *  Their nine default-production destinations stay absent until a separate release. */
export const GATEB_PLACEMENT_REQUIREMENTS: Readonly<Record<string, GateBPlacementRequirement>> = {
  'mit-1801sc': { target: '/ensino-superior/', next: "Acrescentar ao grupo existente de Matemática, sem duplicar MIT 18.06." },
  'mit-801sc': { target: '/ensino-superior/', next: "Criar grupo de Física quando o curso for publicado." },
  'mit-7012': { target: '/ensino-superior/', next: "Criar grupo de Biologia quando o curso for publicado." },
  'yale-psyc-110': { target: '/ensino-superior/', next: "Criar grupo de Psicologia sem prometer créditos acadêmicos." },
  'yale-econ-252': { target: '/ensino-superior/', next: "Criar grupo de Economia sem prometer matrícula universitária." },
  'ou-environment-treading-lightly': { target: '/ensino-superior/', next: "Criar grupo de Meio Ambiente, mantendo a classificação de participação correta." },
  'odin-foundations': { target: '/tecnologia/', next: "Adicionar à trilha existente Desenvolvimento Web, preservando sua ordem." },
  'google-mlcc': { target: '/tecnologia/', next: "Adicionar à trilha existente Inteligência Artificial." },
  'ms-learn-cloud-concepts': { target: '/tecnologia/', next: "Adicionar seção de recursos de Nuvem à página Tecnologia, ou trilha real verificada; não classificar Nuvem como Segurança apenas para passar o validador." },
};

const isVerified = (resource: LearningResource): resource is PublishedLearningResource =>
  resource.url !== null && resource.verified !== undefined;

const available = (): readonly LearningResource[] =>
  [...publishedResources, ...STAGED_RESOURCES, ...GATEB_NEW_RESOURCES];

/** Resolves IDs only against records already present in the typed catalogue/staging.
 *  Throws rather than dropping missing or duplicated IDs. */
export const gatebSelectedResources = (): LearningResource[] => {
  const resources = available();
  const byId = new Map(resources.map((resource) => [resource.id, resource]));
  if (byId.size !== resources.length) throw new Error('gateb: duplicate catalogue/staging IDs');
  return PATH_ORDER.flatMap((path) => GATEB_DRAFT_SELECTION[path].map((id) => {
    const resource = byId.get(id);
    if (!resource) throw new Error(`gateb: missing selected resource ${id}`);
    return resource;
  }));
};

/** Test the draft against the real production featured selection validator.
 *  All sources are simulated as potentially publishable, but do not enter publishedResources. */
export const gatebDraftProblems = (at: Date = new Date()): string[] => {
  const selected = gatebSelectedResources();
  const invalidSources = selected.flatMap((resource) => resourceProblems(resource, at));
  const missingProof = selected.filter((resource) => !isVerified(resource))
    .map((resource) => `gateb: ${resource.id} lacks a verified HTTPS source`);
  return [
    ...invalidSources,
    ...missingProof,
    ...featuredProblems(GATEB_DRAFT_SELECTION, 'final', selected.filter(isVerified)),
  ];
};

/** Dry-run only: hypothetically activate all paths and include all 74 actual typed
 *  records as potential catalogue entries. This does not mutate publishedResources.
 *  The normal placementOf() call still sees only the 37 public resources. */
const hypotheticalStates = (): Record<PathId, 'active'> =>
  Object.fromEntries(PATH_ORDER.map((path) => [path, 'active'])) as Record<PathId, 'active'>;

export const gatebProjectedContext = (): readonly LearningResource[] => available();

/** After the conditional field and technology plans, every one of the 60 candidates
 *  has a future internal destination. Any missing link fails T2 before promotion. */
export const gatebPlacementGaps = (): readonly string[] => {
  const states = hypotheticalStates();
  const futureResources = gatebProjectedContext();
  return gatebSelectedResources()
    .filter((resource) => placementOf(resource, states, futureResources) === null)
    .map((resource) => resource.id);
};

/** These nine IDs are still not routed by the real published-only data context.
 *  This should stay nine until an explicitly authorized publication is prepared. */
export const gatebUnreleasedDestinations = (): readonly string[] => {
  const states = hypotheticalStates();
  return gatebSelectedResources()
    .filter((resource) => placementOf(resource, states) === null)
    .map((resource) => resource.id);
};
