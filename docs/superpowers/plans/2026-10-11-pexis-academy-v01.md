# Pexis Academy V0.1: plano de implementação

Data: 2026-10-11
Autoridade: `docs/superpowers/specs/2026-10-11-pexis-academy-v01-design.md` (a "spec"), aprovada.
Branch: `claude/pexis-academy-v01` (única). O plano parte do HEAD `135fccd`, com a árvore limpa.
Este documento só planeja; nada aqui está implementado.

---

## 0. Como ler e executar este plano

### 0.1 Convenções

- **`GATE`** é o portão completo, o mesmo que o CI roda:
  ```sh
  npm test && npx astro check && npm run build
  ```
  `npm run build` já executa `scripts/verify-dist.mjs`.
- **RED:** escrever ou alterar o teste (unitário em `tests/` ou invariante em `verify-dist.mjs`) **antes** da implementação, e ver a falha pelo motivo esperado. Falha por erro de sintaxe ou de import não conta como RED.
- **GREEN:** a menor implementação que faz o RED passar sem quebrar nada.
- **REFACTOR:** só quando houver duplicação ou acoplamento real criado pelo passo. Senão, "nenhum".
- **Regra de commit:** cada tarefa termina num commit que passa no `GATE`.
  - Nenhuma tarefa termina com o repositório vermelho.
  - Se o `GATE` falhar, a tarefa não está concluída: investigar a causa, sem empilhar patches.
- **Trailers de commit:** os de sempre (`Co-Authored-By`, `Claude-Session`).
- **Sem push e sem merge** sem autorização explícita. A validação de deploy (M9) indica o ponto em que a autorização é necessária.

### 0.2 Decisões da spec usadas como padrão

As perguntas abertas Q1 a Q6 ainda não têm resposta. O plano usa os padrões da §14 e marca os pontos que mudam se a resposta for outra.

| Q | Padrão aplicado | Tarefas afetadas |
|---|---|---|
| Q1: azul Pexis | `#0B57D0` | T1.1 (tokens), T8.3 (contraste) |
| Q2: `/resume/` | 404 (sem redirect) | T1.1 (redirects), T8.2 |
| Q3: Segurança | 8ª trilha publicada | T5.1 |
| Q4: canal de link quebrado | **Bloqueante para T2.4**, ver a nota abaixo | T2.4 |
| Q5: domínio | `guilhermehrcst.github.io` | T8.1 |
| Q6: Idiomas separado | Confirmado | T2.2, T3.3 |

**Nota sobre Q4, uma lacuna da spec:** o padrão "issue no GitHub" publica `github.com/guilhermehrcst/...`, que expõe o identificador pessoal. A denylist da §9.2 não pega esse caso (ela procura `instagram.com/guilhermehrcst` e "Guilherme", com G maiúsculo), mas o espírito de "sem dados pessoais" pega.

- **Execução:** a T2.4 só publica um canal de reporte se o dono confirmar Q4. Até lá, `/sobre/` diz como os recursos são verificados e não oferece canal.
- **Teto:** sem canal falso e sem e-mail pessoal.

### 0.3 Inconsistências da spec que este plano resolve

| Onde | Problema | Resolução no plano |
|---|---|---|
| §5.1 e §6.3 | Citam "§7.6" para a busca; a seção correta é a §6.8 | Usar a §6.8 |
| §6.5 e §6.8 | O header fala em "Buscar aprimorado com JS", mas a §6.8 diz "link para `/buscar/`, sem modal" | A §6.8 é mais específica: **link simples**. O JS existe só em `/buscar/`. |
| §2.2 e §5.3 | Imagens de cursos "ficam até decisão visual", mas não são usadas | `resource-images.ts`, `src/assets/courses/**` e o campo `curated` **ficam sem render** (T7.3 registra isso como resíduo). Não são apagados, por respeito à spec. |
| §6.7 | O "reveal sutil" é opcional ("se se justificar") | A V0.1 **não** traz `motion.ts`. Só transições CSS de hover e foco, sob `prefers-reduced-motion: no-preference`. É o caminho mais simples e fail-open por construção. |
| §9.1 | "`resourcesByIds` com id ausente falha", mas hoje o id ausente é omitido em silêncio | Mudança deliberada para fail-closed, coberta por um RED em T1.2 |
| §9.2 | "Lista de páginas derivada de `routes`", mas o `verify-dist` é `.mjs` sem o strip de TS | O `verify-dist` lê **`dist/sitemap.xml`** (gerado de `routes`) como a lista derivada e compara com a **lista literal** de 21 rotas. As duas barreiras são independentes (R10). Até o sitemap existir (T8.1), vale só a lista literal. |

### 0.4 Estratégia de ordenação: minimizar o tempo quebrado

Um problema estrutural guia a ordem. O header novo linka para `/materias/`, `/enem/`, `/uerj/`, `/tecnologia/` e `/buscar/`. Se as páginas fossem criadas uma por milestone, cada commit intermediário teria links internos quebrados, e o `verify-dist` falharia, com razão.

A solução é um **walking skeleton**:

1. **M0** constrói o domínio novo de forma **aditiva**. O site antigo continua intacto e verde.
2. **M1** faz o **único commit destrutivo grande**:
   - remove o produto pessoal inteiro;
   - instala o shell novo;
   - cria as **21 rotas canônicas** já com H1 e lead reais (texto verdadeiro sobre o papel de cada página, nenhum placeholder do tipo "em breve");
   - cria a 404 e os redirects.

   A partir daí todos os links resolvem, e o `verify-dist` fica estrito desde o primeiro dia.
3. **M2 a M6** preenchem as páginas por TDD. Cada seção nova entra primeiro como uma invariante no `verify-dist` (RED) e depois é implementada (GREEN).
4. **M7** faz a limpeza residual, **M8** endurece SEO e acessibilidade, e **M9** valida tudo.

**Por que o grosso da remoção fica em M1 e não em M7.** O catálogo e a i18n antiga têm consumidores (`Courses.astro`, `LearningResourceCard`, `en.ts`/`pt.ts`, o `verify-dist`). Migrar os ids do catálogo com esses consumidores vivos exigiria adaptadores descartáveis. Remover tudo junto com o cutover elimina esse trabalho, como a §10, passo 3, já pede ("remover de uma vez").

**Interpretação de "skeleton".** A branch não é publicada até M9. Uma página com H1 e lead verdadeiros, e ainda sem as seções, é um estado intermediário honesto, não conteúdo falso. Nenhum commit é publicado nesse estado.

### 0.5 Restrições técnicas verificadas no código

- **Módulos testados no Node** (`node --experimental-strip-types`) não podem importar assets (`.png`/`.jpg`). Imports relativos de runtime entre esses módulos usam a extensão `.ts`, o que é permitido por `allowImportingTsExtensions` do tsconfig `strictest` do Astro. Os imports só de tipo (`import type`) podem omitir a extensão.
  - Isso vale para `taxonomy`, `routes`, `official-sources`, `learning-resources`, `learning-library`, `exam-guides`, `tech-tracks`, `search-index`, `search-normalize` e `contrast`.
  - `providers.ts` importa PNGs e por isso **não** é testável no Node; fica fora dos testes unitários, como hoje.
- **Lista de testes:** o script `test` enumera os arquivos à mão. Um teste novo esquecido não roda, e isso é uma lacuna silenciosa.
  - Verificado nesta sessão: o Node v22.22.0 aceita o glob `"tests/**/*.test.{ts,mjs}"` e encontra os mesmos 54 testes.
  - A troca acontece em T0.1.
- **`tests/node-shims.d.ts`** tipa só `ok/equal/notEqual/deepEqual`. Asserções novas (`throws`, `match`) exigem estender o shim.

---

## Visão geral

| Milestone | Tarefas | Estado do site ao final |
|---|---|---|
| **M0 Fundação** | T0.1 a T0.5 | Site antigo intacto; domínio novo testado e sem consumidores |
| **M1 Shell global e cutover** | T1.1 a T1.3 | Pexis Academy: shell e 21 rotas skeleton, redirects, 404, sem dado pessoal |
| **M2 Home** | T2.1 a T2.4 | Home completa; `/sobre/` completa |
| **M3 Objetivos** | T3.1 a T3.6 | `/enem/`, `/uerj/`, `/ensino-medio/` e `/vestibulares/` completos |
| **M4 Matérias** | T4.1 a T4.3 | `/materias/` e as 12 matérias completas |
| **M5 Tecnologia** | T5.1 e T5.2 | `/tecnologia/` por trilhas |
| **M6 Descoberta e busca** | T6.1 a T6.3 | `/buscar/` funcionando com e sem JS |
| **M7 Migração e limpeza** | T7.1 a T7.4 | Sem legado, README e docs atualizados |
| **M8 SEO e acessibilidade** | T8.1 a T8.4 | Sitemap, robots, metadados e acessibilidade travados por invariantes |
| **M9 Validação final** | T9.1 a T9.4 | Evidence packet; pronto para revisão (sem merge) |

**Grafo de dependências (acíclico):**

```
T0.1 → T0.2 → T0.3
T0.1 → T0.4
T0.5 (independente)
T0.* → T1.1 → T1.2 → T1.3
T1.3 → T2.* , T3.* , T4.* , T5.* , T6.*
T1.2 → T3.1 , T5.1 , T6.1
T4.2 → T3.3..T3.6   (as listas por matéria são reutilizadas pelos objetivos)
T5.1 → T6.1         (o índice inclui as trilhas)
M2..M6 → M7 → M8 → M9
```

**Execução recomendada:**

```
M0 → M1 → M2 → M4 → M3 → M5 → M6 → M7 → M8 → M9
```

Em relação à numeração, M4 sobe antes de M3. Os objetivos reutilizam o bloco "recursos por matéria" (`SubjectResources`) criado em M4; fazer M3 antes obrigaria a criar esse componente lá e movê-lo depois. A numeração dos milestones foi mantida como pedido; só a ordem de execução muda.

---

## M0 Fundação

Domínio novo, aditivo. O site antigo continua igual e verde em cada commit.

### T0.1 Baseline e runner de testes por glob

- **Objetivo:**
  - Medir de novo o baseline.
  - Eliminar a lacuna de "teste esquecido no script".
- **Arquivos:** `package.json`.
- **RED:** criar `tests/runner-guard.test.ts` com uma asserção trivial (`assert.ok(true)`). Rodar `npm test` com o script atual e confirmar que o arquivo **não** roda: o total continua 54. Isso prova a lacuna.
- **GREEN:**
  - O script `test` passa a ser `node --experimental-strip-types --test "tests/**/*.test.{ts,mjs}"`.
  - Remover `tests/runner-guard.test.ts` depois da prova.
- **Refactor:** nenhum.
- **Verificação:**
  ```sh
  npm test 2>&1 | grep -E '^# (tests|pass|fail)'   # tests 54, pass 54, fail 0
  GATE
  ```
- **Aceite:** os mesmos 54 testes, agora descobertos por glob; `GATE` verde; 10 páginas.
- **Commit:** `test: discover test files by glob`

### T0.2 Taxonomia (`taxonomy.ts`)

- **Objetivo:** definir a fonte única de objetivos, áreas, matérias e assuntos (spec §6.1).
- **Arquivos:** `src/lib/taxonomy.ts` (novo), `tests/taxonomy.test.ts` (novo).
- **RED** (`taxonomy.test.ts`):
  - `OBJECTIVE_ORDER` é exatamente `['enem','uerj','ensino-medio','vestibulares','tecnologia']`.
  - `AREA_ORDER` é exatamente `['matematica','linguagens','natureza','humanas','idiomas','tecnologia']`.
  - `SUBJECTS` tem exatamente as 12 matérias acadêmicas mais `tecnologia`.
  - Cada matéria está em uma única área. As matérias de cada área, em ordem, são:
    - `linguagens`: portugues, redacao
    - `natureza`: fisica, quimica, biologia
    - `humanas`: historia, geografia, filosofia, sociologia
    - `idiomas`: ingles, espanhol
    - `matematica`: matematica
    - `tecnologia`: tecnologia
  - Nenhuma área fica vazia.
  - Os slugs são únicos, minúsculos, `[a-z-]` e sem acento.
  - Todo `Topic` tem `source` pertencente a `TopicSourceId`, e nenhum tem `published: true` (V0.1).
  - Os rótulos humanos (`label`) existem para os objetivos, áreas e matérias ("Ciências da Natureza", "Matemática"…).
- **GREEN:**
  - Tipos `ObjectiveId`, `AreaId`, `SubjectId`, `TopicSourceId = 'inep-matriz-enem'`.
  - `Topic { id; label; source; published: false }`.
  - Constantes `OBJECTIVES`, `AREAS`, `SUBJECTS` (records com `label` e área), `OBJECTIVE_ORDER`, `AREA_ORDER`, `subjectsOf(area)`.
  - **Todos os `topics: []`.** O mapa de Matemática entra só em T4.3, depois de conferido.
  - Sem imports de assets. Os rótulos ficam aqui, e não no dicionário de UI, porque são dados de domínio usados pela busca, pelas rotas e pelas páginas: uma fonte só.
- **Refactor:** nenhum.
- **Verificação:** `npm test` e depois `GATE`.
- **Aceite:** os testes novos passam; o site antigo está inalterado (10 páginas).
- **Commit:** `feat(domain): add Pexis Academy taxonomy`

### T0.3 Rotas (`routes.ts`)

- **Objetivo:** derivar todas as URLs da taxonomia (spec §6.2).
- **Arquivos:** `src/lib/routes.ts` (novo), `tests/routes.test.ts` (novo).
- **RED** (`routes.test.ts`):
  - `canonicalPaths()` é **igual**, como conjunto e com ordem estável, a esta lista **literal** de 21 rotas, escrita no teste e não importada:
    ```
    /  /enem/  /uerj/  /ensino-medio/  /vestibulares/  /tecnologia/  /materias/
    /materias/{matematica,portugues,redacao,fisica,quimica,biologia,historia,geografia,filosofia,sociologia,ingles,espanhol}/
    /buscar/  /sobre/
    ```
  - Todas as rotas terminam em `/` e são minúsculas, sem acento e únicas.
  - `routes.subject('tecnologia') === '/tecnologia/'`, e `/materias/tecnologia/` não aparece em `canonicalPaths()`.
  - `routes.topic('matematica', x)` lança erro para um assunto não publicado.
  - `LEGACY_REDIRECTS` é exatamente:
    - `/pt/` → `/`
    - `/courses/` e `/pt/cursos/` → `/materias/`
    - `/courses/enem/` e `/pt/cursos/enem/` → `/enem/`
    - `/courses/uerj/` e `/pt/cursos/uerj/` → `/uerj/`
  - Todo destino de redirect está em `canonicalPaths()`.
  - `/resume/` e `/pt/curriculo/` **não** estão em `LEGACY_REDIRECTS` (Q2).
  - `HEADER_NAV` é exatamente Explorar → `/materias/`, ENEM → `/enem/`, UERJ → `/uerj/`, Tecnologia → `/tecnologia/` e Buscar → `/buscar/`, nessa ordem.
- **GREEN:**
  - `routes` com `home`, `objective(id)`, `subjectIndex`, `subject(id)`, `topic(subject, topic)`, `search`, `about`.
  - Também `canonicalPaths()`, `LEGACY_REDIRECTS` e `HEADER_NAV`.
  - Importa `./taxonomy.ts`.
- **Refactor:** nenhum.
- **Verificação:** `npm test` e depois `GATE`.
- **Aceite:** a lista literal no teste é a barreira independente da R10.
- **Commit:** `feat(domain): derive canonical routes from the taxonomy`

### T0.4 Fontes oficiais (`official-sources.ts`)

- **Objetivo:** registrar as páginas oficiais (INEP, UERJ) com o mesmo shape de verificação dos recursos (spec §6.4).
- **Arquivos:** `src/lib/official-sources.ts` (novo), `tests/official-sources.test.ts` (novo).
- **Dados:** apenas as URLs **já registradas** na auditoria (`docs/superpowers/research/2026-10-11-learning-library-sources.md`):
  - INEP: provas e gabaritos
  - INEP: matrizes de referência
  - UERJ: perguntas frequentes
  - UERJ: Revista do Vestibular (página raiz, só se estiver na auditoria; se não estiver, fica de fora)

  A reverificação de hoje acontece em T3.2, que é o passo com rede. Nenhuma URL nova é deduzida.
- **RED:** ids únicos; toda URL em HTTPS; todo registro com `verified: { on, by }`; o host de cada URL pertence a `OFFICIAL_HOSTS` (`www.gov.br`, `sistema.vestibular.uerj.br`, `www.revista.vestibular.uerj.br`); campo `issuer: 'inep' | 'uerj'`.
- **GREEN:** `OfficialSourceId`, `officialSources`, `OFFICIAL_HOSTS`.
- **Refactor:** nenhum.
- **Verificação:** `npm test` e depois `GATE`.
- **Aceite:** testes verdes; nenhum consumidor ainda.
- **Commit:** `feat(domain): register verified official exam sources`

### T0.5 `verify-dist`: separar checagens genéricas das de produto

- **Objetivo:**
  - Preparar o cutover sem mudar comportamento.
  - Isolar as checagens que sobrevivem (head, landmarks, H1, imagens, terceiros, assets, segredos, links internos, `rel` de links externos) das regras do produto pessoal.
- **Arquivos:** `scripts/verify-dist.mjs`.
- **RED:** não se aplica; é refactor puro. A rede de segurança é **o mesmo resultado**: `verify-dist: 10 pages, 291 files — all invariants hold`. Antes de mexer, provar que a rede funciona: corromper temporariamente um `dist/*/index.html` (remover o H1) e ver a falha; depois reconstruir.
- **GREEN:** extrair funções `checkHead`, `checkLandmarks`, `checkImages`, `checkThirdParty`, `checkLinks`, `checkAssets` e `checkSecrets`. As regras pessoais ficam numa tabela `PRODUCT_RULES` que M1 substitui inteira.
- **Refactor:** é o próprio passo.
- **Verificação:** `npm run build 2>&1 | tail -1`, com a saída idêntica ao baseline; depois `GATE`.
- **Aceite:** saída idêntica; o diff só move código.
- **Commit:** `refactor(verify): separate generic dist checks from product rules`

---

## M1 Shell global e cutover

### T1.1 Cutover: remover o produto pessoal e instalar o shell e o walking skeleton

É o único commit destrutivo grande, e é deliberado.

**Objetivo:** substituir o site pessoal pela casca completa da Pexis Academy. O resultado:
- 21 rotas canônicas com H1 e lead reais;
- shell (header, footer, Base, tokens);
- 404 e redirects;
- `verify-dist` com as invariantes do novo produto.

**RED, escrito primeiro** (`scripts/verify-dist.mjs`, substituindo `PRODUCT_RULES`):

- **`CANONICAL`:** a lista literal das 21 rotas (a mesma de T0.3, escrita de novo, sem importar). Para cada página:
  - `<html lang="pt-BR">`;
  - title com 5 caracteres ou mais e terminando em `| Pexis Academy` (na Home, começando com `Pexis Academy`);
  - description com 70 a 160 caracteres;
  - canonical exato;
  - `og:site_name` igual a `Pexis Academy` e `og:locale` igual a `pt_BR`;
  - **nenhum** `hreflang`;
  - indexável (sem `noindex`);
  - `main#main`, skip link e um único H1;
  - presença de `header` e `footer`, e `nav` com `aria-label`;
  - os 5 itens do header na ordem de `HEADER_NAV` (literal), com `aria-current="page"` no item ativo, quando houver.
- **`REDIRECTS`** (literal, 7 rotas antigas): cada `dist/<old>/index.html` existe, tem `noindex`, faz `meta refresh` para o destino, e o destino está em `CANONICAL`.
- **`GONE`:** `dist/resume/` e `dist/pt/curriculo/` **não existem** (Q2).
- **404:** `dist/404.html` existe, tem `noindex` e um H1, e linka `/`, `/materias/` e `/buscar/`.
- **Inventário fechado:** todo `.html` em `dist/` pertence a `CANONICAL ∪ REDIRECTS ∪ {404}`. Página extra falha.
- **Denylist pessoal** em todo HTML e CSS de `dist/`: `Guilherme`, `guilhermehrcst@`, `linkedin.com/in/`, `instagram.com/`, `Pexiscale`, `Lume`, `Pexis Machine` e `pexiscale.com`.
  - Exceção única: a origem `https://guilhermehrcst.github.io` em `canonical` e `og:url`, que só é permitida nesses dois atributos.
  - Um teste negativo garante que a exceção não vaza: injetar `Guilherme` num HTML de teste do `dist/` deve falhar (feito manualmente, como em T0.5).
- **Links externos:** a allowlist de hosts passa a ser a união de `COURSE_HOSTS` (do catálogo) e `OFFICIAL_HOSTS`.
  - Todo link externo exige HTTPS, `target="_blank"` e `rel` com `noopener` e `noreferrer`.
  - A `EXTERNAL_ALLOW` pessoal é **apagada**.
- **Sem JS em páginas de conteúdo:** nenhum `<script>` fora de `/buscar/`. Os scripts do Astro em módulo também contam; `/buscar/` é liberada em T6.3.

**Rodar `npm run build` com o RED escrito e o site antigo ainda no lugar:** deve falhar em massa (páginas ausentes, `lang="en"`, denylist). Essa é a prova de que as invariantes mordem.

**GREEN:**

1. **Remover** exatamente a lista da spec §3. Usar `git rm` arquivo por arquivo; nada de `rm -rf` cego. Ficam preservados:
   - `learning-resources.ts`, `learning-library.ts`, `study-tracks.ts` e os testes deles (substituídos depois, em T3.1);
   - `providers.ts`, `CourseProvider.astro` (renomeado em T1.3), `ExternalLinkIcon.astro`;
   - `resource-images.ts`, `src/assets/courses/**`, `src/assets/providers/**`;
   - `public/licenses/**` e `public/favicon.svg`.

   São removidos também `LearningResourceCard.astro` (ele depende dos tipos antigos de i18n e será **recriado a partir do histórico** em T1.3, via `git show dd15aa4:src/components/LearningResourceCard.astro`), `Label.astro` e `motion.ts` (§0.3).
2. **i18n:**
   - apagar `en.ts`;
   - reescrever `types.ts` com `Lang = 'pt'` e um `Dict` enxuto (header, footer, skip, 404 e metadados por página, além de título e lead de cada página);
   - reescrever `pt.ts`;
   - apagar `i18n/routes.ts` (substituído por `lib/routes.ts`).
3. **`src/styles/global.css` reescrito** com os tokens da §6.7:
   - `--paper` (off-white), `--ink` (grafite), `--muted`, `--rule`, `--surface`, `--action` (`#0B57D0`, Q1) e `--action-hover`;
   - a escala de espaço e de tipo, mobile-first;
   - `[hidden]{display:none!important}`, que mantém o teste `hidden-state`;
   - foco visível, `.sr-only` e o skip link.

   Os tokens pessoais saem: `--void*`, `--fit-name`, `--nt-*`, display monumental e `--signal`. Os valores finais de contraste são **medidos** em T8.3. Aqui só valem os valores candidatos.
4. **`src/layouts/Base.astro` reescrito** com:
   - `<head>` (title, description, canonical, OG, `lang="pt-BR"`, preload da fonte, favicon) e sem `hreflang`;
   - skip link, `SiteHeader`, `<main id="main">` e `SiteFooter`;
   - sem o gate de motion;
   - prop `noindex` (usada pela 404).
5. **`SiteHeader.astro`:** marca "Pexis Academy" (link para `/`) e o `nav aria-label="Principal"` gerado de `HEADER_NAV`.
   - Mobile: os itens quebram em duas linhas ou rolam horizontalmente **dentro** do nav, nunca a página. Sem menu hambúrguer, porque com cinco itens ele não se justifica e exigiria JS.
6. **`SiteFooter.astro`:**
   - mapa do site gerado de `routes` (objetivos, áreas e matérias, `/sobre/`);
   - "Recursos verificados em {VERIFIED_ON formatado}", lido do export criado aqui (`learning-resources.ts`: `export const VERIFIED_ON`, uma mudança aditiva);
   - link para `/licenses/`.
7. **`PageIntro.astro`:** eyebrow opcional, H1 e lead.
8. **Páginas skeleton,** todas com `Base` e `PageIntro` e o texto real vindo de `pt.ts`, sem "em breve":
   - `src/pages/index.astro`, `enem/index.astro`, `uerj/index.astro`, `ensino-medio/index.astro`, `vestibulares/index.astro`, `tecnologia/index.astro`;
   - `materias/index.astro` e `materias/[subject]/index.astro` (com `getStaticPaths` sobre as matérias da taxonomia, exceto `tecnologia`);
   - `buscar/index.astro`, `sobre/index.astro` e `404.astro`.
9. **`astro.config.mjs`:** `redirects` gerado de `LEGACY_REDIRECTS`, importado de `./src/lib/routes.ts`.
   - Verificar no `dist/` que o Astro 7 gera de fato o `meta refresh`, o canonical para o destino e o `noindex`. Esse ponto está marcado como "não verificado" na spec.
   - **Se o Astro não gerar o `noindex`:** criar as páginas de redirect como um `src/pages/[...legacy].astro` com `getStaticPaths` sobre `LEGACY_REDIRECTS` e um layout `Redirect` mínimo. A decisão é tomada pela observação do `dist/`, não por suposição.
10. **Testes:**
    - apagar `narrative-state`, `narrative-content`, `resume-session` e `course-filter-state`;
    - **manter** `learning-resources`, `learning-library`, `study-tracks` e `hidden-state`, que continuam válidos, porque o catálogo ainda não mudou.

**Refactor:** procurar órfãos.

```sh
grep -rlE "influences|narrative|resume-session|Monument|dither|lume-model" src tests scripts   # vazio
```

E, para cada `src/components/*.astro`, verificar se ele é importado por alguém (lista registrada no commit).

**Verificação:**

```sh
GATE
ls dist/resume dist/pt/curriculo 2>&1      # "No such file"
grep -rl "Guilherme" dist | grep -v '^$'   # vazio
```

**Aceite:**
- 21 páginas, 7 redirects e a 404;
- `verify-dist` verde com as invariantes novas;
- 0 ocorrência pessoal no `dist/`;
- os catálogos e seus testes intactos (`npm test` mostra os testes de recursos verdes).

**Commit:** `feat!: cut over from personal site to Pexis Academy shell`

**Corpo do commit:** a lista do que foi removido (§3 da spec) e a confirmação de que o histórico preserva tudo.

**Risco:** o commit é grande. A mitigação:
- a maior parte é deleção (`git rm`) e mecânica;
- os arquivos novos são pequenos;
- o RED do `verify-dist` foi escrito antes;
- o critério de aceite é objetivo.

Dividir mais criaria commits vermelhos ou adaptadores descartáveis (§0.4).

### T1.2 Migração do catálogo para a taxonomia nova

- **Objetivo:**
  - O `subject` passa a ser a única fonte da área.
  - Os ids de matéria e de objetivo passam para português, e o `resourcesByIds` passa a ser fail-closed (spec §6.1 e §9.1).
- **Arquivos:**
  - `src/lib/learning-resources.ts`, `src/lib/learning-library.ts`, `src/lib/study-tracks.ts` (ids de goal);
  - `tests/learning-resources.test.ts`, `tests/learning-library.test.ts`, `tests/study-tracks.test.ts`, `tests/node-shims.d.ts` (adicionar `throws`).
- **RED 1, de caracterização, antes de qualquer mudança:**
  - **Snapshot de preservação**, escrito como literal no teste: o conjunto de **todos os 40 ids** e, para cada um, `url`, `provider`, `title`, `format` e `verified.on`.
  - A matéria e os goals aparecem no **valor novo**, por um mapa literal antigo→novo escrito no teste:
    - matérias: `math→matematica`, `portuguese→portugues`, `writing→redacao`, `physics→fisica`, `chemistry→quimica`, `biology→biologia`, `history→historia`, `geography→geografia`, `philosophy→filosofia`, `sociology→sociologia`, `english→ingles`, `spanish→espanhol`, `technology→tecnologia`;
    - goals: `high-school→ensino-medio`, `vestibular→vestibulares`, `enem→enem`, `uerj→uerj`.
  - Esse snapshot falha agora, pelos ids de matéria antigos. É o RED legítimo da migração.
- **RED 2:**
  - `areaOf(r) === SUBJECTS[r.subject].area` para todo recurso;
  - o recurso **não** tem propriedade `area` (`!('area' in r)`);
  - toda matéria acadêmica (12) tem 1 recurso publicado ou mais;
  - todo host de recurso publicado está em `COURSE_HOSTS` (exportado);
  - 37 publicados e 3 retidos.
- **RED 3** (`learning-library.test.ts`):
  - os filtros por `subject`/`goals`/`formats` com os ids novos;
  - `resourcesByIds(items, ['missing'])` **lança** erro;
  - `filterResources` por `area`, derivada via `areaOf`.
- **GREEN:**
  - remover `LearningAreaId`, `AREA_ORDER` e `AREA_SUBJECTS` de `learning-resources.ts`, e o campo `area` de cada registro;
  - `LearningSubjectId` passa a ser o `SubjectId` importado de `./taxonomy.ts`;
  - `LearningGoalId = 'ensino-medio' | 'enem' | 'uerj' | 'vestibulares'`;
  - o helper `tech()` emite `subject: 'tecnologia'` e `goals: ['ensino-medio']`;
  - exportar `areaOf` e `COURSE_HOSTS`;
  - a validação de build troca "área/matéria" por "subject ∈ SUBJECTS".

  **`LearningLevelId` não muda.** Ele também tem `'high-school'` e `'vestibular'`, mas são outro eixo; é uma colisão de nomes, não de semântica.
- **Atualizações relacionadas:**
  - `study-tracks.ts` não muda (ids de recurso e goals `enem`/`uerj` iguais);
  - `verify-dist` lê `COURSE_HOSTS` de uma cópia literal, mantendo a independência; um teste unitário garante que a cópia literal no `verify-dist` é igual ao export (lê o `.mjs` como texto).
- **Refactor:** nenhum.
- **Verificação:**
  ```sh
  npm test
  GATE
  git diff --stat   # só os arquivos listados
  ```
- **Aceite:** snapshot de preservação verde (nenhuma URL, título ou verificação mudou); 37 e 3; `GATE` verde.
- **Commit:** `refactor(domain): key the catalogue by subject and Portuguese ids`

### T1.3 Componentes de recurso: `ResourceList`, `ResourceItem` e `ProviderMark`

- **Objetivo:** recriar a renderização de recurso, adaptada de `LearningResourceCard` e `CourseProvider` (spec §2.2 e §6.5).
- **Arquivos:**
  - `git mv src/components/CourseProvider.astro src/components/ProviderMark.astro`;
  - `src/components/ResourceItem.astro` (novo, a partir do histórico de `LearningResourceCard`);
  - `src/components/ResourceList.astro`;
  - `src/i18n/{types,pt}.ts` (rótulos de formato, idioma, nível, cadastro, certificado e CTA "Acessar recurso", com "abre em nova aba" em `sr-only`);
  - `src/pages/sobre/index.astro` (consumidor temporário: ver o RED).
- **RED:**
  - Nova invariante no `verify-dist`, válida em qualquer página: cada `[data-resource]` é um `<li>` dentro de `<ul>`; contém o título do recurso com `translate="no"`, um link externo único que passa pelas regras de host e `rel`, e um texto `sr-only` com "nova aba".
  - Como nenhuma página renderiza recursos ainda, a invariante só morde quando existir consumidor. Por isso o RED inclui uma prova: renderizar temporariamente um `ResourceList` em `/sobre/` com um recurso sem `rel` e ver a falha. Depois corrigir e **remover** o consumidor temporário no mesmo commit.
- **GREEN:**
  - `ResourceItem` sem `plate`, sem imagem e sem numeração;
  - a ordem do conteúdo: `ProviderMark`, título (`h3` por padrão; nível de heading passado por prop para não pular níveis), fatos (formato · idioma · cadastro, quando houver · certificado, quando verificado), e o CTA externo com `ExternalLinkIcon`;
  - `data-resource`, `data-subject`, `data-format`, `data-goals`;
  - `ResourceList` recebe `resources` e `headingLevel`.
- **Refactor:** nenhum.
- **Verificação:** `GATE`.
- **Aceite:**
  - a invariante existe e foi vista falhar;
  - nenhum consumidor de produção ainda; `/sobre/` volta ao estado skeleton.
- **Commit:** `feat(ui): resource list and provider mark for the academy`

---

## M2 Home

### T2.1 Bloco "Qual é o seu objetivo?"

- **Objetivo:** spec §5.2, item 2.
- **Arquivos:** `src/components/ObjectiveList.astro`, `src/pages/index.astro`, `src/i18n/{types,pt}.ts` (uma frase por objetivo), `scripts/verify-dist.mjs`.
- **RED** (`verify-dist`, Home):
  - existe `section#objetivo` com um heading "Qual é o seu objetivo?";
  - dentro dele há uma `<ul>` com **exatamente 5** links, nesta ordem de `href`: `/enem/`, `/uerj/`, `/ensino-medio/`, `/vestibulares/`, `/tecnologia/` (literal);
  - **zero** `[data-resource]` na Home.
- **GREEN:** `ObjectiveList` gerado de `OBJECTIVE_ORDER` e `routes.objective`, cada item com rótulo e frase; o hero ganha o CTA "Escolher meu objetivo" → `#objetivo`.
- **Refactor:** nenhum.
- **Verificação:** `GATE`.
- **Aceite:** o RED passou de vermelho para verde.
- **Commit:** `feat(home): objective entry points`

### T2.2 Bloco "Explore por área"

- **Objetivo:** spec §5.2, item 3.
- **Arquivos:** `src/components/AreaList.astro`, `src/pages/index.astro`, `scripts/verify-dist.mjs`.
- **RED:**
  - existe `section#areas`;
  - há exatamente 6 grupos (`[data-area]`) na ordem literal `matematica, linguagens, natureza, humanas, idiomas, tecnologia`;
  - cada grupo linka todas as suas matérias (literal por área), e o grupo `tecnologia` linka `/tecnologia/`.
- **GREEN:** `AreaList` gerado de `AREA_ORDER`, `subjectsOf` e `routes.subject`. Recebe `headingLevel`, porque também é usado em `/materias/`.
- **Refactor:** nenhum.
- **Verificação:** `GATE`.
- **Aceite:** RED verde; sem cor por área.
- **Commit:** `feat(home): explore by area`

### T2.3 Hero e "Como escolhemos os recursos"

- **Objetivo:** spec §5.2, itens 1 e 4.
- **Arquivos:** `src/pages/index.astro`, `src/i18n/{types,pt}.ts`, `scripts/verify-dist.mjs`.
- **RED:**
  - a ordem das seções na Home é literal: hero (contém o H1), `#objetivo`, `#areas`, `#curadoria`;
  - nenhuma outra `section` existe na Home, para travar o escopo (R9);
  - `#curadoria` linka `/sobre/`.
- **GREEN:**
  - hero com H1 "Aprenda com direção." (do dicionário), frase de apoio e o CTA;
  - `#curadoria` com 3 regras curtas;
  - o texto vem da política vigente de curadoria, sem inventar promessas.
- **Refactor:** se `ObjectiveList` e `AreaList` repetirem markup de seção, extrair `HomeSection` só se forem 3 repetições ou mais. Caso contrário, nada.
- **Verificação:** `GATE`.
- **Aceite:** a Home cumpre o critério 2 da §13.
- **Commit:** `feat(home): hero and curation promise`

### T2.4 `/sobre/`

- **Objetivo:** spec §6.3 (`/sobre/`).
- **Arquivos:** `src/pages/sobre/index.astro`, `src/i18n/{types,pt}.ts`, `scripts/verify-dist.mjs`.
- **RED:**
  - `/sobre/` contém as seções `#curadoria`, `#verificacao` e `#afiliacao`;
  - `#verificacao` mostra a data `VERIFIED_ON`, igual à do footer, comparada no `verify-dist` entre as duas;
  - a denylist já cobre os dados pessoais.
- **GREEN:**
  - o que é a Pexis Academy;
  - as regras de curadoria (fiel à política de `courses-learning-library-design.md`, §§ acesso gratuito e curadoria);
  - como é a verificação;
  - a não afiliação com INEP, UERJ e os provedores.
  - **Canal de reporte: só com Q4 respondida** (§0.2). Sem resposta, a seção não existe.
- **Refactor:** nenhum.
- **Verificação:** `GATE`.
- **Aceite:** nenhum canal inventado; nenhum dado pessoal.
- **Commit:** `feat(about): curation and verification policy`

---

## M3 Objetivos

> Executar **depois de M4** (§0.4): T3.3 a T3.6 reutilizam `SubjectResources` de T4.2.

### T3.1 Guias de prova (`exam-guides.ts`), substituindo `study-tracks.ts`

- **Objetivo:** spec §6.4, sem perder nada do que `study-tracks` mapeava.
- **Arquivos:**
  - `src/lib/exam-guides.ts` (novo) e `tests/exam-guides.test.ts` (novo);
  - remover `src/lib/study-tracks.ts` e `tests/study-tracks.test.ts`.
- **RED** (`exam-guides.test.ts`):
  - as seções do ENEM são exatamente `entenda, areas, pratique, aprofunde`, e as da UERJ `entenda, prepare, materias, provas` (literal);
  - **preservação:** todo id de recurso referenciado no `study-tracks.ts` atual aparece em alguma seção derivada do exame correspondente. É uma lista literal copiada do arquivo antigo para o teste antes de apagá-lo:
    - ENEM: os 12 Kultivi e `inep-writing-2026`;
    - UERJ: as 7 coleções `uerj-*-practice`.
  - as seções derivadas contêm só recursos publicados com o goal do exame;
  - `pratique` e `provas` contêm apenas o formato `practice`, e `aprofunde` não contém `practice`;
  - `entenda` (os dois) e `prepare` (UERJ) têm 1 `OfficialSourceId` ou mais;
  - `entenda`, mais `pratique` (ENEM) ou `provas` (UERJ), não ficam vazios;
  - `ENEM_AREAS`, o agrupamento oficial do ENEM, cobre exatamente as 12 matérias acadêmicas:
    - Linguagens: portugues, redacao, ingles, espanhol (Q6: composição oficial **na página do ENEM**);
    - Matemática;
    - Natureza;
    - Humanas.

    Cada grupo tem como fonte `inep-matrizes`.
- **GREEN:**
  - `examGuides.enem` e `examGuides.uerj`, com as seções `{ id, kind: 'editorial' | 'resources', sources?, select? }`;
  - `select` é uma função pura sobre `publishedResources` (`goal` + `format`);
  - `resolveGuide(exam)` devolve as seções resolvidas **sem as vazias**.
- **Remoção:** só depois do RED de preservação verde, `git rm` de `study-tracks.ts` e do teste dele.
- **Refactor:** nenhum.
- **Verificação:**
  ```sh
  npm test
  GATE
  grep -rn "study-tracks" src tests   # vazio
  ```
- **Aceite:** preservação provada; nenhuma seção vazia possível.
- **Commit:** `feat(domain): exam guides derived from the catalogue`

### T3.2 Reverificação das fontes oficiais

Este é o passo de conteúdo com rede.

- **Objetivo:**
  - Confirmar hoje, nas páginas oficiais, as afirmações que `/enem/` e `/uerj/` vão fazer (spec R5 e §10, passo 4).
  - Promover "INEP provas e gabaritos" a recurso publicado, se verificado (§6.3).
- **Arquivos:**
  - `docs/superpowers/research/2026-10-11-learning-library-sources.md` (anexar a seção "Reverificação Pexis Academy", com URL, data, o que a página afirma e a citação curta);
  - `src/lib/official-sources.ts` (datas);
  - `src/lib/learning-resources.ts` (+1 recurso `inep-provas-gabaritos`, `practice`, `goals: ['enem']`, `subject`).

  **Decisão a tomar e registrar:** o recurso cobre várias matérias, e o modelo exige um `subject`. Opções:
  - **(a)** mantê-lo como fonte oficial (`OfficialSource`) exibida na seção `pratique`, e **não** como recurso de catálogo;
  - **(b)** estender o modelo para recurso multimatéria.

  **Recomendação: (a).** É zero mudança de modelo; a §6.4 já prevê `sources` em seção. Isso fica registrado como interpretação da §6.3.
- **RED:**
  - em `official-sources.test.ts`: `verified.on` de cada fonte usada por `entenda`/`prepare`/`pratique` é ≥ a data desta reverificação (constante no teste);
  - em `exam-guides.test.ts`: `pratique` (ENEM) inclui a fonte `inep-provas-gabaritos`.
- **GREEN:** atualizar as datas e a seção `pratique` com a fonte. **Se uma URL não confirmar hoje:** a fonte sai, a afirmação sai, e o teste de seção não vazia decide se a seção sobrevive. Nunca se deduz URL nova.
- **Verificação:** `npm test` e depois `GATE`. Evidência: tabela no doc de auditoria.
- **Aceite:** toda afirmação factual prevista para `entenda` e `prepare` está listada no doc com a fonte e a data.
- **Commit:** `docs(research): re-verify official ENEM and UERJ sources`

### T3.3 `/enem/`

- **Objetivo:** spec §6.3 (ENEM). É hub, não lista de cursos.
- **Arquivos:**
  - `src/pages/enem/index.astro`;
  - `src/components/TrackSection.astro` e `src/components/SourceNote.astro` (novos);
  - `src/i18n/{types,pt}.ts`;
  - `scripts/verify-dist.mjs`.
- **RED** (`verify-dist`):
  - `/enem/` tem as seções `#entenda`, `#areas`, `#pratique` e `#aprofunde`, nessa ordem (literal);
  - `#entenda` contém 1 link oficial ou mais, de um host em `OFFICIAL_HOSTS`, e um `SourceNote` com data (`[data-source-note]` e `<time datetime>`);
  - `#areas` linka as 12 matérias, agrupadas nos 4 grupos de `ENEM_AREAS`, mais a Redação (literal);
  - `#aprofunde` tem 1 `[data-resource]` ou mais;
  - não há texto de datas ou notas de corte: buscar padrões de ano ou data além do `VERIFIED_ON`. Esse check é frágil; **trocar por revisão manual** registrada em T9.3 e **não** automatizar. Fica anotado aqui para não virar teste cosmético.
- **GREEN:**
  - `TrackSection` (título, porquê, slot ou `ResourceList`);
  - `SourceNote` ("Fonte oficial: {título}", link e "verificado em {data}");
  - página montada de `resolveGuide('enem')`;
  - as contagens de recursos por matéria são derivadas.
- **Refactor:** nenhum.
- **Verificação:** `GATE`.
- **Aceite:** o critério 5 da §13, para o ENEM.
- **Commit:** `feat(enem): preparation hub`

### T3.4 `/uerj/`

- **Objetivo:** spec §6.3 (UERJ). A personalidade própria vem das provas anteriores como espinha da página.
- **Arquivos:** `src/pages/uerj/index.astro`, `src/i18n/{types,pt}.ts`, `scripts/verify-dist.mjs`.
- **RED:**
  - seções `#entenda`, `#prepare`, `#materias` e `#provas`, nessa ordem;
  - `#provas` contém **todos** os 7 recursos `uerj-*-practice` (ids literais em `data-resource-id`);
  - `#entenda` e `#prepare` têm um `SourceNote`;
  - `#prepare` linka a fonte oficial e **não** contém tabela (`<table>` proibido: não replicamos tabelas de cursos).
- **GREEN:** página montada de `resolveGuide('uerj')`, reutilizando `TrackSection` e `SourceNote`.
- **Refactor:** se `/enem/` e `/uerj/` duplicarem o mesmo esqueleto de "lista de matérias com contagem", extrair `SubjectLinks.astro`.
- **Verificação:** `GATE`.
- **Aceite:** o critério 5 da §13, para a UERJ.
- **Commit:** `feat(uerj): preparation hub built on past exams`

### T3.5 `/ensino-medio/`

- **Objetivo:** spec §6.3, sem duplicar `/materias/` (R3).
- **Arquivos:** `src/pages/ensino-medio/index.astro`, `src/i18n/{types,pt}.ts`, `scripts/verify-dist.mjs`.
- **RED:**
  - para cada área acadêmica (5), há uma seção com a frase de orientação e os recursos `ensino-medio` dessas matérias (`SubjectResources` filtrado por goal);
  - 1 `[data-resource]` ou mais;
  - todo `[data-resource]` da página tem `ensino-medio` em `data-goals`.
- **GREEN:** página composta de `AREA_ORDER` (sem tecnologia, que aparece como link final para `/tecnologia/`) e `SubjectResources`.
- **Checkpoint R3:** comparar o conjunto de recursos e o texto com `/materias/` (registrado no commit). Se a página for só uma cópia filtrada, **parar e perguntar ao dono** se ela sai da V0.1 (a spec manda sair). Não decidir sozinho.
- **Verificação:** `GATE`.
- **Aceite:** RED verde e checkpoint registrado.
- **Commit:** `feat(ensino-medio): study map by area`

### T3.6 `/vestibulares/`

- **Objetivo:** spec §6.3, com o aviso editorial sobre a tag.
- **Arquivos:** `src/pages/vestibulares/index.astro`, `src/i18n/{types,pt}.ts`, `scripts/verify-dist.mjs`.
- **RED:**
  - a página linka `/uerj/`;
  - todo `[data-resource]` tem `vestibulares` em `data-goals`;
  - existe `#nota-editorial`.
  - Ausência de nomes de outros vestibulares: **revisão manual** em T9.3. Uma lista de nomes proibidos seria frágil e incompleta, logo não é automatizada.
- **GREEN:** orientação, destaque para a UERJ, recursos `vestibulares` por matéria, e a nota editorial.
- **Checkpoint R3:** o mesmo da T3.5.
- **Verificação:** `GATE`.
- **Aceite:** RED verde e checkpoint registrado.
- **Commit:** `feat(vestibulares): general preparation guidance`

---

## M4 Matérias

### T4.1 `/materias/`, o índice e destino de "Explorar"

- **Objetivo:** spec §6.3.
- **Arquivos:** `src/pages/materias/index.astro`, `scripts/verify-dist.mjs`.
- **RED:** a página contém 6 grupos `[data-area]` em ordem e linka as 12 matérias mais `/tecnologia/`; o header marca "Explorar" com `aria-current="page"`.
- **GREEN:** reutiliza `AreaList` (T2.2) com `headingLevel=2`.
- **Verificação:** `GATE`.
- **Aceite:** RED verde.
- **Commit:** `feat(materias): subject index`

### T4.2 Página de matéria: conteúdo, prática e objetivos

- **Objetivo:** spec §6.3, itens 2 a 4.
- **Arquivos:**
  - `src/pages/materias/[subject]/index.astro`;
  - `src/components/SubjectResources.astro` (novo: recebe a matéria e um filtro opcional de goal; renderiza Conteúdo e Prática, e omite a parte vazia);
  - `src/lib/learning-library.ts` (função pura `objectivesFor(subject)`);
  - `tests/learning-library.test.ts`;
  - `scripts/verify-dist.mjs`.
- **RED unitário:** `objectivesFor('matematica')` é exatamente `['enem','uerj','ensino-medio','vestibulares']`, na ordem de `OBJECTIVE_ORDER`, derivado; `objectivesFor('quimica')` não contém `uerj` (estado atual dos dados).
- **RED** (`verify-dist`), para cada uma das 12 matérias:
  - 1 `[data-resource]` ou mais;
  - todo `[data-resource]` tem `data-subject` igual à matéria da página;
  - `#pratique`, quando presente, contém só `data-format="practice"`;
  - `#conteudo` não contém `practice`;
  - `#objetivos` linka só rotas de objetivo.
- **GREEN:** página por `getStaticPaths` com `SubjectResources` e a lista de objetivos derivada.
  - **Fail-closed:** `getStaticPaths` lança erro se alguma matéria tiver zero recursos publicados (spec §6.3: matéria vazia não é publicada). Isso é coerente com a lista literal de 21: o build quebra e alguém decide.
- **Refactor:** nenhum.
- **Verificação:** `npm test` e depois `GATE`.
- **Aceite:** o critério 4 da §13 (a parte de recursos).
- **Commit:** `feat(materias): subject pages with content and practice`

### T4.3 Mapa de aprendizagem (`LearningMap`) e o mapa verificado de Matemática

- **Objetivo:** spec §6.1 e §6.3, item 1. Não se inventa currículo.
- **Arquivos:**
  - `src/components/LearningMap.astro` (novo);
  - `src/lib/taxonomy.ts` (os `topics` de `matematica`, **somente os itens verificados**);
  - `tests/taxonomy.test.ts`;
  - `scripts/verify-dist.mjs`;
  - `docs/superpowers/research/...-sources.md` (a tabela de correspondência entre o item proposto e o objeto de conhecimento da Matriz, com a citação).
- **Passo de conteúdo, antes do RED:**
  - abrir a Matriz de Referência do ENEM (fonte oficial, T0.4/T3.2) e conferir cada item proposto (Fundamentos, Aritmética, Álgebra, Funções, Geometria, Trigonometria, Estatística, Probabilidade);
  - item sem correspondência fica de fora;
  - se a Matriz não puder ser aberta hoje, `matematica.topics` fica `[]` e a T4.3 entrega só o componente e o teste.
- **RED unitário:** `SUBJECTS.matematica.topics` é igual à lista literal **verificada** (escrita a partir da tabela do doc), cada item com `source: 'inep-matriz-enem'` e `published: false`.
- **RED** (`verify-dist`):
  - toda página com `[data-learning-map]` contém `<ol>` e um `SourceNote`;
  - os itens do mapa **não** são links (V0.1);
  - páginas cuja matéria tem `topics: []` **não** têm `[data-learning-map]`.
- **GREEN:** `LearningMap` (`<ol>` e `SourceNote`), renderizado antes de `SubjectResources` só quando `topics.length > 0`.
- **Verificação:** `npm test`, `GATE`, e a tabela no doc de auditoria.
- **Aceite:** o critério 4 da §13 (o mapa cita a fonte); R6 mitigado.
- **Commit:** `feat(materias): source-backed learning map for mathematics`

---

## M5 Tecnologia

### T5.1 Trilhas (`tech-tracks.ts`)

- **Objetivo:** spec §6.3 (tabela de trilhas), com Q3 no padrão "trilha".
- **Arquivos:** `src/lib/tech-tracks.ts` (novo), `tests/tech-tracks.test.ts` (novo).
- **RED:**
  - a ordem das trilhas é a literal: `comecar-a-programar, ciencia-da-computacao, desenvolvimento-web, python, inteligencia-artificial, dados, seguranca-e-privacidade, git-e-github`;
  - os ids de recurso de cada trilha são **literalmente** os da spec;
  - todo id existe, está publicado e tem `subject: 'tecnologia'`;
  - toda trilha `published` tem 1 recurso ou mais; `git-e-github` tem `status: 'planned'` e zero recursos;
  - `publishedTracks()` exclui as `planned`;
  - **cobertura:** todo recurso publicado de tecnologia (17) aparece em pelo menos uma trilha publicada, para que nada fique órfão.
- **GREEN:** `TechTrackId`, `techTracks` (`{ id, label, why, status, resourceIds }`) e `publishedTracks()`.
- **Verificação:** `npm test` e depois `GATE`.
- **Aceite:** o teste de cobertura prova que nenhum recurso de tecnologia foi perdido no cutover.
- **Commit:** `feat(domain): technology tracks`

### T5.2 `/tecnologia/`

- **Objetivo:** spec §6.3 (Tecnologia).
- **Arquivos:** `src/pages/tecnologia/index.astro`, `src/i18n/{types,pt}.ts`, `scripts/verify-dist.mjs`.
- **RED:**
  - 7 `[data-track]` exatamente, na ordem literal;
  - nenhum `[data-track]` vazio (cada um tem 1 `[data-resource]` ou mais);
  - não há `[data-track="git-e-github"]`;
  - o header marca "Tecnologia" com `aria-current`.
- **GREEN:** a página monta as trilhas com `TrackSection` e `ResourceList`.
  - Um recurso repetido em duas trilhas aparece nas duas; a definição é única, e o `id` HTML recebe o prefixo da trilha para continuar único.
  - A invariante de ids únicos no HTML é checada (`id` duplicado falha).
- **Verificação:** `GATE`.
- **Aceite:** o critério 6 da §13.
- **Commit:** `feat(tecnologia): learning tracks`

---

## M6 Descoberta e busca

A busca está aprovada na spec, §6.8.

### T6.1 Índice de busca (`search-index.ts`) e normalização

- **Objetivo:** gerar o índice puro e determinístico (spec §6.8).
- **Arquivos:**
  - `src/lib/search-normalize.ts` (novo, compartilhado entre build e cliente);
  - `src/lib/search-index.ts` (novo);
  - `tests/search-index.test.ts` (novo).
- **RED:**
  - `normalize('Matemática')`, `normalize('MATEMATICA')` e `normalize('  matemática ')` são todos `'matematica'`; `normalize('Ciências')` é `'ciencias'`; `'ç'` vira `'c'`;
  - `matches(entry, 'matematica')` encontra a matéria Matemática; a consulta vazia encontra tudo; uma consulta com dois termos usa E (todos os termos);
  - `buildSearchIndex()` tem exatamente uma entrada por objetivo (5), área (6), matéria (13, com tecnologia), trilha publicada (7) e recurso publicado (37); assuntos publicados: 0;
  - toda `url` está em `canonicalPaths()`, salvo os recursos, que apontam para a página interna onde aparecem (matéria ou `/tecnologia/#trilha`), e nunca para o link externo;
  - não há `(kind, url, title)` duplicado;
  - a ordem é determinística: duas chamadas devolvem resultados idênticos (`deepEqual`).
- **GREEN:**
  - `normalize(s)` usa `NFD` e remove as marcas diacríticas;
  - `buildSearchIndex()` lê taxonomia, rotas, catálogo e trilhas;
  - `matches(entry, query)`.
- **Decisão registrada:** o destino de um recurso no índice é a página interna. Isso mantém o produto como a direção (spec §0) e mantém as regras de link externo concentradas no `ResourceItem`.
- **Verificação:** `npm test` e depois `GATE`.
- **Aceite:** 68 entradas (5 + 6 + 13 + 7 + 37), conferidas no teste.
- **Commit:** `feat(search): deterministic static search index`

### T6.2 `/buscar/` como diretório sem JS

- **Objetivo:** spec §6.8, fallback total.
- **Arquivos:** `src/pages/buscar/index.astro`, `src/components/SearchIndex.astro` (novo), `scripts/verify-dist.mjs`.
- **RED:**
  - `/buscar/` contém um link para **toda** página de `CANONICAL` (literal);
  - as entradas são agrupadas por tipo em `<section>` com headings;
  - cada entrada é um `<li data-search-entry data-terms="…">` com o texto normalizado;
  - o `<form role="search">` existe com `hidden` (o JS o revela);
  - a página funciona sem `<script>`, com o conteúdo completo no HTML.
- **GREEN:** `SearchIndex` renderiza `buildSearchIndex()` agrupado, com o form `hidden` e uma região `aria-live="polite"` vazia.
- **Verificação:** `GATE`.
- **Aceite:** com o JS desligado, a página é um diretório completo.
- **Commit:** `feat(search): server-rendered directory`

### T6.3 Filtro progressivo no cliente

- **Objetivo:** spec §6.8, com JS: filtro sem acento, `?q=` e anúncio da contagem.
- **Arquivos:**
  - `src/scripts/search.ts` (novo, importa `../lib/search-normalize.ts`);
  - `src/components/SearchIndex.astro`;
  - `scripts/verify-dist.mjs` (libera `<script>` **só** em `/buscar/`).
- **RED unitário:** a lógica de estado fica numa função pura em `search-normalize.ts`, `filterEntries(entries, query) → { visible: ids, count }`, testada com: consulta vazia; consulta sem acento; consulta sem resultado (`count 0`); espaços extras.
- **RED** (`verify-dist`): em `/buscar/` há exatamente um `<script type="module">` e ele aponta para `/_astro/`; nas outras páginas, nenhum.
- **GREEN:**
  - o script revela o form, lê `?q=` em `URLSearchParams`, aplica `filterEntries` e alterna `hidden` nos `li`;
  - esconde a `section` sem entradas visíveis;
  - atualiza o `aria-live` ("N resultados") e escreve `?q=` com `history.replaceState`, sem poluir o histórico;
  - sem fetch e sem `localStorage` (§6.9).
  - **Fail-open:** se o script falhar, o form continua `hidden` e o diretório completo continua visível.
- **QA manual** (é comportamento de DOM, e o repositório não tem runner de browser; não adicionar dependência), com a evidência em T9.2:
  - digitar "matematica" encontra Matemática;
  - `/buscar/?q=redacao` abre já filtrado;
  - o anúncio funciona no leitor de tela;
  - sem JS, o diretório aparece completo.
- **Verificação:** `npm test` e depois `GATE`.
- **Aceite:** o critério 7 da §13; o teste `hidden-state` continua verde.
- **Commit:** `feat(search): progressive client-side filtering`

---

## M7 Migração e limpeza

O grosso da remoção aconteceu em T1.1 (§0.4). Aqui fica o resíduo.

### T7.1 Raiz legada

- **Objetivo:** remover os arquivos pré-Astro versionados (spec §1.2 e §3).
- **Arquivos:** `git rm index.html pt/index.html assets/style.css`.
  - **`.nojekyll`:** o deploy via Actions publica um artifact do `dist/`, e o Jekyll não roda nesse fluxo. O arquivo da raiz não é publicado (não está em `dist/`). Remover.
  - **Verificar antes:** `grep -rn nojekyll .github scripts astro.config.mjs` deve vir vazio.
- **RED:** não se aplica. A verificação é a ausência de referências: `git grep -n "assets/style.css\|pt/index.html"` vazio.
- **Verificação:** `GATE`; o `dist/` não muda (comparar `find dist -type f | sort | sha1sum` antes e depois).
- **Aceite:** `dist/` idêntico, porque esses arquivos nunca foram publicados.
- **Commit:** `chore: remove pre-Astro files from the repository root`

### T7.2 Varredura de órfãos e de CSS morto

- **Objetivo:** "não manter arquitetura antiga por medo".
- **Arquivos:** `src/styles/global.css` e qualquer componente ou lib órfão.
- **RED:** novo teste, `tests/orphans.test.mjs`:
  - todo `src/components/*.astro` é importado por pelo menos um `.astro` em `src/pages` ou `src/components`;
  - todo `src/lib/*.ts` é importado por algum arquivo de `src`, `tests` ou `astro.config.mjs`;
  - **exceções explícitas e literais:** `resource-images.ts`, a decisão da spec §2.2, com comentário.
  - Varredura textual de imports; sem dependência.
- **GREEN:** remover o que o teste acusar; remover do `global.css` os custom properties não usados em nenhum `.astro` (verificado por `grep`).
- **Verificação:** `npm test` e depois `GATE`.
- **Aceite:** nenhum órfão fora das exceções declaradas.
- **Commit:** `chore: remove orphaned components and unused tokens`

### T7.3 README e documentação

- **Objetivo:** "documentação não mente" (spec §2.1).
- **Arquivos:**
  - `README.md` (reescrito);
  - `docs/superpowers/specs/2026-10-11-pexis-academy-v01-design.md` (apenas uma nota "Implementação: ver plano"; o conteúdo da spec não muda);
  - `docs/superpowers/research/...` (já atualizado em T3.2 e T4.3).
- **O README cobre:**
  - o que é a Pexis Academy;
  - a tabela de rotas, gerada à mão a partir de `routes.ts`;
  - como adicionar um recurso (catálogo, verificação, `COURSE_HOSTS` no `verify-dist`);
  - como adicionar uma trilha;
  - como adicionar um assunto (fonte obrigatória);
  - os comandos;
  - a política de curadoria;
  - os resíduos declarados (as imagens de curso sem render);
  - sem texto pessoal.
- **RED:** o teste `orphans.test.mjs` ganha uma checagem: todo caminho `src/...` citado no README existe.
- **Verificação:** `npm test` e depois `GATE`.
- **Aceite:** nenhum caminho morto no README.
- **Commit:** `docs: rewrite README for Pexis Academy`

### T7.4 Cobertura de dados preservados (auditoria final de não destruição)

- **Objetivo:** provar que nada útil foi perdido no cutover.
- **Arquivos:** `tests/learning-resources.test.ts` (já tem o snapshot de T1.2).
- **Verificação adicional, registrada no commit:**
  ```sh
  git diff dd15aa4 -- src/lib/learning-resources.ts   # só mudanças de id/area/goal/export
  git show dd15aa4:src/lib/study-tracks.ts             # todos os ids cobertos pelo teste de T3.1
  ```
- **Aceite:**
  - 40 registros, com as mesmas URLs e datas de verificação;
  - todo id das trilhas antigas coberto pelos guias novos;
  - todo recurso de tecnologia em alguma trilha.
- **Commit:** nenhum, se nada mudar; senão `test: assert catalogue preservation across the cutover`.

---

## M8 SEO e acessibilidade

### T8.1 Sitemap e robots

- **Objetivo:** spec §8.2.
- **Arquivos:** `src/pages/sitemap.xml.ts` (novo), `public/robots.txt` (novo), `scripts/verify-dist.mjs`.
- **RED:**
  - `dist/sitemap.xml` existe e é XML válido (checagem estrutural com regex: `<urlset`, `<loc>` absolutos);
  - o conjunto de `<loc>` é **igual** ao `CANONICAL` literal, as duas barreiras da R10;
  - nenhum redirect e nenhuma 404 no sitemap;
  - `dist/robots.txt` contém `Sitemap: https://guilhermehrcst.github.io/sitemap.xml`.
- **GREEN:** o endpoint estático lê `canonicalPaths()` e `site` (de `astro.config`, via `import.meta.env.SITE` ou `Astro.site` no contexto de endpoint). O `robots.txt` é estático.
  - **Q5:** quando o domínio mudar, o `Sitemap:` do robots muda junto. Isso fica anotado no README.
- **Verificação:** `GATE`.
- **Aceite:** o critério 11 da §13.
- **Commit:** `feat(seo): sitemap and robots`

### T8.2 Metadados únicos e rotas antigas

- **Objetivo:** spec §8.1 e §8.3.
- **Arquivos:** `scripts/verify-dist.mjs`, `src/i18n/pt.ts` (ajustes de texto).
- **RED:**
  - title e description são **únicos** entre as 21 páginas;
  - title com 60 caracteres ou menos (o "~60" da spec é tratado como teto de 65, com tolerância documentada no `verify-dist`);
  - `og:title` e `og:description` são iguais a title e description; `og:url` é igual ao canonical;
  - `twitter:card` igual a `summary`; não há `og:image`.
  - A invariante de redirects de T1.1 é revisitada: cada página de redirect **não** aparece no sitemap (já coberto em T8.1) e tem `<link rel="canonical">` para o destino.
- **GREEN:** corrigir o texto que violar.
- **Verificação:** `GATE`.
- **Aceite:** metadados sem duplicata.
- **Commit:** `feat(seo): unique page metadata`

### T8.3 Contraste medido dos tokens

- **Objetivo:** spec §6.7 e R8: contraste **medido**, não estimado.
- **Arquivos:** `src/lib/contrast.ts` (novo, puro), `tests/contrast.test.ts` (novo), `src/styles/global.css` (ajustes).
- **RED:**
  - `contrast('#ffffff', '#0b57d0')` está em 6.4 ± 0.05, comparado com o valor registrado no README antigo; isso calibra a função contra uma referência conhecida;
  - o teste lê `global.css` como texto, extrai os hex de `:root` e verifica:
    - `--ink/--paper` ≥ 7;
    - `--muted/--paper` ≥ 4.5;
    - `--action/--paper` ≥ 4.5;
    - `--paper`/`--action` (texto branco ou papel no botão) ≥ 4.5;
    - `--action-hover` com as mesmas regras;
    - `--ink/--surface` ≥ 7;
    - `--muted/--surface` ≥ 4.5.
  - O teste garante também que **nenhum hex** aparece fora de `:root` em `src/**/*.{astro,css}`.
- **GREEN:** a função de luminância relativa (WCAG 2.x). Ajustar os tokens até passar.
- **Verificação:** `npm test` e depois `GATE`.
- **Aceite:** razões registradas no README; Q1 continua aplicável (se o azul mudar, o teste diz se o novo passa).
- **Commit:** `test(a11y): enforce measured token contrast`

### T8.4 Invariantes estruturais de acessibilidade

- **Objetivo:** spec §7, a parte automatizável sem browser.
- **Arquivos:** `scripts/verify-dist.mjs`.
- **RED**, em todas as páginas:
  - a ordem de headings **não salta níveis** (h1 → h3 sem h2 falha);
  - todo `<a>` tem texto acessível não vazio (texto ou `aria-label`);
  - não há rótulos ambíguos repetidos: dois links com o mesmo texto e `href` diferentes falham, salvo se tiverem `sr-only` diferenciador (o "Acessar recurso" tem o título em `sr-only`);
  - todo `id` é único na página;
  - todo `nav` tem `aria-label` único na página;
  - todo link externo tem o aviso "nova aba" em `sr-only`;
  - não há `tabindex` positivo;
  - o `global.css` contém regra `:focus-visible` e um bloco `prefers-reduced-motion: reduce` que zera transições.
- **GREEN:** corrigir as violações encontradas.
- **Verificação:** `GATE`.
- **Aceite:** a parte estrutural do critério 13 da §13. O resto é QA manual (T9.2).
- **Commit:** `test(a11y): structural accessibility invariants`

---

## M9 Validação final

### T9.1 Portão completo a partir do zero

- **Comando:**
  ```sh
  rm -rf dist node_modules/.astro && npm ci && GATE
  ```
- **Aceite:**
  - os três comandos verdes;
  - `verify-dist` mostra 21 páginas canônicas, 7 redirects e a 404;
  - nenhuma dependência nova: `git diff dd15aa4 -- package.json` mostra só o script `test`;
  - `package-lock.json` sem mudança de dependências.
- **Commit:** nenhum.

### T9.2 QA em browser, com evidência

Usa o Chromium pré-instalado. Os scripts de QA ficam no **scratchpad**; nada de dependência nem script no repositório.

- **Servir:** `npx astro preview`.
- **Viewports** 360, 390, 768, 1024 e 1440, em todas as 21 páginas mais a 404:
  - `document.documentElement.scrollWidth <= innerWidth` (sem scroll horizontal);
  - screenshot da Home, `/enem/`, `/uerj/`, uma matéria, `/tecnologia/` e `/buscar/` em 390 e 1440.
- **Teclado:**
  - o Tab percorre o skip link → o header → o conteúdo;
  - foco visível em cada parada (screenshot de 3 estados);
  - sem armadilha de foco.
- **Sem JS** (`javaScriptEnabled: false`): todas as páginas completas; `/buscar/` mostra o diretório.
- **Reduced motion** (`reducedMotion: 'reduce'`): nenhuma transição.
- **Busca:** os 4 cenários de T6.3.
- **Revisões manuais pendentes** (T3.3 e T3.6):
  - nenhuma data ou nota de corte inventada no ENEM e na UERJ;
  - nenhum vestibular não verificado citado;
  - linguagem sem emoji e sem urgência de cursinho.
- **Saída:** `docs/superpowers/plans/2026-10-11-pexis-academy-v01-qa.md`, com a tabela de resultados; os screenshots ficam no scratchpad e são enviados ao usuário, **sem** commit de binários.
- **Commit:** `docs: record Pexis Academy v0.1 QA evidence`

### T9.3 Revisão adversarial do diff inteiro

- **Comando:**
  ```sh
  git diff dd15aa4...HEAD --stat
  ```
  Depois, leitura completa do diff.
- **Procurar:**
  - URL interna literal fora de `routes.ts`, `astro.config.mjs` e das listas literais do `verify-dist` e dos testes: `grep -rnE "href=\"/[a-z]" src`;
  - hex fora de `:root`;
  - `localStorage`/`cookie`/`fetch` em `src/`;
  - qualquer texto pessoal remanescente;
  - qualquer seção ou feature fora da §5.
- **Aceite:** achados corrigidos em commits pequenos, cada um com `GATE`; ou nada a corrigir.

### T9.4 Validação de deploy

**Exige autorização.**

- **Local:** o `GATE` reproduz exatamente o job `build` do `.github/workflows/deploy.yml` (`npm ci` → `npm test` → `astro check` → `npm run build`). O workflow **não muda**.
- **CI, com autorização explícita do dono:**
  - `git push -u origin claude/pexis-academy-v01`;
  - abrir PR;
  - o job `build` roda em `pull_request` (o deploy **não** roda em PR, por regra do workflow);
  - a evidência é o check verde no PR.
  - **Sem merge.**
- **Pós-merge** (fora deste plano e só com decisão do dono), verificar no GitHub Pages real:
  - `/resume/` responde 404 com a página da Pexis;
  - `/courses/` redireciona para `/materias/`;
  - `/sitemap.xml` e `/robots.txt` estão acessíveis.

  O comportamento do Pages com a 404 e os redirects só pode ser provado em produção; fica como **risco residual declarado**.
- **Rollback:** reverter o merge commit, conforme a spec §10.

### Evidence packet final

O relatório para o dono contém:
- os commits;
- as invariantes adicionadas;
- os testes (contagem antes e depois);
- os resultados do QA;
- as perguntas Q1 a Q6 ainda abertas e onde cada uma impactou;
- os riscos residuais, com R1, R2 e R4 e a validação pós-merge do Pages;
- os itens não verificados.

---

## Revisão crítica do plano

Feita antes do commit.

**Tarefas grandes demais:**
- **T1.1 (cutover):** é grande, e de propósito. Dividir criaria commits vermelhos (links do header para páginas inexistentes) ou adaptadores descartáveis para a i18n e o catálogo antigos (§0.4). As mitigações:
  - o RED foi escrito antes e visto falhar em massa;
  - a remoção é por lista fechada (spec §3), com `git rm` explícito;
  - a verificação de órfãos está no próprio passo;
  - o aceite é objetivo (inventário fechado do `dist/` e denylist).
- **Rejeitado:** separar o shell visual (tokens e layout) num commit anterior com nomes temporários (`LegacyBase`, `legacy.css`). Isso custaria 2 renomes de ida e volta sem reduzir o risco real.
- **T3.3 e T3.4** foram mantidas separadas por exame, e a T3.2 (rede e conteúdo) foi isolada do código.

**Dependências circulares:** nenhuma. O grafo de dependências mostra:
- o domínio (M0) não depende de UI;
- a UI depende do domínio;
- a busca depende de taxonomia, rotas, catálogo e trilhas, e nada depende da busca;
- a única inversão de ordem (M4 antes de M3) foi explicitada.
- **Corrigido durante a revisão:** uma aresta "guias → busca" tinha entrado no grafo e foi removida. A busca **não** indexa as seções dos guias (a spec §6.8 lista objetivos, áreas, matérias, assuntos, trilhas e recursos), logo essa dependência não existe.

**Lacunas de testes encontradas e fechadas:**
- teste esquecido no script → T0.1 (glob);
- cópia literal de `COURSE_HOSTS` divergindo do catálogo → T1.2 compara as duas;
- recurso de tecnologia órfão depois do cutover → T5.1 (cobertura);
- ids das trilhas antigas perdidos → T3.1 (preservação);
- README com caminho morto → T7.3;
- hex fora dos tokens e contraste estimado → T8.3;
- `id` HTML duplicado com recurso em duas trilhas → T5.2 e T8.4;
- invariante de recurso sem consumidor (não mordia) → T1.3 prova com consumidor temporário.

**Lacunas aceitas, com o motivo:**
- comportamento de DOM da busca e QA visual: sem runner de browser no repositório, e adicionar um seria uma dependência nova contra a §12; a cobertura é a lógica pura testada mais QA manual registrado;
- ausência de datas inventadas e de vestibulares não verificados: revisão manual, porque um teste por regex seria frágil e incompleto;
- comportamento real do Pages com a 404 e os redirects: só verificável depois do merge.

**Mudanças destrutivas sem verificação:** nenhuma ficou.
- T1.1: RED antes, lista fechada, inventário e denylist depois.
- `study-tracks` só é removido depois do teste de preservação (T3.1).
- O catálogo é protegido por snapshot de caracterização escrito **antes** da migração (T1.2).
- Raiz legada: o `dist/` é comparado por hash antes e depois (T7.1).

**Duplicação:**
- os rótulos de domínio vivem só em `taxonomy.ts`, e não também no dicionário;
- `normalize` é compartilhado entre o build e o cliente (`search-normalize.ts`);
- as listas literais duplicadas (as 21 rotas no teste e no `verify-dist`, `COURSE_HOSTS`) são **intencionais**: são barreiras independentes (R10), e a divergência entre elas é ela mesma testada.

**Overengineering evitado:**
- sem modal de busca, sem JSON de índice e sem motion JS;
- sem content collections e sem `@astrojs/sitemap`;
- sem hambúrguer e sem `HomeSection` abstrato (só extraído com 3 repetições);
- sem recurso multimatéria (T3.2 usa `OfficialSource`);
- sem runner de browser;
- sem feature flags para esconder páginas incompletas: o walking skeleton resolve sem estado extra.

**Desvios do pedido:**
- **M7** fica com a limpeza residual, porque a remoção principal acontece no cutover (M1). A justificativa está na §0.4 e se apoia na spec §10, passo 3.
- **M4 executa antes de M3.** A numeração foi preservada.
