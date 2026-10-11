# Pexis Academy V0.1: arquitetura e design

Data: 2026-10-11
Status: especificação. Nada aqui está implementado.
Branch: `claude/pexis-academy-v01`, criada a partir de `main` em `dd15aa4`.
Escopo desta execução: observação e arquitetura. Nenhum componente, página ou dado foi alterado.

---

## 0. Resumo

O repositório deixa de ser o site pessoal de Guilherme Henrique e passa a ser a **Pexis Academy**: um produto educacional gratuito, em português, que orienta estudantes do Ensino Médio, de vestibulares e de tecnologia até recursos gratuitos, oficiais e verificados.

A transformação é um **cutover total**. Saem a Home narrativa, o currículo-terminal, o footer pessoal, os dados pessoais e a estrutura bilíngue EN/PT. Sobrevivem o **catálogo verificado da biblioteca** (`learning-resources.ts`), as **regras de curadoria**, a **infraestrutura de build e verificação** e parte da **camada visual** de recursos.

O produto se organiza pelo fluxo:

```
OBJETIVO → ÁREA → MATÉRIA (ASSUNTO) → CONTEÚDO → PRÁTICA → APROFUNDAMENTO
```

A Home orienta e não despeja conteúdo. Cursos externos são fontes; o produto é a direção.

---

## 1. Estado observado

Medido nesta execução, e não suposto.

### 1.1 Git

| Item | Observado |
|---|---|
| `origin/main` | `dd15aa4cfb2a8bac46a6b69fe51f7321ab329c7d`: igual ao SHA esperado. |
| `main` local | Estava em `5cbc5dd` (atrasado, sem commits locais, árvore limpa). Avançado com `git merge --ff-only origin/main`. Não houve divergência de conteúdo, só atraso local. |
| Branch de trabalho | `claude/pexis-academy-v01`, criada em `dd15aa4`. Não existe no remoto. |
| Histórico recente de `main` | `dd15aa4` Courses: simplify information hierarchy (#28) · `f4e97ea` Courses: expand into a free learning library (#27) · `5cbc5dd` Resume (#26) · `f9651a6` Home (#25) |
| Branches locais antigas | Vários `claude/*` já mergeados, mais os rascunhos não publicados `design/frutiger-aero-v01`, `design/living-world-v01`, `design/home-narrative-terminal-v01` e `design/resume-terminal-v01`. Não foram tocados. |

### 1.2 Stack e infraestrutura

- **Astro 7.3.6**, `output: 'static'`, `trailingSlash: 'always'`, `build.format: 'directory'`, `site: https://guilhermehrcst.github.io`.
- **TypeScript 6.0.3** strict, `@astrojs/check 0.9.10`. A única dependência de runtime além do Astro é `@fontsource-variable/google-sans-flex` (fonte self-hosted).
- **Sem React** e sem nenhum outro framework de UI. Os scripts de cliente são TypeScript nativo.
- **Testes:** runner nativo do Node 22 (`node --experimental-strip-types --test`), 8 arquivos e 54 testes.
- **`scripts/verify-dist.mjs`** valida invariantes pós-build sobre o `dist/` e falha o deploy se algum for violado.
- **Deploy:** `.github/workflows/deploy.yml`, em dois jobs. O build roda em `ubuntu-24.04` com token read-only. O deploy só acontece na `main` e é o único job com `pages: write`. Sequência: `npm test` → `astro check` → `npm run build`.
- **Ausentes:** `sitemap.xml`, `robots.txt`, `404.astro`, imagem Open Graph e qualquer mecanismo de redirect.
- **Lixo versionado:** os arquivos `index.html`, `pt/index.html` e `assets/style.css` na raiz do repositório são do site pré-Astro. O deploy publica só o `dist/`, então eles não vão ao ar, mas continuam versionados. `.nojekyll` também é legado.
- **README desatualizado:** cita `src/lib/courses.ts` e `CourseCard.astro`, que não existem mais.

### 1.3 Baseline medido nesta execução

```
npm test          → 54 pass, 0 fail
npx astro check   → 0 errors, 0 warnings, 0 hints
npm run build     → 10 páginas; verify-dist: 10 pages, 291 files — all invariants hold
```

### 1.4 Rotas publicadas hoje

| Rota EN | Rota PT | Produto |
|---|---|---|
| `/` | `/pt/` | Home pessoal: narrativa em 10 capítulos com terminal narrador. |
| `/resume/` | `/pt/curriculo/` | Currículo como sessão de terminal. |
| `/courses/` | `/pt/cursos/` | Biblioteca de recursos com 8 áreas e filtros de objetivo e formato. |
| `/courses/enem/` | `/pt/cursos/enem/` | Trilha ENEM. |
| `/courses/uerj/` | `/pt/cursos/uerj/` | Trilha UERJ. |

O inglês está na raiz e o português em `/pt/`. A paridade entre os idiomas é garantida pelo tipo `Dict` (`src/i18n/types.ts`).

### 1.5 Domínio de aprendizagem existente

- **`src/lib/learning-resources.ts`** (157 linhas): o catálogo central e tipado.
  - **Tipos fechados:** `LearningAreaId` (8), `LearningSubjectId` (13), `LearningGoalId` (`high-school | enem | uerj | vestibular`), `LearningFormatId` (`course | track | playlist | lessons | practice`), além das seções e tópicos de tecnologia.
  - **Verificação:** cada recurso carrega `verified: { on, by, freeAccess: true }`. `publishedResources` contém apenas recursos com `url` e `freeAccess` verificado.
  - **Validação em tempo de build:** coerência entre área e matéria, HTTPS, registro de verificação, nota de revisão para recursos retidos e ids únicos. Se falhar, o build quebra.
  - **Conteúdo atual:**
    - 20 recursos de tecnologia, dos quais 17 publicados e 3 retidos com nota (Microsoft/IBM).
    - 12 cursos Kultivi "X para ENEM".
    - 1 cartilha INEP de Redação 2026.
    - 7 coleções de questões da Revista do Vestibular UERJ.
- **`src/lib/study-tracks.ts`:** trilhas ENEM e UERJ como seções ordenadas de ids. As seções `start` e `recommended` estão vazias nos dois exames, e `writing` está vazia na UERJ.
- **`src/lib/learning-library.ts`:** helpers puros `filterResources`, `resourcesByArea` e `resourcesByIds`.
- **`src/lib/course-filter-state.ts`** e **`src/scripts/course-filters.ts`:** filtro progressivo no cliente, que falha aberto (a UI fica `hidden` até o script ligar).
- **`src/lib/providers.ts`:** marcas dos provedores (Harvard, MIT, FGV, Cisco, Bradesco, Microsoft) com bbox e altura óptica medidas.
- **`src/lib/resource-images.ts`:** 6 imagens curadas de cursos de tecnologia.
- **Documentos:**
  - `docs/superpowers/specs/2026-10-11-courses-learning-library-design.md`: a regra de acesso 100% gratuito e o padrão de curadoria.
  - `docs/superpowers/research/2026-10-11-learning-library-sources.md`: a auditoria de fontes, incluindo as páginas oficiais do INEP e o FAQ da UERJ como evidência da estrutura atual do Exame Discursivo.

### 1.6 Achados críticos da observação

1. **O site pessoal está entranhado na biblioteca.**
   - `Courses.astro` lê o e-mail pessoal de `dicts[lang].contact` para o CTA "sugira um recurso".
   - `Courses.astro` e `StudyTrack.astro` terminam com `Monument.astro`, cujo footer imprime "Guilherme Henrique" em tipografia monumental.
   - `Base.astro` publica `og:site_name = "Guilherme Henrique"`.
   - `Header.astro` usa o nome pessoal como marca.
   - Matar o site pessoal exige, portanto, cortar essas dependências; apagar arquivos não basta.
2. **A taxonomia atual diverge da taxonomia de produto pedida.**
   - Os dados têm 8 áreas: Tecnologia, Matemática, Português, Redação, Natureza, Humanas, Inglês e Espanhol.
   - A Home pedida tem 6 áreas: Matemática, Linguagens, Ciências da Natureza, Ciências Humanas, Idiomas e Tecnologia.
   - Português e Redação viram matérias de Linguagens, e Inglês e Espanhol viram matérias de Idiomas.
   - Além disso, `area` e `subject` são campos duplicados em cada recurso e mantidos coerentes só por validação: duas fontes de verdade para o mesmo fato.
3. **Faltam recursos para partes do mapa pedido.** Não há nenhum recurso verificado de Git e GitHub, nenhum de redação para UERJ fora do acervo de questões, e nenhum de Química, Biologia, Filosofia, Sociologia ou Inglês para UERJ. A V0.1 não pode fingir essas lacunas.
4. **Existem recursos sem casa no mapa pedido.** Os três recursos de Segurança (Cisco, FGV Segurança e FGV Privacidade) não pertencem a nenhuma das trilhas de Tecnologia listadas.
5. **O `verify-dist` é metade produto pessoal.** Ele tem invariantes de 10 capítulos, de passos do currículo, do terminal narrador e uma `EXTERNAL_ALLOW` com LinkedIn, Instagram, GitHub pessoal, Lume e Pexiscale. Essas regras precisam ser substituídas; desligá-las sem colocar outras no lugar não é aceitável.
6. **O domínio é pessoal.** `guilhermehrcst.github.io` carrega o nome de uma pessoa, e o produto se chama Pexis Academy. Isso afeta SEO e confiança. Ver §11, R1.

---

## 2. Dívida técnica e componentes reutilizáveis

### 2.1 Dívida técnica

| Item | Impacto | Ação na V0.1 |
|---|---|---|
| `area` e `subject` duplicados em cada recurso | Duas fontes de verdade, mantidas coerentes só por validação | `subject` passa a ser a fonte; a área é derivada (§6.1) |
| i18n EN/PT com o inglês na raiz | Contradiz "`/` é português" | Remover o EN; manter a costura tipada (§6.6) |
| Dicionários `en.ts` e `pt.ts` (410 linhas cada), majoritariamente com texto pessoal | Peso morto | Substituir por um dicionário PT enxuto do produto |
| `study-tracks.ts` com seções vazias (`start`, `recommended`) renderizadas como "editoriais" | Prometem conteúdo que não existe | Substituir por guias de prova com seções que nunca ficam vazias (§6.4) |
| `verify-dist.mjs` com invariantes pessoais | Bloqueia o cutover e protege o produto errado | Reescrever com os invariantes do novo produto (§9) |
| Arquivos legados na raiz (`index.html`, `pt/index.html`, `assets/style.css`) | Confusão e risco de serem servidos se o modo do Pages mudar | Remover |
| README desatualizado | Documentação mente | Reescrever |
| `global.css` com tokens de Lume, terminal narrador, display monumental e `--fit-name` | Peso morto e acoplamento | Reduzir aos tokens do novo sistema |
| `motion.ts` com o dither, o esquema do Lume e a subida do nome | Peso morto | Manter só o reveal sutil e fail-open, se ele se justificar |
| Sem `sitemap`, `robots.txt` ou `404` | SEO e recuperação fracos | Criar (§8) |

### 2.2 Reutilizável

| Ativo | Reuso |
|---|---|
| `learning-resources.ts`: catálogo, tipos, verificação e validação | **Preservado.** Migração mecânica: remover `area`, mantendo `subject` como chave. |
| Doc de curadoria e auditoria de fontes | **Preservados** como política vigente. |
| `learning-library.ts` (filtros puros) | Preservado como helper de build; a UI de filtros sai (§5.3). |
| `providers.ts` e `CourseProvider.astro` (marcas medidas) | Preservados. |
| `LearningResourceCard.astro` | Adaptado: mantém fatos, CTA e marca do provedor; sai a "plate" numerada de curadoria pessoal. |
| `resource-images.ts` e as 6 imagens de cursos | Opcional. A V0.1 recomenda não usar imagens em cartões, por foco e peso; os arquivos ficam até uma decisão visual. |
| `ExternalLinkIcon.astro` (Radix, MIT) | Preservado. |
| `Base.astro` (estrutura de head, skip link, gate de motion fail-open) | Reescrito por cima da mesma estrutura. |
| Fonte Google Sans Flex self-hosted e licenças em `/licenses/` | Preservadas; não há request de terceiros. |
| `verify-dist.mjs`: o esqueleto (walk, assets, segredos, links internos, hosts externos, `rel`) | Preservado; as regras de produto são substituídas. |
| Workflow de deploy | Preservado sem mudança. |
| Teste `hidden-state` (`[hidden]` sempre vence) | Preservado; protege qualquer UI progressiva. |

---

## 3. O que morre com o site pessoal

Tudo abaixo é removido do repositório na implementação. O histórico do Git preserva cada arquivo.

**Componentes:**
- `About`, `Command`, `Contact`, `ContactIcon`, `DitherBand`, `Hero`, `Home`, `HomeAiWorkflow`, `HomeCapabilities`, `HomeChapter`, `HomeEducation`, `HomeInfluences`, `HomeNarrative`, `Label`¹
- `Lume`, `Monument`, `NarrativeTerminal`, `PexisMachine`, `Pexiscale`, `Principles`, `ProjectDetail`
- `Resume`, `ResumeInfluences`, `ResumeProjects`, `Statement`, `TermStep`
- `Courses`, `CourseFilters`, `StudyTrack` e `StudyTrackSection`, que são substituídos

**Lib:**
- `ai-tools`, `dither`, `influence-roster`, `influences`, `institutions`
- `lume-model`, `narrative-content`, `narrative-state`, `resume-session`
- `course-filter-state`, junto com a UI de filtros
- `study-tracks`, substituído por `exam-guides`

**Scripts:** `narrative-terminal.ts`, `resume-session.ts`, `course-filters.ts`, e a maior parte de `motion.ts`.

**Páginas:** todas em `src/pages/` (`/`, `/pt/`, `/resume/`, `/pt/curriculo/`, `/courses/**`, `/pt/cursos/**`). As rotas antigas recebem um tratamento explícito (§8.4).

**i18n:** `en.ts`; `pt.ts` e `types.ts` são reescritos.

**Assets:** `src/assets/{ai,contact,hero,influences,institutions,pexiscale}/**`, inclusive a foto pessoal `hero/guilherme.jpg`.

**Testes:** `narrative-state`, `narrative-content`, `resume-session`, `course-filter-state`.

**Raiz legada:** `index.html`, `pt/index.html`, `assets/style.css`.

**Metadados e dados pessoais:**
- o nome em `og:site_name`, no header e no footer
- e-mail, LinkedIn, Instagram, GitHub pessoal, Lume e Pexiscale em `EXTERNAL_ALLOW`
- a descrição pessoal do README

¹ `Label.astro` só é mantido se um componente novo precisar exatamente dele. Por padrão, morre.

---

## 4. O que sobrevive da biblioteca

| Sobrevive | Como |
|---|---|
| **Todos os 37 recursos publicados** e os 3 retidos com nota | O mesmo id, URL, fatos e registro de verificação. Nenhum recurso é reescrito sem reverificação. |
| **A regra de acesso absoluto gratuito** | Sem trial, paywall, teaser ou afiliado. Cadastro gratuito é permitido. Certificado pago opcional é permitido se o conteúdo for gratuito. |
| **O padrão de curadoria** | Link primário, provedor confiável, recurso verificado, preferência por material oficial, nunca URL deduzida. |
| **A validação em build** | Mantida e estendida à nova taxonomia. |
| **As marcas de provedores** | Mantidas. |
| **A evidência de fontes oficiais** | INEP (provas e gabaritos, matrizes de referência, cartilha de redação) e o FAQ e a Revista do Vestibular da UERJ. |

O que **não** sobrevive da biblioteca:
- a página-catálogo única com 8 `<details>`
- os filtros de objetivo e formato
- a numeração "curator's picks"
- o CTA de sugestão por e-mail pessoal
- as seções vazias das trilhas

---

## 5. Escopo exato da V0.1

### 5.1 Rotas publicadas (indexáveis)

| Rota | Papel | Fonte de conteúdo |
|---|---|---|
| `/` | Home: orienta | taxonomia |
| `/enem/` | Hub de preparação ENEM | `exam-guides`, catálogo, INEP |
| `/uerj/` | Hub de preparação UERJ, com personalidade própria | `exam-guides`, catálogo, UERJ |
| `/ensino-medio/` | Objetivo: estudar o Ensino Médio | taxonomia, catálogo (`high-school`) |
| `/vestibulares/` | Objetivo: vestibulares em geral | taxonomia, catálogo (`vestibular`) |
| `/tecnologia/` | Objetivo e área: trilhas de tecnologia | `tech-tracks`, catálogo |
| `/materias/` | Índice de áreas e matérias; é o destino de "Explorar" | taxonomia |
| `/materias/{matematica,portugues,redacao,fisica,quimica,biologia,historia,geografia,filosofia,sociologia,ingles,espanhol}/` | Página de matéria: mapa de aprendizagem e recursos | taxonomia, catálogo |
| `/buscar/` | Índice pesquisável, que funciona sem JS | índice derivado |
| `/sobre/` | O que é a Pexis Academy, regras de curadoria, verificação e não afiliação | dicionário |

São **21 páginas indexáveis** (1 Home + 5 objetivos + `/materias/` + 12 matérias + `/buscar/` + `/sobre/`), mais a `404` e as páginas de redirect (§8.4).

**Rotas adicionadas além da lista pedida, com justificativa:**
- **`/materias/`:** uma URL `/materias/matematica/` implica um pai. Sem ele, quem apaga o final da URL cai num 404. Essa página também resolve o destino de "Explorar" no header sem criar outro conceito.
- **`/buscar/`:** é o fallback sem JS do item "Buscar" do header (§7.6). Sem essa página, o item "Buscar" seria um botão que não funciona sem JS.

### 5.2 Home V0.1

Ordem fixa. Cada seção se justifica pela função de orientar.

1. **Hero:** título "Aprenda com direção." (provisório; o texto fica no dicionário), uma frase de apoio e o CTA "Escolher meu objetivo" (âncora para `#objetivo`).
2. **QUAL É O SEU OBJETIVO?** (`#objetivo`): ENEM, UERJ, Ensino Médio, Vestibulares, Tecnologia, nessa ordem. Cada item tem uma frase e um link para a rota do objetivo.
3. **EXPLORE POR ÁREA** (`#areas`): Matemática, Linguagens, Ciências da Natureza, Ciências Humanas, Idiomas, Tecnologia, nessa ordem. Cada área mostra o nome e as matérias como links diretos.
4. **COMO ESCOLHEMOS OS RECURSOS:** três regras curtas (gratuito de verdade, fonte primária, verificado em data), com link para `/sobre/`. Essa seção se justifica: confiança é a proposta de valor e o que diferencia a Pexis Academy de uma lista de links.
5. **Footer:** marca, links de objetivos e matérias, `/sobre/`, a data da última verificação do catálogo (derivada de `VERIFIED_ON`, não digitada) e as licenças.

**Seções adiadas, cada uma com o motivo:**

| Seção | Motivo |
|---|---|
| Trilhas em destaque | Duplicaria o bloco "Objetivo" com apenas 7 trilhas de tecnologia. |
| Prática | Hoje é só UERJ e INEP; o lugar dela é dentro dos objetivos. |
| Materiais gratuitos | É a própria natureza do produto, não uma seção. |
| Como funciona | O fluxo já é a Home. |
| FAQ | Não há perguntas reais coletadas; FAQ inventado é conteúdo falso. |
| Mega footer | Basta o footer com o mapa do site; a V0.1 tem 21 páginas. |

A Home **não** lista recursos. Nenhum cartão de curso aparece na Home.

### 5.3 Reduções deliberadas de escopo

| Pedido ou expectativa | Decisão V0.1 | Motivo |
|---|---|---|
| Filtros por objetivo e formato | **Removidos da UI.** Os helpers puros ficam. | Cada página já é um recorte (objetivo ou matéria) com 1 a 12 recursos; filtros em listas tão curtas são ruído. A busca cobre a descoberta transversal. |
| Páginas de assunto (`/materias/matematica/funcoes/`) | **Não publicadas.** A arquitetura suporta (§6.2). | Não há recursos verificados por assunto. Uma página de assunto vazia é conteúdo falso. |
| Trilha "Git e GitHub" | **Não publicada** até existir ao menos um recurso verificado. | Não há nenhum no catálogo. A trilha existe no modelo como `planned` e não renderiza. |
| `/en/` | **Fora.** | Pedido explícito. A costura de i18n permanece (§6.6). |
| Imagens em cartões | **Fora por padrão.** | Foco tipográfico e peso; as 6 imagens só existiam para tecnologia. |
| Seções da Home além das 4 | **Fora** (tabela da §5.2). | Cada seção precisa se justificar. |
| Progresso e "continue aprendendo" | **Fora.** Nenhum estado local. | Pedido explícito; progresso falso é proibido. |

### 5.4 Fora da V0.1 (não-objetivos)

Ver §12.

---

## 6. Arquitetura de conteúdo, componentes e rotas

### 6.1 Modelo de conteúdo

O conteúdo continua em **módulos TypeScript tipados** (`src/lib/`), validados em build.

Content collections do Astro (Zod) não foram adotadas. Os módulos atuais já dão schemas fechados (union types), validação em build e zero dependência nova. Migrar para collections custaria esforço sem ganho mensurável na V0.1. A decisão deve ser revisada se o conteúdo passar a ser escrito em Markdown longo (artigos de assunto).

**Entidades:**

```ts
// taxonomy.ts: objetivos, áreas, matérias e assuntos
type ObjectiveId = 'enem' | 'uerj' | 'ensino-medio' | 'vestibulares' | 'tecnologia';
type AreaId = 'matematica' | 'linguagens' | 'natureza' | 'humanas' | 'idiomas' | 'tecnologia';
type SubjectId =
  | 'matematica' | 'portugues' | 'redacao'
  | 'fisica' | 'quimica' | 'biologia'
  | 'historia' | 'geografia' | 'filosofia' | 'sociologia'
  | 'ingles' | 'espanhol'
  | 'tecnologia';

interface Subject {
  id: SubjectId;
  area: AreaId;              // a área é atributo da matéria, e só dela
  slug: string;              // segmento de URL legível, igual ao id na V0.1
  topics: readonly Topic[];  // o mapa de aprendizagem; pode ser vazio
}

interface Topic {
  id: string;                // estável; vira slug em /materias/{subject}/{topic}/
  source: TopicSourceId;     // obrigatório: de onde vem este assunto
  published: false;          // V0.1: nenhum assunto tem página
}

type TopicSourceId = 'inep-matriz-enem';  // fechado; cada nova fonte entra pela auditoria
```

**Regras:**

- **`subject` é a única fonte da área.**
  - O campo `area` sai de `LearningResource`; `areaOf(resource)` é derivado de `SUBJECTS[resource.subject].area`.
  - As 8 `LearningAreaId` atuais são substituídas pelas 6 `AreaId` de produto.
  - Os ids de matéria passam para português, para coincidir com a URL. A migração é um renomeio mecânico e testado (§10, passo 2).
- **Os recursos de tecnologia mantêm `subject: 'tecnologia'`**, e os sub-tópicos de tecnologia continuam em `technology.topic`.
- **Assunto exige fonte.**
  - Um `Topic` sem `source` não compila.
  - A fonte aceita na V0.1 é a Matriz de Referência do ENEM (INEP), página oficial já registrada na auditoria.
  - O mapa de Matemática proposto (Fundamentos, Aritmética, Álgebra, Funções, Geometria, Trigonometria, Estatística, Probabilidade) só é publicado depois que cada item for conferido contra os objetos de conhecimento da Matriz. Item sem correspondência não entra.
  - Uma matéria sem mapa verificado publica `topics: []`, e a página mostra só os recursos. **Não se inventa currículo.**
- **`LearningGoalId`** passa a ser `ObjectiveId` menos `tecnologia`, com os ids renomeados para coincidir com as rotas: `high-school → ensino-medio`, `vestibular → vestibulares`.
  - Tecnologia não é uma tag de objetivo: é a área.
- **`LearningFormatId`** não muda. Ele dá o rótulo de formato no cartão e a separação entre CONTEÚDO e PRÁTICA nas páginas (`practice` vai para a seção de prática).

### 6.2 Rotas: fonte única

`src/lib/routes.ts` (substitui `i18n/routes.ts`) **deriva** as URLs da taxonomia:

```ts
routes.home                  // '/'
routes.objective(id)         // '/enem/', '/ensino-medio/', ...
routes.subjectIndex          // '/materias/'
routes.subject(id)           // '/materias/matematica/'  (tecnologia → '/tecnologia/')
routes.topic(subject, topic) // '/materias/matematica/funcoes/': só existe se topic.published
routes.search, routes.about
```

**Regras:**

- **Nenhuma página escreve URL interna literal.** Todo link interno passa por `routes`. O `verify-dist` confirma que cada link interno resolve.
- **`/tecnologia/` é a página da matéria e do objetivo Tecnologia.**
  - `routes.subject('tecnologia')` aponta para ela.
  - Não existe `/materias/tecnologia/`, para evitar conteúdo duplicado.
- **Agrupamento técnico sem vazar para a URL:** objetivos, áreas e matérias são grupos no código; as URLs continuam humanas e rasas.
- **Assuntos futuros:** `src/pages/materias/[subject]/[topic].astro` com `getStaticPaths` filtrando `published: true`. Na V0.1 o arquivo **não é criado**: a capacidade está no modelo e em `routes`, e não em uma página vazia.

### 6.3 Páginas e o papel de cada uma

**Objetivos.** São arquivos explícitos, não uma rota dinâmica, porque cada um tem personalidade própria.

- **`/enem/`** (hub de preparação, não lista de cursos):
  1. **Entenda a prova:** o que é, as 4 áreas e a redação. Cada afirmação é factual, verificada e linkada a uma página oficial do INEP. Não há datas nem notas de corte.
  2. **Estude por área:** links para as matérias, agrupados nas áreas do ENEM, com a contagem real de recursos.
  3. **Pratique:** provas e gabaritos oficiais do INEP e a cartilha de redação. A página "provas e gabaritos" é promovida a recurso publicado depois de reverificada.
  4. **Aprofunde:** os cursos marcados `enem`, agrupados por área.
- **`/uerj/`** (personalidade própria):
  1. **Entenda a prova:** a estrutura atual a partir do FAQ oficial (o Exame Discursivo com Redação para todos e duas disciplinas específicas). Afirmações não verificadas no momento da implementação não entram.
  2. **Monte sua preparação:** o candidato escolhe o curso e, pelas regras oficiais, descobre as disciplinas específicas. O site aponta para a fonte oficial e não replica tabelas de cursos.
  3. **Estude por matéria:** links para as matérias com recursos marcados `uerj`.
  4. **Resolva provas anteriores:** as 7 coleções da Revista do Vestibular UERJ. Esta é a espinha da página.
- **`/ensino-medio/`:** um mapa das áreas e matérias com uma frase de orientação e os recursos `ensino-medio` por matéria. Não pode ser uma cópia de `/materias/`: a diferença é o recorte por objetivo e a ordem de estudo sugerida pelas áreas.
- **`/vestibulares/`:** orientação geral, com destaque para a UERJ (único vestibular específico com fonte verificada) e os recursos `vestibulares`.
  - Não cita FUVEST, Unicamp ou outros sem verificação.
  - Deixa explícito que a tag `vestibulares` é relevância editorial, e não alegação de preparação oficial (regra já registrada na auditoria).
- **`/tecnologia/`:** organizada por **trilhas** (`src/lib/tech-tracks.ts`):

  | Trilha | Recursos (ids existentes) | Estado V0.1 |
  |---|---|---|
  | Começar a programar | cs50x, cs50p, fb-python | publicada |
  | Ciência da Computação | cs50x, mit-6006, mit-6042j, mit-1806 | publicada |
  | Desenvolvimento Web | cs50w, fb-web | publicada |
  | Python | cs50p, mit-6100l, fb-python | publicada |
  | Inteligência Artificial | cs50ai, fluencia | publicada |
  | Dados | fgv-datasci, mit-60002, cs50sql | publicada |
  | Segurança e Privacidade | cisco-cyber, fgv-security, fgv-privacy | **publicada: acréscimo à lista pedida** (ver nota) |
  | Git e GitHub | nenhum | `planned`, não renderiza |

  - **Nota sobre Segurança:** a trilha preserva recursos verificados que ficariam órfãos. A alternativa seria listá-los numa seção "Outros recursos". Ver a pergunta aberta Q3.
  - A composição exata de cada trilha é editorial e entra na revisão de conteúdo da implementação. A tabela é a proposta inicial, feita só com ids existentes.
  - Um recurso pode aparecer em mais de uma trilha (referência por id, sem duplicar a definição).
- **`/materias/`:** as 6 áreas com as suas matérias; é o destino de "Explorar".
- **`/materias/{matéria}/`**, sempre nesta ordem:
  1. **Mapa de aprendizagem:** os assuntos com fonte, como lista ordenada e sem links na V0.1. Se `topics: []`, o bloco não renderiza.
  2. **Conteúdo:** recursos com formato diferente de `practice`.
  3. **Prática:** recursos `practice`.
  4. **Por objetivo:** links para os objetivos em que esta matéria tem recursos marcados (derivados, não escritos à mão).

  Uma matéria com zero recursos publicados não é publicada. O teste e o `verify-dist` falham.

  > Estado atual: as 12 matérias têm ao menos 1 recurso Kultivi.
- **`/buscar/`:** §7.6.
- **`/sobre/`:**
  - o que é a Pexis Academy
  - as regras de curadoria, copiadas da política vigente
  - como é feita a verificação, e a data
  - a não afiliação com INEP, UERJ e os provedores
  - como reportar link quebrado: por issue no GitHub ou contato institucional da Pexis
  - sem dados pessoais
  - ver a pergunta aberta Q4

### 6.4 Guias de prova (`exam-guides.ts`)

Substitui `study-tracks.ts`.

- **Seções fechadas por exame:** ENEM tem `entenda | areas | pratique | aprofunde`; UERJ tem `entenda | prepare | materias | provas`.
- **Seções editoriais** (`entenda`, `prepare`) carregam `sources: OfficialSourceId[]`: links oficiais verificados, registrados num `official-sources.ts` com o mesmo shape de verificação dos recursos.
- **Seções de recursos são derivadas** do catálogo pelo `goal` e pelo `format`, nunca por lista de ids mantida à mão. A exceção é uma ordenação editorial opcional.
- **Invariante:** nenhuma seção renderiza vazia. Seção sem conteúdo é omitida, e um teste garante que as seções obrigatórias (`entenda`, e `pratique` ou `provas`) têm conteúdo.

### 6.5 Componentes

Todos são `.astro`, server-rendered, e não usam framework.

| Componente | Responsabilidade |
|---|---|
| `layouts/Base.astro` | `<head>` (título, descrição, canonical, OG, `lang="pt-BR"`), skip link, header, footer, `<main id="main">` |
| `SiteHeader.astro` | Marca, Explorar (→ `/materias/`), ENEM, UERJ, Tecnologia, Buscar (→ `/buscar/`, aprimorado com JS); `aria-current` |
| `SiteFooter.astro` | Mapa do site derivado de `routes`, `/sobre/`, data de verificação e licenças |
| `PageIntro.astro` | Eyebrow, H1 e lead; cada página tem exatamente um H1 |
| `ObjectiveList.astro` | Os 5 objetivos (Home) |
| `AreaList.astro` | As 6 áreas com as matérias (Home e `/materias/`) |
| `LearningMap.astro` | A lista ordenada de assuntos com a fonte citada |
| `ResourceList.astro` e `ResourceItem.astro` | Lista semântica (`<ul>`) de recursos com provedor, fatos e CTA externo; adaptado de `LearningResourceCard` |
| `ProviderMark.astro` | Renomeia `CourseProvider` |
| `TrackSection.astro` | Uma trilha ou seção de guia: título, porquê e `ResourceList` |
| `SourceNote.astro` | "Fonte oficial: …" com link e data de verificação |
| `SearchIndex.astro` | Índice completo server-rendered e o campo de busca progressivo |

Componentes pequenos e de propósito único. Nada de "Card" genérico com 12 props.

### 6.6 Idioma

- **Apenas `pt-BR` na V0.1.** `/` é português, e não existe `/pt/` nem `/en/`.
- O texto de interface fica em `src/i18n/pt.ts`, tipado por `Dict` (`types.ts`). O `Lang` passa a ser `'pt'`.
  - Para adicionar `/en/` no futuro: estender `Lang`, criar `en.ts` (o `astro check` força a paridade) e voltar a emitir `hreflang`.
  - Essa costura custa quase nada e evita retrabalho.
- **Nomes oficiais de recursos não são traduzidos** (já é a regra atual).
- **Sem `hreflang`** na V0.1: com uma única língua, a tag não acrescenta nada e pode estar errada.

### 6.7 Sistema visual: "acadêmica acolhedora"

**Tokens** (todos em `:root` de `global.css`; nenhum hex fora dali):

| Papel | Direção | Restrição |
|---|---|---|
| `--paper` | off-white quente e discreto | contraste do texto ≥ 4.5:1 medido (não estimado) |
| `--ink` | grafite, não preto puro | ≥ 7:1 sobre `--paper` no corpo de texto |
| `--muted` | grafite claro | ≥ 4.5:1 sobre `--paper` |
| `--rule` | hairline neutra | decorativa |
| `--action` | **azul Pexis funcional**: links primários, CTA, foco | ≥ 4.5:1 sobre `--paper` em texto; o branco sobre ele também ≥ 4.5:1 |
| `--surface` | um tom acima do papel, para agrupar sem sombra | — |

**O hex do azul Pexis não está no repositório.** Pergunta aberta Q1. Até a confirmação, o candidato é o `--gh-action #0B57D0` atual, que já é funcional e já foi medido em 6.4:1 com branco. O contraste sobre o off-white é revalidado na implementação.

**Regras:**

- **Tipografia:** Google Sans Flex (já self-hosted). Corpo ≥ 17px no mobile, `line-height` ≥ 1.5 e medida de leitura ≤ 70ch. Sem display monumental nem caixa alta em títulos longos.
- **Cor:**
  - Um único azul, com função. Sem gradientes e sem segunda cor de marca.
  - Sem cor por área (seis cores viraria site infantil ou dashboard).
- **Profundidade:** hairlines e espaço. Sem sombras pesadas e sem cartões flutuantes.
- **Movimento:** só o reveal sutil (opacidade e um pequeno deslocamento, uma vez), sempre fail-open.
  - Com `prefers-reduced-motion`, não há movimento.
  - Nenhum conteúdo depende de JS para aparecer.
- **Linguagem:** português claro e acolhedor. Sem emoji, sem urgência de cursinho ("garanta sua vaga") e sem jargão de SaaS.
- **Ritmo da Home:** a página do Claude Code foi usada como referência de ritmo (uma ideia por dobra, respiro generoso, blocos de entrada claros). Texto, cor, layout e identidade não foram copiados.
- **Mobile-first:**
  - Layout de uma coluna como base, com alvos de toque ≥ 44px e sem scroll horizontal da página.
  - Expandir em 640px e 1024px, a validar visualmente.

### 6.8 Busca

**Decisão:** busca **estática, client-side e sem infraestrutura externa**, com fallback total sem JS.

- **`buildSearchIndex()`** (`src/lib/search-index.ts`) é uma função pura. Ela gera as entradas a partir da taxonomia, do catálogo e das trilhas:
  - **Tipos de entrada:** objetivo, área, matéria, assunto (quando publicado), trilha, recurso.
  - **Campos de cada entrada:** `{ kind, title, url, context, terms }`.
  - Por construção, nenhuma entrada aponta para URL inexistente: as URLs vêm de `routes`.
- **`/buscar/` renderiza o índice inteiro como HTML**, em listas agrupadas por tipo. Sem JS, essa é uma página de diretório completa e útil.
- **Com JS:**
  - Um `<input type="search">` filtra as entradas já presentes na página.
  - Normalização: minúsculas e sem acentos ("matematica" encontra "Matemática").
  - Uma região `aria-live="polite"` anuncia a contagem.
  - O estado `?q=` lê e escreve na URL, para que o resultado possa ser compartilhado.
  - Sem fetch e sem JSON externo.
- **No header**, "Buscar" é um link para `/buscar/`. Nada de modal na V0.1, porque modal exige gerenciar o foco e não melhora a escala atual.
- **Limite de escala:** com cerca de 70 entradas, o HTML inline é o mais simples. Acima de cerca de 500 entradas, o índice migra para um JSON gerado em build e carregado sob demanda. Esse gatilho fica documentado no código.

### 6.9 Estado local

**A V0.1 não persiste nada no navegador**: sem `localStorage`, sem cookies, sem analytics.

Qualquer proposta futura (ex.: "objetivo escolhido") exige uma spec própria antes da implementação, com:
- o dado guardado
- a finalidade
- como apagar
- o comportamento sem o dado

Isso é coerente com a postura da Pexis em consentimento e privacidade.

---

## 7. Qualidade (ordem de prioridade)

clareza > hierarquia > acessibilidade > responsividade > velocidade > SEO > manutenibilidade > estética.

- **Acessibilidade (WCAG 2.2 AA):**
  - landmarks (`header`, `nav`, `main`, `footer`), um H1 por página e hierarquia de headings sem saltos
  - listas semânticas
  - links reais com rótulo significativo; links externos avisam que abrem em nova aba
  - foco visível
  - contraste medido
  - operável por teclado
  - reduced motion respeitado
  - nada que exista só via JS
- **Velocidade:**
  - zero request de terceiros
  - fonte self-hosted e pré-carregada
  - JS só em `/buscar/`, mais o gate de motion
  - sem imagens obrigatórias
  - meta: Home com menos de 50 KB de HTML e CSS comprimidos e LCP sem imagem (meta, ainda não medida)
- **Sem JS:** todas as páginas são completas, e a busca vira um diretório.

---

## 8. SEO e rotas antigas

### 8.1 Metadados por página

- **`<title>`:** "{Página} | Pexis Academy", com no máximo cerca de 60 caracteres. Na Home: "Pexis Academy: aprenda com direção".
- **`<meta name="description">`:** de 70 a 160 caracteres, única por página e sem keyword stuffing.
- **`<link rel="canonical">`:** URL absoluta derivada de `routes` e `site`.
- **Open Graph:** `og:type`, `og:title`, `og:description`, `og:url`, `og:locale=pt_BR` e `og:site_name=Pexis Academy`.
  - `og:image` fica fora da V0.1 (não há arte aprovada). O `twitter:card` é `summary`.
- **`<html lang="pt-BR">`.**

### 8.2 sitemap e robots

- **`src/pages/sitemap.xml.ts`:** endpoint estático gerado a partir de `routes` (só páginas indexáveis), **sem dependência nova**. O `@astrojs/sitemap` foi preterido para evitar uma dependência e manter a lista sob controle explícito.
- **`public/robots.txt`** (ou endpoint): `User-agent: *`, `Allow: /` e `Sitemap: {site}/sitemap.xml`.
- **Invariante:** o conjunto de URLs do sitemap é exatamente o conjunto de páginas indexáveis do `dist/`. Redirects e a 404 ficam fora.

### 8.3 Conteúdo duplicado

| Risco | Como é evitado |
|---|---|
| A mesma matéria em duas URLs | A tecnologia existe só em `/tecnologia/`. |
| `/ensino-medio/` repetir `/materias/` | Papéis diferentes e verificados na revisão de conteúdo (§6.3). |
| Recurso definido duas vezes | Impossível pelo modelo: as listas são derivadas por id, goal e subject. |
| Barra final | `trailingSlash: 'always'`, como já é hoje. |

### 8.4 Rotas antigas no GitHub Pages

O GitHub Pages não faz redirects HTTP 301.

As opções reais são:
- **(a)** página HTML de redirect com `meta refresh`, `rel=canonical` e `noindex`;
- **(b)** deixar cair na `404.html`, que o Pages serve com status 404 real.

Decisão:

| Rota antiga | Tratamento | Destino |
|---|---|---|
| `/pt/` | redirect | `/` |
| `/courses/`, `/pt/cursos/` | redirect | `/materias/` |
| `/courses/enem/`, `/pt/cursos/enem/` | redirect | `/enem/` |
| `/courses/uerj/`, `/pt/cursos/uerj/` | redirect | `/uerj/` |
| `/resume/`, `/pt/curriculo/` | **404** (padrão proposto) | Ver a pergunta aberta Q2 |

- **Mecanismo:** a opção `redirects` do `astro.config.mjs`. Em `output: 'static'`, o Astro gera para cada rota uma página com `meta refresh` imediato, `rel=canonical` para o destino e `noindex`. Não é preciso código próprio.
  - O `verify-dist` confirma cada página de redirect: destino existente, `noindex` e ausência do sitemap.
- **Por que o currículo cai em 404, e não em redirect para `/`:** redirecionar um currículo para uma escola é um soft-404. O visitante esperava uma pessoa e encontra outro produto. Um 404 honesto, com links para a Home, é mais correto, a menos que exista um novo endereço pessoal para onde redirecionar.
- **`src/pages/404.astro`:** em português, com H1, link para `/`, `/materias/` e `/buscar/`, e `noindex`.

---

## 9. Testes e verificação

### 9.1 Unitários (`npm test`)

| Arquivo | Destino | Cobre |
|---|---|---|
| `learning-resources.test.ts` | **adaptado** | ids únicos, HTTPS, `freeAccess: true` em todo publicado, nota de revisão nos retidos, `subject` válido, área derivada coerente, goals válidos, nenhum host fora da allowlist |
| `learning-library.test.ts` | **adaptado** | filtros puros por subject, goal e format; `resourcesByIds` com id ausente falha |
| `taxonomy.test.ts` | **novo** | 5 objetivos e 6 áreas na ordem da Home; as 12 matérias + tecnologia; cada matéria em uma única área; slug único; todo `Topic` com `source`; nenhum `Topic` publicado na V0.1 |
| `routes.test.ts` | **novo** | as 21 rotas canônicas exatas; todas com `/` final e minúsculas, sem acento; tecnologia não tem `/materias/tecnologia/`; nenhuma rota duplicada |
| `exam-guides.test.ts` | **substitui** `study-tracks` | seções obrigatórias não vazias; toda fonte oficial com verificação; recursos derivados existem e estão publicados |
| `tech-tracks.test.ts` | **novo** | toda trilha publicada tem ≥ 1 recurso publicado; trilha `planned` não renderiza; ids existentes |
| `search-index.test.ts` | **novo** | entradas para todos os objetivos, áreas, matérias, trilhas publicadas e recursos publicados; nenhuma URL fora de `routes`; normalização de acentos ("matematica" → Matemática); sem entradas duplicadas |
| `hidden-state.test.mjs` | **mantido** | `[hidden]` sempre vence |
| `narrative-*`, `resume-session`, `course-filter-state` | **removidos** | produto morto |

### 9.2 `verify-dist.mjs` (pós-build)

Reescrito por cima do esqueleto atual. A lista de páginas é **derivada de `routes`**, para que o `dist/` e a fonte não divirjam.

Por página indexável:
- `<html lang="pt-BR">`, title, description, canonical exato, `og:site_name="Pexis Academy"` e nenhum `hreflang`
- `main#main`, skip link e um único H1
- `<img>` com `alt`, `width` e `height`
- zero request de terceiros
- links internos resolvem; âncoras existem
- links externos: só HTTPS, só hosts da allowlist de provedores e fontes oficiais, sempre com `target="_blank" rel="noopener noreferrer"`
- **denylist pessoal:**
  - nenhuma ocorrência de "Guilherme", `guilhermehrcst@`, `linkedin.com/in/`, `instagram.com/guilhermehrcst`, Pexiscale ou Lume no HTML publicado
  - exceção: a origem `guilhermehrcst.github.io` nas URLs canônicas, enquanto o domínio não mudar (§11, R1)

Invariantes por página específica:
- **Home:** `#objetivo` com exatamente os 5 objetivos em ordem; `#areas` com exatamente as 6 áreas em ordem; **zero** `[data-resource]`.
- **Matéria:** ≥ 1 `[data-resource]`; o mapa, quando presente, cita a fonte.
- **Objetivos:** ENEM e UERJ com as seções obrigatórias.
- **Tecnologia:** ≥ 1 trilha, e nenhuma trilha vazia.
- **`/buscar/`:** contém link para toda página indexável (é o diretório completo).

Invariantes globais:
- **Redirects:** cada rota antiga listada na §8.4 existe, tem `noindex` e aponta para um destino existente.
- **404:** `dist/404.html` existe e tem `noindex`.
- **Sitemap:** o conjunto de URLs é igual ao conjunto de páginas indexáveis.
- **Assets e segredos:** mantidos como hoje.

Não há testes cosméticos frágeis: nada de pixels, classes CSS ou cópia literal, exceto os nomes fechados de objetivos e áreas.

### 9.3 Comandos de aceite

```
npm test && npx astro check && npm run build
```

Os três precisam passar, o mesmo que o CI roda.

---

## 10. Estratégia de migração

Tudo acontece na branch única `claude/pexis-academy-v01`, em commits pequenos e cada um verde. Nada vai para a `main` sem autorização explícita.

| # | Passo | Verde ao final |
|---|---|---|
| 1 | Esta spec (este commit) | inalterado |
| 2 | **Domínio:** introduzir `taxonomy.ts`; migrar o catálogo (remover `area`, renomear subject e goal ids); `routes.ts`; `exam-guides.ts`; `tech-tracks.ts`; `official-sources.ts`; `search-index.ts`. Testes novos e adaptados. As páginas antigas continuam compilando com adaptadores mínimos ou são cortadas no passo 3. | `npm test`, `check` |
| 3 | **Cutover de páginas:** novo `Base`, header, footer e tokens; criar as 21 páginas, a 404, o sitemap e o robots; configurar os redirects; **remover** de uma vez as páginas, os componentes, os scripts, os assets e o i18n pessoais (§3); reescrever o `verify-dist`. | os três comandos |
| 4 | **Conteúdo:** texto PT de cada página; reverificar as páginas oficiais INEP e UERJ (data de hoje); conferir o mapa de Matemática contra a Matriz; atualizar a auditoria de fontes. | os três comandos |
| 5 | **QA:** 360/390/768/1024/1440 px, só teclado, leitor de tela (estrutura), sem JS, reduced motion e contraste medido. | evidência registrada |
| 6 | Limpeza: README, arquivos legados da raiz, `.nojekyll` (só se não for necessário) | os três comandos |

**Rollback:** a `main` fica intocada até o merge. Depois do merge, um revert do merge commit restaura o site pessoal por inteiro, porque o deploy publica o `dist/` a cada push na `main`.

**Ponto sem volta (fora deste repositório):** links compartilhados para `/resume/` passam a dar 404. Ver Q2.

---

## 11. Riscos

| # | Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|---|
| R1 | **Domínio pessoal** (`guilhermehrcst.github.io`) para um produto Pexis: confiança, SEO e futura migração de canonicals | alta | médio | `site` centralizado em `astro.config` e `routes`; denylist pessoal com exceção explícita só para a origem. Decisão de domínio próprio fora da V0.1 (Q5); migrar depois exige CNAME e redirects no novo host. |
| R2 | **Links externos apodrecem** (Kultivi, UERJ, INEP mudam URLs) | alta | alto | Data de verificação visível; re-verificação no passo 4; link quebrado reportável em `/sobre/`. Checagem periódica de links fora da V0.1 (sem infra nova agora). |
| R3 | **Conteúdo raso** em `/ensino-medio/` e `/vestibulares/` com o catálogo atual | média | médio | Papéis distintos (§6.3); se a revisão do passo 4 mostrar que uma página é só uma cópia filtrada, ela sai da V0.1, em vez de ir ao ar rasa. |
| R4 | **Concentração em um provedor:** 12 das 20 entradas acadêmicas são Kultivi | alta | médio | Declarado. Ampliar só com recursos verificados; nunca preencher por volume. |
| R5 | **Afirmação factual errada sobre a prova** (ENEM/UERJ mudam regras) | média | alto | Toda afirmação de "Entenda a prova" cita uma fonte oficial com data; sem datas, notas ou calendários na V0.1. |
| R6 | **Currículo inventado** no mapa de aprendizagem | média | alto | `Topic.source` obrigatório por tipo; conferência contra a Matriz no passo 4; matéria sem mapa verificado não mostra mapa. |
| R7 | **Perda de links em uso** (`/resume/`, `/courses/`) | certa | baixo/médio | Redirects para os cursos; 404 honesto para o currículo (Q2). |
| R8 | **Regressão de acessibilidade ou contraste** com a nova paleta off-white | média | médio | Contraste medido no passo 5; invariantes estruturais no `verify-dist`. |
| R9 | **Escopo inflar durante a implementação** (FAQ, destaques, imagens) | média | médio | §5.2 e §12 são o contrato; seção nova exige justificativa escrita. |
| R10 | **Duas barreiras com a mesma causa de falha:** testes unitários e `verify-dist` lendo a mesma `routes` | média | médio | O `verify-dist` também compara com uma lista literal das 21 rotas canônicas da §5.1. Uma mudança acidental em `routes` quebra o teste de rotas **e** o `verify-dist` por caminhos independentes. |

---

## 12. Não-objetivos explícitos (V0.1)

- Autenticação, contas, perfis, banco de dados, sync em nuvem, backend.
- Feed social, comentários, ranking, gamificação, streaks, notificações.
- Tutor de IA, recomendações personalizadas, predição de nota.
- Pagamentos, marketplace, conteúdo pago, afiliados, certificados próprios.
- Progresso, "continue aprendendo" ou qualquer estado local persistido.
- Analytics de qualquer tipo.
- Tradução completa e `/en/`.
- Páginas de assunto (`/materias/{matéria}/{assunto}/`), trilhas sem recursos e o FAQ.
- CMS, recursos enviados por usuários.
- React ou qualquer framework de UI; dependências novas de runtime.
- Domínio próprio, imagem OG e checagem automática periódica de links.
- Calendário de provas, notas de corte, simulados próprios.

---

## 13. Critérios de aceitação

A V0.1 está pronta quando **todos** os itens forem verdadeiros e comprovados:

1. As 21 rotas canônicas da §5.1 existem, são indexáveis e mais nenhuma é indexável.
2. Na Home: hero com CTA para `#objetivo`; os 5 objetivos em ordem; as 6 áreas em ordem; a seção de curadoria; zero cartões de recurso.
3. O header tem a marca, Explorar, ENEM, UERJ, Tecnologia e Buscar, e funciona sem JS.
4. Cada matéria mostra ≥ 1 recurso verificado. O mapa de aprendizagem, quando exibido, cita a sua fonte.
5. `/enem/` e `/uerj/` têm estruturas próprias (§6.3), sem seção vazia, e cada afirmação sobre a prova tem fonte oficial.
6. `/tecnologia/` organiza por trilhas, e nenhuma trilha publicada está vazia.
7. `/buscar/` funciona sem JS (diretório completo) e com JS (filtro sem acento, `?q=`, anúncio da contagem).
8. Todo recurso publicado é 100% gratuito, verificado e com link primário. Os 37 publicados e os 3 retidos sobrevivem.
9. Zero dado pessoal no HTML publicado (denylist do `verify-dist`).
10. Rotas antigas: os cursos redirecionam (`noindex`, destino válido), e o currículo segue a decisão de Q2. A `404.html` existe.
11. O sitemap é igual às páginas indexáveis; o `robots.txt` aponta para o sitemap.
12. `npm test`, `npx astro check` e `npm run build` passam.
13. QA registrado: 360 a 1440 px sem scroll horizontal, teclado, sem JS, reduced motion e contraste AA medido.
14. Nenhuma dependência de runtime nova e nenhum request de terceiros.

---

## 14. Perguntas abertas (decisões do dono do produto)

| # | Pergunta | Padrão proposto se não houver resposta |
|---|---|---|
| Q1 | Qual é o hex oficial do azul Pexis? | `#0B57D0` (atual `--gh-action`), revalidado sobre off-white |
| Q2 | `/resume/` deve redirecionar para um novo endereço pessoal? | 404 honesto |
| Q3 | Segurança e Privacidade como 8ª trilha de Tecnologia, ou seção "outros recursos"? | Trilha |
| Q4 | Qual é o canal oficial para reportar link quebrado: issue no GitHub ou e-mail institucional Pexis? | Issue no GitHub (sem e-mail pessoal) |
| Q5 | Haverá domínio próprio (ex.: academy.pexis…)? Quando? | Fora da V0.1; manter `guilhermehrcst.github.io` |
| Q6 | No ENEM, "Linguagens" inclui língua estrangeira; o produto separa "Idiomas". Confirmar? | Confirmado como decisão de produto; `/enem/` mostra a composição oficial das áreas do ENEM, e a Home usa a do produto |

---

## 15. Revisão crítica desta spec

Feita antes do commit, contra o pedido, o repositório e a própria spec.

**Contradições encontradas e resolvidas:**
- **"Explorar" no header não tinha destino** na lista de rotas. Resolvido com `/materias/`, que também resolve o pai implícito de `/materias/{matéria}/`.
- **"Buscar" exige JS e "funciona sem JS"** estão em tensão. Resolvido com `/buscar/`, um diretório server-rendered aprimorado por JS.
- **Tecnologia é ao mesmo tempo objetivo e área.** Uma única página, `/tecnologia/`; não existe `/materias/tecnologia/`.
- **Seis áreas no produto contra oito nos dados.** A área passa a ser atributo da matéria (fonte única), em vez de manter dois mapeamentos.
- **Linguagens do ENEM contra Idiomas do produto.** A divergência ficou explícita (Q6), em vez de escondida.
- **Testes cobrindo "filtros"** contra a remoção dos filtros. Os filtros saem da UI com justificativa; os helpers puros e a busca são testados.

**Escopo excessivo cortado:**
- FAQ, destaques, seção de prática na Home, mega footer
- páginas de assunto, imagens em cartões, modal de busca
- `@astrojs/sitemap`, content collections

**Funcionalidades fictícias evitadas:**
- a trilha Git e GitHub sem recurso
- as seções `start` e `recommended` vazias
- currículo sem fonte
- FAQ sem perguntas reais
- progresso e "continue aprendendo"
- afirmações sobre vestibulares não verificados

**Decisões preservadas:**
- o nome
- a personalidade visual
- o fluxo OBJETIVO→…→APROFUNDAMENTO
- a Home que orienta
- o header pedido
- `/` em português
- as rotas canônicas pedidas
- as regras de curadoria
- Astro estático, sem framework
- as exclusões da V0.1

**Desvios deliberados do pedido, todos sinalizados:**
- duas rotas a mais (`/materias/`, `/buscar/`)
- a trilha de Segurança (Q3)
- a remoção dos filtros
- o currículo em 404 (Q2)

**Itens não verificados nesta execução:**
- que as URLs externas do catálogo ainda respondem hoje (verificadas em 2026-10-11 pela auditoria anterior; reverificação no passo 4)
- o contraste real da paleta off-white
- o comportamento exato do `redirects` do Astro 7 em output estático, a confirmar no passo 3 por inspeção do `dist/`
- se o `.nojekyll` ainda é necessário com o deploy via Actions
