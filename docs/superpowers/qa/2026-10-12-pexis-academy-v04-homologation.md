# Pexis Academy V0.4 | Homologação técnica e QA de release

**Data:** 12/10/2026. **Executor:** Claude Code (sessão remota). **Escopo:** QA completo do PR #37, simulação isolada do release dos 60 destaques e correção dos bloqueios encontrados. Nada foi publicado, enviado ao remoto, mergeado ou implantado.

Este documento tem duas rodadas. **A rodada 2 é o estado atual**; a rodada 1 fica abaixo como registro.

## Rodada 2 — correção dos bloqueios (estado atual)

**Branch:** `qa/v04-homologation`, local. **HEAD testado:** `b22d913`, sobre `0e1b150` e `28bdaa0` (preservados) e `440b48a` (PR #37).

### Decisão atualizada

**Lançamento bloqueado: NO-GO para publicar os 60 destaques.** Agora resta **um único bloqueio**: a homologação em navegador das 37 URLs novas.

- Os dois P1, os quatro P2 e o problema de metadados da Open University foram corrigidos com TDD.
- **A simulação de release passa sem nenhum contorno.** Ela aplica só as etapas deliberadas de um release: promoção, 60 destaques liberados, Fundamental e Pré-Militar ativos e as listas manuais do `verify-dist`.
- A homologação em navegador continua pendente para as 37 URLs. O ambiente de QA não alcança os hosts (o proxy nega a conexão). **Isso não prova que os recursos estejam indisponíveis**: nada foi demonstrado nem refutado sobre eles nesta sessão.

**Decisão técnica sobre o código:** pronto para o release, condicionado a três coisas:
1. homologação das 37 URLs em navegador com rede liberada;
2. a atualização deliberada dos 41 guardas de staging registrados;
3. as listas de hosts e caminhos do `verify-dist` no commit de release.

Sem a evidência das 37, a publicação continua **NO-GO**. A autorização final é humana.

### Correções

| ID | Problema | Correção | Commit | RED → GREEN |
|---|---|---|---|---|
| P1-RC1 | A Home não era gerada quando o MIT tinha cursos fora de Tecnologia | `homeSources()` (`src/lib/home-sources.ts`). Instituição com cursos numa página: mesmo link de trilha e mesmo texto de antes. Com cursos em várias páginas: `/buscar/?instituicao=<valor>`, só se o valor for um filtro que a busca oferece, e o texto lista todas as áreas ("8 cursos em Tecnologia, Matemática e Ciências da Natureza"). As validações continuam: só cursos, nenhum curso sem matéria, nenhum sem página. O `verify-dist` confere o valor do filtro na busca gerada e exige resultados em mais de uma página. | `5b47a35` | 3 testes RED; simulação sem a falha; 2 injeções rejeitadas (filtro inexistente; filtro de instituição com cursos numa página só) |
| P1-RC2 | O `verify-dist` exigia exatamente dois grupos no Superior, com dois cursos cada | Ordem dos campos escrita à mão. Matemática e Computação sempre presentes, primeiro e com pelo menos dois cursos. Campo novo só com pelo menos um curso publicado. Nunca vazio, desconhecido, repetido ou fora de ordem. | `b04e20b` | RED na simulação ("group fisica lists 1 courses"); 4 injeções rejeitadas (grupo vazio, campo desconhecido, ordem trocada, Matemática com 1 curso) |
| P2-RC3 | O Vestibular rejeitava `#destaques` antes de "provas" | `#destaques` é aceito só como primeira seção; a ordem do hub vale depois dele. A seção de destaques continua conferida pela regra própria (dez recursos distintos). | `b217062` | RED na simulação; injeção com destaques fora do topo rejeitada |
| P2-RC4 | Os testes só aceitavam MIT e Harvard como universidades | Lista escrita à mão em `tests/university-publishers.ts`: MIT, Harvard, Open Yale Courses e The Open University | `b04e20b` | falha da simulação (teste 82) eliminada |
| P2-RC5 | `/enem/` repetiria o link do INEP na nota de fonte e no recurso | A nota continua citando o INEP com data de verificação, mas aponta para o recurso na página (`#recurso-inep-enem-provas-gabaritos`). O recurso, a âncora, a seleção e a contagem de 60 se mantêm. O `verify-dist` só aceita a nota se essa âncora estiver na mesma seção e o próprio link do item for de host oficial. O teste do ENEM passa a usar `isPractice`, a regra real do domínio. | `1884110` | RED no teste do release candidate; na simulação, 1 link externo do INEP em "Pratique" (eram 2); âncora inexistente rejeitada |
| P2-RC7 | Guardas de staging e prontidão de release misturados | `tests/release-candidate/` reúne o que precisa passar hoje e depois do release (prontidão, Home, Superior, ENEM). `STAGING-GUARDS.md` lista os 41 testes que falham por desenho na promoção, medidos sem contorno; um teste mantém essa lista exata. **Nenhum guarda foi enfraquecido.** | `b22d913` | 9/9 testes de release candidate passam na produção e na simulação |
| Metadados | A Open University aparecia como "Declaração de conclusão" | Novo valor `certificate: 'participation'`, com o rótulo "Declaração de participação". O `statement` da FGV não muda ("Declaração de conclusão"). A planilha do Lote 02 continua dizendo `statement`; o teste documenta o refinamento a partir da própria nota da planilha. | `1f48c7b` | 1 teste RED |

### Resultados

| Verificação | Produção (`b22d913`) | Simulação de release (`b22d913` + etapas de release) |
|---|---|---|
| `npm test` | **233/233** | 192/233. As 41 falhas são exatamente os guardas registrados; **0 falhas em `tests/release-candidate/`**. |
| `npm run check` | 0 erros, 0 avisos | 0 erros, 0 avisos |
| Build + `verify-dist` | 22 páginas, 2 em preparação, todos os invariantes | **24 páginas, 0 em preparação, todos os invariantes, sem contorno** |
| `dist` vs início da rodada 2 | **byte-idêntico**: as correções não mudam nenhum HTML publicado hoje | — |
| Fase D (âncoras, busca, rotas, destinos) | 99/99 (rodada 1; `dist` idêntico) | **173/173** com 74 recursos |
| Fase E (6 larguras, 25 páginas) | sem mudança (`dist` idêntico) | 846/872; só os padrões já triados da rodada 1, nenhum novo |
| Filtro do MIT (Playwright) | — | O link da Home abre a busca com o MIT marcado: 8 resultados, todos do MIT, em `/tecnologia/` e `/ensino-superior/` |
| Ativação parcial | — | 6/6 casos corretos (completa aceita; com 9, só ITA, staging, liberação em preparação e caminho sem recursos recusados) |
| Retorno ao staging | — | `dist` byte-idêntico ao build de produção |
| 37 legados | byte-idênticos à `main` | mesma página e âncora para os 37; registros idênticos |
| Cada commit da série | testes e tipos verdes em todos | — |

As evidências estão em `2026-10-12-v04-evidence/round2/`:
- `rc-release-steps.patch` e `rc-apply.py`: as únicas mudanças da simulação;
- `rc-verify.log`, `rc-test-summary.txt`, `rc-phaseD.txt`, `rc-phaseE.txt` e `rc-mit-filter.json`;
- capturas da Home (`#fontes`, 390 e 1440 px), do ENEM ("Pratique") e do Superior.

### Regressões investigadas

- **Erro de tipo em `9e33ca3`.** O shim de testes não declara `notDeepEqual`. O `npm run check` acusou 3 erros que deixei passar porque a cadeia de comandos não checava o código de saída. Corrigi com `assert.ok` e juntei os dois commits locais em `b22d913`; todo commit da série foi conferido isoladamente. O gate agora checa os códigos de saída.
- **Build quebrado durante a correção do P1-RC1.** A reescrita do componente removeu o import `routes`. Foi detectado pelo `check` e pelo build antes do commit.
- **88/99 numa reexecução da Fase D.** O preview estava servindo o build de staging deixado pelo teste de retorno. A simulação foi reconstruída, e a execução válida deu 173/173.
- **Teste 147 da simulação (37 vs. 74).** É uma contagem de snapshot. Conferi à parte que os 37 legados mantêm exatamente página e âncora.

### Bloqueios remanescentes

1. **B-37: homologação em navegador pendente das 37 URLs.**
   - O ambiente de QA não alcança os 17 hosts (proxy 403 por política).
   - Classificação no manifesto: `PENDING_BROWSER_HOMOLOGATION`, `qa_access: BLOCKED_BY_QA_ENVIRONMENT`, `availability_evidence: none`.
   - Precisa ser feita em navegador comum, com rede liberada, registrando data e evidência por item. Revalidar a URL da Escola Naval (`id_file`) e os PDFs da Marinha.
2. **Gate D (commit de release).** Tudo deve entrar junto:
   - promoção;
   - `FEATURED_RESOURCE_IDS_BY_PATH` e `FEATURED_RELEASE`;
   - `PATH_STATUS`;
   - os 17 hosts em `COURSE_HOSTS`;
   - `PREPARING`, `CANONICAL`, `OBJECTIVE_PATHS`, `PATH_PAGES` e a ordem das trilhas no `verify-dist`;
   - os 41 guardas de `STAGING-GUARDS.md`, um a um.

   O modelo exato é `round2/rc-release-steps.patch`. Os hosts de produção **não foram alterados** nesta etapa.

**Residual (P3):** sem JavaScript, o link do MIT abre o diretório completo, sem filtro aplicado. O conteúdo continua acessível; nada é escondido nem inventado.

### Gates (rodada 2)

| Gate | Resultado |
|---|---|
| **A — código** | **Atingido.** 233/233, 0 erros de tipo, build OK, `dist` de produção inalterado. |
| **B — conteúdo** | **Não atingido.** Classificação e invariantes OK; homologação em navegador pendente para 37 URLs. |
| **C — UX** | **Atingido** em produção e no release candidate, agora **sem contorno**: âncoras, busca, filtro do MIT, rotas e páginas sem 404. |
| **D — release** | **Não iniciado.** Preparação completa e medida (acima). |

---

# Rodada 1 — registro original (substituído pela rodada 2)

## Decisão (rodada 1)

**NO-GO para publicar os 60 destaques. Lançamento bloqueado.** (P1 e P2 resolvidos na rodada 2.)

Três bloqueios independentes, cada um suficiente sozinho:

1. **Nenhuma das 37 URLs novas foi homologada nesta sessão.**
   - A política de rede do ambiente nega todos os 17 hosts.
   - Classificação revista na rodada 2: homologação em navegador pendente para as 37. O bloqueio do proxy não é evidência de indisponibilidade.
   - Por isso o Gate B não foi atingido.
2. **Publicar os seis cursos do Ensino Superior quebra o build da Home (P1-RC1).**
3. **O plano de grupos do Ensino Superior viola uma barreira do `verify-dist` (P1-RC2).** Liberar exige uma decisão editorial explícita.

**O PR #37 como entrega de staging (sem publicar nada) é tecnicamente sólido.**
- O `dist` é idêntico ao da `main`, exceto pela ordem de uma regra CSS igual.
- Os 37 recursos legados ficam byte-idênticos.
- Os invariantes passam, e as ativações parciais são recusadas.

Fazer o merge dele continua sendo decisão do proprietário. A decisão técnica do Claude não substitui a autorização humana.

## 1. Branch e SHA testados

| Item | Valor |
|---|---|
| PR em avaliação | #37, `feat/academy-gateb-typed-staging-v01` |
| HEAD conferido no remoto | `440b48a390cdc985df5ab2d04acfcb880da78993` (igual à referência) |
| `main` conferida | `5e4b086c9b34be40f069cbc85148b093d0439230` (igual à referência; é a base do PR) |
| Branch local de QA | `qa/v04-homologation` = `440b48a` + 1 correção (`28bdaa0`) + este relatório |
| Simulação de release | worktree descartável `qa/rc-simulation-discardable` (local, nunca enviada); patch em `2026-10-12-v04-evidence/rc-simulation.patch` |

## 2. Ambiente

| Item | Valor |
|---|---|
| Sistema | Linux (contêiner de nuvem do Claude Code) |
| Node / npm | v22.22.0 / 10.9.4 (o projeto exige ≥ 22.12.0) |
| Astro / TypeScript | 7.3.6 / 6.0.3 (lockfile; `npm ci` com 0 vulnerabilidades) |
| Navegadores | **apenas Chromium** (Playwright 1.56.1, chromium-1194). **Firefox e WebKit não estão instalados**, então não foram testados. |
| Rede | Proxy com política restritiva. Hosts externos das fontes e o próprio `guilhermehrcst.github.io` respondem `403` ao CONNECT. `github.com` abre (controle positivo). |

## 3. Comandos executados

```
git fetch origin main feat/academy-gateb-typed-staging-v01
git checkout -b qa/v04-homologation 440b48a…
npm ci && npm test && npm run check && npm run build
node open37.mjs                 # Fase B: Chromium em cada uma das 37 URLs
node audit60.mjs                # Fase C: 28 invariantes independentes
node adversarial.mjs            # Fase C: 23 mutações que devem ser rejeitadas
astro preview (PR #37 :4321, main :4322, simulação :4323)
node phaseD.mjs                 # Fase D: âncoras, busca, rotas, destinos
node phaseE.mjs                 # Fase E: 25 páginas × 6 larguras e checagens a11y/SEO
node partial.mjs                # Fase F: ativações parciais
git stash && astro build && diff -rq   # Fase F: retorno ao staging
npm audit; varredura de segredos/rastreamento/scripts   # Fase G
```

Os scripts estão em `docs/superpowers/qa/2026-10-12-v04-evidence/`.

## 4. Resultados dos testes

| Verificação | PR #37 (`440b48a`) | QA (`28bdaa0`) | Simulação de release |
|---|---|---|---|
| `npm test` | 217/217 | **218/218** (+1 teste novo) | 177/218. As 41 falhas são guardas de isolamento do staging e snapshots que falham por desenho quando algo é promovido. Analisadas abaixo. |
| `npm run check` | 0 erros, 0 avisos | 0 erros, 0 avisos | 0 erros, 0 avisos |
| `npm run build` + `verify-dist` | 22 páginas, 2 em preparação, OK | OK | Sem ajustes: **o build quebra** (P1-RC1). Com contorno só na simulação: 146 problemas, todos de listas manuais. Com as listas atualizadas: 24 páginas, 0 em preparação, OK. |
| Auditoria dos 60 (Fase C) | 28/28 | 28/28 | n/a |
| Adversarial (Fase C) | 23/23 rejeitadas | — | 6/6 ativações parciais tratadas corretamente |
| Fase D (âncoras, busca, rotas) | 99/99 | — | 173/173 (74 recursos) |
| Fase E (6 larguras, 25 páginas) | 844/872; as 28 falhas foram triadas, só 1 real (corrigida) | — | 846/872; mesmos padrões, nenhum novo |
| `dist` vs `main` | idêntico, exceto a ordem de uma regra CSS igual em `/ensino-superior/` | Home muda só o atributo `aria-hidden`; captura idêntica | — |

**Fase C no detalhe:**
- 60 IDs distintos, dez por caminho, sem URL duplicada.
- Nenhum candidato novo repete URL de recurso legado.
- `resourceProblems()` vazio para todos os 60, com data de referência 12/10.
- Todas as datas são 11 ou 12/10.
- `featuredProblems('final')` e `gatebDraftProblems()` vazios.
- Evidência hospedada no mesmo host do recurso.
- Provas com `subject: null`.
- `schoolYears` só no Fundamental, sempre com evidência de série.
- Seleção e URLs idênticas ao JSON da revisão 05.
- Cecierj PVS como `reference`, sem `exams`.
- AprovaRJ como `course` com cadastro obrigatório.
- ESA nunca apresentada como EsPCEx, e nenhum ID de EsPCEx na seleção.
- **Os 37 publicados são byte-idênticos à `main`.**
- Nada liberado: listas vazias, tudo em `staging`, Fundamental e Pré-Militar em preparação.
- Nenhuma lacuna de destino projetado; nove destinos não liberados.

**Adversarial.** Foram rejeitados:
- data futura, data impossível, método `search-index` e método ausente;
- evidência em outro host, evidência ausente e HTTP;
- escopo e cadastro sem conferência;
- ano escolar fora do Fundamental, sem evidência, desordenado ou igual a 10;
- prova fora do caminho e recurso sem caminho;
- seleção com 9, com 11, com ID em dois caminhos, ID repetido, ID desconhecido, ID em caminho que ele não declara e staging contra o catálogo real;
- prova militar com o Pré-Militar em preparação.

Uma mutação minha (A21) estava errada: trocava dois IDs que declaram ambos os caminhos. Corrigida para A21b, ela foi rejeitada.

## 5. Evidências de QA visual (Fase E)

Capturas comprimidas em `2026-10-12-v04-evidence/`:
- **estado atual:** Home a 320 e 1440 px, busca a 390 px, Superior a 1440 px, 404 a 320 px;
- **simulação:** Fundamental e Pré-Militar a 320 e 1440 px, Superior a 1440 px, Tecnologia a 390 px.

Os resultados por checagem estão em `e-phaseE.json` (atual) e `f-phaseE.json` (simulação).

| Critério | Resultado |
|---|---|
| Overflow horizontal (320–1440) | nenhum, em 25 páginas × 6 larguras (atual e simulação) |
| Um `h1` e `lang="pt-BR"`; imagens com `alt` | OK em todas |
| Contraste AA (heurística de cor computada) | só glifos decorativos `→` (`aria-hidden`) e `/`. As duas barras do demo da Home não eram `aria-hidden`: **corrigido** (P3-E1). |
| Alvos de toque (WCAG 2.5.8) | Links "Tudo sobre…" têm 22–23 px de altura e passam pela exceção de espaçamento (0 violações medidas). Checkboxes de 20 px ficam dentro de rótulos de 358×44 px. |
| Foco visível e teclado | 25 paradas de Tab em Home, Busca, Superior e Tecnologia, todas com contorno visível. A primeira parada é o skip link. |
| Sem JavaScript | busca exibe o diretório completo (73 entradas); Home completa; menu mobile em `<details>` nativo |
| Movimento reduzido | nenhuma animação ou transição; sem rolagem suave |
| Canonical, sitemap e `noindex` | 22 canonical corretas. Páginas em preparação ficam com `noindex`, sem canonical (por desenho, exigido pelo `verify-dist`) e fora do sitemap. Na simulação: 24 no sitemap. |
| Requisições externas e erros de console | zero em todas as larguras |
| Links internos | todos respondem 200; 404 para rota desconhecida |
| Rotas legadas | as 7 redirecionam corretamente (atual e simulação) |
| Identidade visual vs `main` | capturas idênticas (hash) com as fontes carregadas. Uma diferença inicial da Home a 1440 px era instabilidade de captura e sumiu ao esperar `document.fonts.ready`. |

## 6. Resultado individual das 37 URLs

O manifesto auditável é `2026-10-12-pexis-academy-v04-homologation-37.json`.

**Resumo: 0 VERIFIED · 0 PARTIAL · 37 com homologação em navegador pendente.** (A rodada 1 dizia "BLOCKED", no sentido de acesso insuficiente do ambiente; a rodada 2 troca o rótulo para não sugerir indisponibilidade.)

- **Motivo comum:** acesso insuficiente. O Chromium recebeu `net::ERR_TUNNEL_CONNECTION_FAILED` nas 37 URLs, e o log do proxy registra `403` por política para cada host.
- **Controle positivo:** o mesmo navegador abriu `github.com` (200).
- **Evidência anterior:** a da revisão editorial 05 (ChatGPT, abertura externa) está registrada em cada item, mas **não foi reproduzida** e não conta como homologação deste QA.

| Caminho | IDs (homologação em navegador pendente) |
|---|---|
| Fundamental (10) | `ef-sme-alfabeto-1`, `sme-goiania-letras-e-palavras`, `ef-sme-vegetacao-3`, `ef-sme-municipio-4`, `ef-sme-vestigios-5`, `sme-goiania-leitura-em-foco`, `ef-obmep-fracoes-6`, `ef-sme-tecnologia-vida-7`, `ef-obmep-potenciacao-8`, `ef-sme-funcoes-9` |
| Vestibular (8) | `kultivi-enem-completo`, `inep-enem-provas-gabaritos`, `fuvest-acervo-2026`, `cecierj-pvs-portugues-v1`, `cecierj-pvs-matematica-mod1`, `cecierj-pvs-historia-mod2`, `cecierj-pvs-geografia-mod1`, `cecierj-pvs-fisica-v1` |
| Pré-Militar (10) | `ita-provas-anteriores`, `pm-cn-provas`, `pm-en-provas`, `pm-eear-provas`, `pm-eam-provas`, `pm-afa-provas`, `pm-epcar-provas`, `cecierj-aprovarj`, `pm-esa-provas-2026`, `pm-ime-provas` |
| Superior (6) | `mit-1801sc`, `mit-801sc`, `mit-7012`, `yale-psyc-110`, `yale-econ-252`, `ou-environment-treading-lightly` |
| Tecnologia (3) | `odin-foundations`, `google-mlcc`, `ms-learn-cloud-concepts` |

### Itens de atenção especial

O que foi comprovado nos dados, sem homologar a fonte:

- **Marinha** (Colégio Naval, Escola Naval, Aprendizes-Marinheiros):
  - os registros apontam PDFs diretos;
  - na pesquisa externa, os três exigiram uma rota alternativa;
  - a URL da Escola Naval depende do parâmetro `id_file=8961`, cuja estabilidade não foi comprovada;
  - é preciso revalidar em navegador comum.
- **EsPCEx:** fora da seleção e não validada. `pm-esa-provas-2026` é a prova da ESA, com título e ID de ESA; nenhum registro alega EsPCEx.
- **Cecierj PVS:** as cinco apostilas são `reference`, sem `exams`, e as notas dizem "não é prova da UERJ".
- **AprovaRJ:** é `course`, com `registration: required` e `certificate: none`. É distinto da prova ESA. A área autenticada não foi aberta.

## 7. Invariantes dos 60 candidatos

Todos se mantêm no estado do PR (seção 4, Fase C). A simulação acrescenta:
- cada caminho exibe 10 destaques distintos, sem aviso de preparação e sem `noindex`;
- as âncoras `#recurso-<id>` existem e o clique a partir da busca leva ao recurso certo, abaixo do cabeçalho fixo, para os 74 recursos, a 390 e 1440 px;
- a trilha Computação em Nuvem e os cinco grupos novos do Superior só aparecem quando os recursos são publicados.

**Ativação parcial:** foram recusadas a ativação com 9 destaques, a ativação com só o ITA publicado, os destaques em `staging` num caminho ativo, a liberação num caminho em preparação e o caminho ativo sem recursos.

**Retorno ao staging:** sem as mudanças da simulação, o `dist` fica byte-idêntico ao build de staging.

**Os 17 domínios novos** estão fora de `COURSE_HOSTS` e precisam ser incluídos no momento da promoção:

| | |
|---|---|
| Marinha | `assets.marinha.mil.br`, `www.inscricao.marinha.mil.br` |
| Cecierj | `canal.cecierj.edu.br`, `extensao.cecierj.edu.br` |
| Exército | `esa.eb.mil.br`, `www.ime.eb.mil.br` |
| Força Aérea | `ingresso.eear.fab.mil.br`, `www.fab.mil.br` |
| Ensino Fundamental | `sme.goiania.go.gov.br`, `portaldaobmep.impa.br` |
| Vestibular | `www.fuvest.br` |
| ITA | `vestibular.ita.br` |
| Superior | `oyc.yale.edu`, `www.open.edu` |
| Tecnologia | `developers.google.com`, `learn.microsoft.com`, `www.theodinproject.com` |

A consistência entre `COURSE_HOSTS` e a cópia no `verify-dist` é garantida por `tests/verify-dist-hosts.test.ts`.

## 8. Problemas, gravidade e correções

| ID | Gravidade | Problema | Evidência | Estado |
|---|---|---|---|---|
| B-37 | **Bloqueio de release** | 37 URLs sem homologação reproduzível neste ambiente | `phase-b-open37-raw.json`, log do proxy | Aberto: exige abertura em rede liberada, por pessoa ou ambiente com acesso |
| P1-RC1 | **P1** | Publicar `mit-1801sc`, `mit-801sc` e `mit-7012` faz `OfficialSources.astro` lançar `MIT OpenCourseWare spans pages; say where` e a Home não é gerada. O componente pressupõe que todos os cursos de um provedor são de Tecnologia e ficam numa trilha. | `rc-build-p1-rc1-failure.log` (simulação sem contorno, build com exit 1) | **Resolvido na rodada 2** (`5b47a35`). Antes: Aberto. É decisão de produto: como a Home cita um provedor presente em várias áreas. Não corrigido por estar fora do escopo de correção segura. |
| P1-RC2 | **P1** | `verify-dist` (linhas 629–630) exige exatamente os grupos Matemática e Computação no Superior, cada um com pelo menos 2 cursos. O plano do PR #37 cria Física, Biologia, Psicologia, Economia e Meio Ambiente, cada um com 1 curso. | `verify-dist` da simulação | **Resolvido na rodada 2** (`b04e20b`). Antes: Aberto. Exige decidir: aceitar grupos de 1 curso (alterando a barreira) ou reagrupar. |
| P2-RC3 | P2 | `verify-dist` (linha 581) exige que o Vestibular abra com "provas"; com destaques liberados, a seção `destaques` vem antes | `verify-dist` da simulação | **Resolvido na rodada 2** (`b217062`). Antes: Aberto, para o commit de release |
| P2-RC4 | P2 | `tests/higher-education.test.ts` aceita só MIT e Harvard como universidades; Open Yale Courses e The Open University reprovam | teste 82 da simulação | **Resolvido na rodada 2** (`b04e20b`). Antes: Aberto, para o commit de release |
| P2-RC5 | P2 | Em `/enem/`, a seção "Pratique" mostraria "Provas e gabaritos do Enem" duas vezes, como fonte oficial e como recurso `past-exam`, com a mesma URL. O teste 41 exige `format === 'practice'`. | `dist/enem` da simulação | **Resolvido na rodada 2** (`1884110`). Antes: Aberto. Decisão editorial: mostrar só um dos dois. |
| P2-RC7 | P2 (processo, resolvido na rodada 2: `b22d913`) | 41 testes de snapshot e isolamento e 8 listas manuais do `verify-dist` precisam de atualização deliberada no release. É o comportamento esperado da barreira independente, mas é trabalho obrigatório do Gate D. | `rc-test.log`, `rc-simulation.patch` | Esperado e documentado |
| P3-RC6 | P3 | `certificate: 'statement'` aparece como "Declaração de conclusão"; a Open University oferece "statement of participation" | captura `rc-sim-superior-1440.jpg` | **Resolvido na rodada 2** (`1f48c7b`). Antes: Aberto, editorial |
| P3-E1 | P3 | Barras `/` do demo da Home eram texto anunciado a 1,6:1 | Fase E | **Corrigido** em `28bdaa0`: `aria-hidden="true"`, teste novo (RED → GREEN), captura idêntica à `main`, 218/218 |

Nenhum P0.

**Contornos usados só na simulação, nunca no PR:**
- filtro dos provedores de Tecnologia em `OfficialSources` (P1-RC1);
- grupos com ≥ 1 curso (P1-RC2);
- `destaques` antes de "provas" (P2-RC3);
- listas manuais do `verify-dist`.

## 9. Limitações de cobertura

- Firefox e WebKit não foram testados (indisponíveis). Também não foi usado leitor de tela real; a semântica foi conferida no DOM.
- O site publicado e as 37 fontes externas não foram alcançáveis (política de rede).
- O contraste foi medido por heurística de cor computada, sem considerar fundos em imagem.
- Não houve revisão visual humana de todas as 300 capturas, só de uma amostra. As demais checagens foram automáticas.
- Revisão de segurança proporcional, **não é teste de intrusão**.

## 10. Riscos residuais

- Links externos podem mudar depois da homologação, especialmente PDFs militares e a URL com `id_file`. `VALIDATED_ONCE != VALID_FOREVER`.
- Não há CSP: o GitHub Pages não define cabeçalhos e o site não tem `<meta>` de CSP. É mitigado por não haver scripts de terceiros, haver só um script inline (`/buscar/`, que só usa `textContent`) e nenhum formulário que envie dados.
- `level: 'beginner'` provisório no Fundamental (não exibido).

## 11. Recursos bloqueados ou retidos

- **As 37 posições novas:** retidas, com homologação em navegador pendente (o ambiente impediu a verificação).
- **EsPCEx:** fora da seleção, PDF oficial recusado na pesquisa externa.
- **Itens legados sem URL:** `ms-explore-genai`, `ibm-genai` e `ms-azure-ai` continuam retidos (inalterados).

## 12. Gates

| Gate | Definição (plano V0.4) | Resultado |
|---|---|---|
| **A — código** | baseline e testes verdes; sem alteração incidental de identidade | **Atingido**: 218/218, 0 erros de tipo, build OK, `dist` idêntico à `main` |
| **B — conteúdo** | 60 recursos únicos verificados e classificados | **Não atingido**: classificação correta (28/28), mas 37 URLs sem homologação reproduzida |
| **C — UX** | nenhum caminho vazio declarado pronto; busca e navegação sem 404 | **Atingido no estado atual** e na simulação, com os contornos marcados. Os P1 e P2 de release precisam ser resolvidos antes de repetir o Gate C sobre o candidato real. |
| **D — release** | autorização humana explícita e revisão do diff | **Não iniciado.** Preparação abaixo. |

## 13. Preparação do Gate D

Um commit de release, numa branch nova a partir da `main` vigente, terá de fazer, juntas:

1. Homologar as 37 URLs em navegador comum, com data e evidência, e atualizar as notas onde algo mudar.
2. Resolver P1-RC1, P1-RC2, P2-RC5 e P3-RC6 por decisão editorial.
3. Mover os registros de staging para `catalogue` sem tocar nos 37 legados.
4. Preencher `FEATURED_RESOURCE_IDS_BY_PATH` com os 60, pôr `FEATURED_RELEASE` em `released` e ativar Fundamental e Pré-Militar em `PATH_STATUS`.
5. Atualizar as listas manuais do `verify-dist`:
   - os 17 hosts;
   - `PREPARING`, `CANONICAL`, `OBJECTIVE_PATHS` e `PATH_PAGES`;
   - a ordem das trilhas, os grupos do Superior e a ordem das seções do Vestibular.

   O modelo é `rc-simulation.patch`.
6. Atualizar deliberadamente os 41 testes de isolamento e snapshot, revisando cada um.
7. Rodar o gate completo, repetir as Fases D e E, revisão independente e CI; só então pedir autorização.

## 14. Respostas objetivas

- **Os 60 recursos podem ser publicados com segurança?** Não. Há bloqueios de evidência (B-37) e de build (P1-RC1, P1-RC2).
- **Os 37 links novos foram realmente homologados?** Não nesta sessão: 0 de 37. A única evidência é a abertura externa anterior, não reproduzida.
- **As seis categorias funcionam corretamente?** Sim no estado atual: 4 ativas, 2 em preparação corretas. Na simulação também, depois dos contornos marcados.
- **Os recursos antigos permaneceram intactos?** Sim. Os 37 são byte-idênticos à `main`, com uma âncora cada, busca 37/37 e rotas legadas OK.
- **A experiência mobile está adequada?** Sim: sem overflow de 320 a 1440 px, alvos e foco conformes, sem JavaScript e movimento reduzido OK.
- **Existem problemas P0, P1 ou P2?** P0 nenhum. P1: dois (de release). P2: quatro. P3: dois (um corrigido).
- **Há impedimentos para o lançamento?** Sim: B-37, P1-RC1 e P1-RC2.
- **Quais ações concretas faltam?** As sete etapas da seção 13.
- **Decisão:** **NO-GO. Lançamento bloqueado.**
