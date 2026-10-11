# Pexis Academy V0.4 — Catálogo & Descoberta

**Status:** especificação proposta, não implementada e não aprovada para produção  
**Data de referência:** 11/10/2026  
**Repositório:** `guilhermehrcst/guilhermehrcst.github.io`  
**Base observada:** `main`, commit `5991a4e0e8761cccfa7a02391ae1115c9e6c0f6a` (PR #32, V0.3 incorporada). Reconfirmar o HEAD antes de trabalhar.  
**Referências:** Home em `reference/Pexis-Academy-Home-V03.pdf`; design system `docs/superpowers/design-system.md`; V0.3 `docs/superpowers/specs/2026-10-11-pexis-academy-v03-design.md` do repositório.  
**Pesquisa editorial:** `docs/superpowers/research/2026-10-11-v04-60-candidates.csv` neste pacote. **São candidatos, não recursos revalidados para publicação**.

## 0. Decisões executivas

1. A V0.4 é uma **evolução editorial, de navegação e dados**, não uma recriação do projeto nem uma nova plataforma de ensino com login.
2. O site terá seis caminhos canônicos, nesta ordem: **Ensino Fundamental, Ensino Médio, Vestibular, Pré-Militar, Ensino Superior, Tecnologia**. ENEM e UERJ continuam como destinos internos de Vestibular.
3. A meta é destacar **dez recursos distintos e homologados por caminho, sessenta itens editoriais únicos**. Isso NÃO limita o catálogo inteiro a sessenta: preservar recursos verificados já publicados, inclusive os que não entram nos destaques.
4. A lista de sessenta recebida na conversa contém **cursos, trilhas, aulas, simulados, bancos de questões, provas anteriores e materiais de referência**. Nunca chamar todos de "60 cursos".
5. Os dez destaques de cada caminho devem ser fontes adequadas, úteis, realmente gratuitas para o conteúdo oferecido e acessíveis por links diretos oficiais. Falhas de validação não são preenchidas com recursos fictícios.
6. Preservar Astro 7 + TypeScript estrito + build estático + GitHub Pages. Sem React, banco de dados, CMS, backend, contas de aluno ou biblioteca de animação, salvo evidência técnica demonstrada.
7. Preservar a identidade V0.3: logo oficial, `#720111`, papel `#faf8f4`, Newsreader + Google Sans Flex, shell vinho do header e footer. Não substituir por um tema genérico.
8. Não fazer push, abrir PR, merge nem deploy sem autorização do proprietário; executar testes e preparar evidências primeiro.

## 1. Evidência do estado atual

### 1.1 PDF da Home (página única, layout vertical)

- Header vinho com Explorar, Vestibular, Pré-Militar, Tecnologia e Buscar.
- Hero "Aprenda com direção.", dois CTAs e um exemplo real de estudo (Vestibular → ENEM → Matemática → Kultivi → INEP).
- "Qual é o seu objetivo?": seis caminhos, com Fundamental e Pré-Militar marcados "Em preparação".
- Jornada "Objetivo → Área → Assunto → Conteúdo → Prática".
- Instituições/fontes, explorar por área, três trilhas em destaque, política de curadoria, FAQ e footer vinho com quatro grupos.
- Portanto, **não** transformar a Home em sessenta cards. Home continua orientadora; catálogo fica nas páginas internas e busca.

### 1.2 Evidência do código em `main`

- `package.json`: Astro 7, TypeScript 6, `npm test`, `npm run check`, `npm run build` (inclui `scripts/verify-dist.mjs`).
- `src/lib/taxonomy.ts`: seis `PathId` canônicos; `PREPARING_PATHS` ainda contém Fundamental e Pré-Militar.
- `src/lib/routes.ts`: rotas canônicas, breadcrumb e redirects legados.
- `src/lib/learning-resources.ts`: registro tipado único, fontes, metadados e verificação.
- `src/lib/learning-library.ts`: seleções editoriais e `objectiveFacts`.
- `src/lib/higher-education.ts`: agrupamentos universitários por IDs do catálogo.
- `src/lib/tech-tracks.ts`: trilhas de tecnologia ordenadas por IDs; preservar as sete já publicadas.
- `src/lib/search-index.ts` e `src/components/SearchIndex.astro`: busca determinística client-side com fallback HTML sem JavaScript.
- `src/components/SiteHeader.astro` e `SiteFooter.astro`: identidade institucional, `<details>` acessível sem dependência de JS.
- `scripts/verify-dist.mjs`: invariantes independentes do build, inclusive sitemap, rotas, fontes externas e scripts.
- A V0.3 foi incorporada à `main` pelo PR #32. Branch anterior `claude/pexis-academy-v01` divergiu devido ao merge squash; **não tentar reintegrá-la como se estivesse faltando**.

### 1.3 Problema de consistência a corrigir

O helper `tech()` em `learning-resources.ts` marca todo recurso de Tecnologia com `goals: ['ensino-medio']`. Já `objectiveFacts('ensino-medio')` conta por `goals`, incluindo esses itens, enquanto `ObjectiveMap` exclui a área Tecnologia da listagem curricular. Isso pode inflar a contagem de Ensino Médio e não corresponde à experiência que a página oferece. **Corrigir separando público/etapa/caminho de associação curricular/exame, com teste de regressão.**

## 2. Experiência: percurso do estudante

**Fluxo principal:** escolher objetivo → reconhecer disciplina ou exame → localizar recurso → entender o formato e os requisitos → abrir fonte oficial.  
**Fluxo alternativo:** pesquisar título, matéria, instituição, tipo ou exame → filtrar → abrir a página interna que contextualiza o recurso → ir à fonte.

Princípios: zero cadastro na Academy, zero anúncios disfarçados, zero surpresa de paywall, nenhuma promessa de certificado ou diploma não confirmada, sem listas vazias fingindo ter conteúdo. Reduzir cliques sem eliminar contexto editorial.

## 3. Contrato de cada página

| Caminho | Rota preservada | Estrutura V0.4 | Particularidade |
| --- | --- | --- | --- |
| Ensino Fundamental | `/ensino-fundamental/` | Anos iniciais (1º–5º), anos finais (6º–9º); disciplinas, recursos, prática | Não reutilizar conteúdo de Médio para preencher quota; indicar ano adequado quando verificado. |
| Ensino Médio | `/ensino-medio/` | Matérias por áreas, destaques, acervo completo e estudo/atividade | Dez destaques são seleção, não redução do catálogo existente. |
| Vestibular | `/vestibulares/` | ENEM, UERJ e fontes verificadas dos demais vestibulares; cursos, redação, provas, simulados | Manter `/enem/` e `/uerj/`; não criar páginas Fuvest/Unicamp/Unesp sem justificativa e fonte verificada. |
| Pré-Militar | `/pre-militar/` | Exército, Aeronáutica, Marinha; processos; materiais por tipo e banca | Distinguir provas oficiais de cursos; sem datas/requisitos físicos/médicos sem edital atualizado. |
| Ensino Superior | `/ensino-superior/` | Cursos e aulas universitários agrupados por campo, com idioma e instituição | Conteúdo de nível superior NÃO equivale a matrícula, crédito acadêmico ou diploma. |
| Tecnologia | `/tecnologia/` | Sete trilhas existentes + dez destaques editoriais e catálogo preservado | Tecnologia é caminho autônomo, não uma subcategoria obrigatória de Ensino Médio. |

Os caminhos são **seis**; as matérias/áreas internas não precisam ser seis. `PATH_ORDER` deve continuar fonte de verdade das rotas de formação. Usar títulos no singular ou plural já aprovados nas URLs existentes; não quebrar `/vestibulares/`.

### 3.1 Componentes compartilhados

- `PageIntro`: breadcrumb, título, lead e estado honesto.
- Listas/linhas de recursos existentes antes de novos componentes; um card novo só quando trouxer benefício mensurável de legibilidade.
- Navegação intra-página por disciplinas/grupos em páginas extensas, com IDs estáveis e âncoras abaixo do sticky header.
- Um recurso tem CTA primário **"Abrir na fonte"**, título/provedor/idioma/tipo e estado de certificado/cadastro apenas quando confirmados.
- Conservar o footer com Formação, Matérias, Explorar, Institucional e atribuições de marcas de terceiros.

## 4. Padrão editorial e homologação

### 4.1 Estados

- **Candidato:** existe no CSV; não é considerado pronto e jamais entra em catálogo público apenas por estar no CSV.
- **Retido:** URL ou gratuidade/idioma/escopo/certificação não confirmados, oferta indisponível ou acesso restrito; guardar motivo.
- **Homologado:** página de origem aberta diretamente, acesso integral gratuito confirmado, classificação fiel e evidência registrada com data.
- **Publicado:** homologado + incluído na fonte única do site + visível no local correto + busca interna funcional.

### 4.2 Metadados mínimos

`id` estável, título exato, instituição/autoria, URL **HTTPS direta** da fonte, caminho(s) e assunto(s) relevantes, tipo real, idioma, nível escolar quando pertinente, requisitos de cadastro conhecidos, certificado (`gratuito`, `pago-opcional`, `inexistente`, `não-confirmado`), data e método/evidência da verificação e texto editorial curto. Dados de matrícula, prazos e edital somente quando fonte atual existir.

Não inventar duração, vídeo, documento, certificado, logo, dado de edital, preço ou ano escolar. Se um campo não é conhecido, **não o exibir como fato**. Separar metadados acadêmicos dos metadados comerciais.

### 4.3 Regras absolutas

- Conteúdo integral representado é gratuito; teste gratuito/trecho de amostra não passa.
- Certificado pago opcional pode coexistir com ensino gratuito, se explicado corretamente.
- Link direto para página oficial ou canal/playlist oficial do autor; evitar agregadores e landing pages genéricas sem o recurso descrito.
- Não copiar vídeos ou apostilas protegidos; a Academy agrega e encaminha à fonte.
- Independência: marcas pertencem às instituições e não indicam patrocínio, produção, parceria ou chancela.
- Recursos para crianças: não pedir informações pessoais, não criar perfil de menor, nem introduzir analytics comportamental por padrão.
- Provas anteriores, aulas avulsas e atlas são **recursos**, não "cursos". Um portal genérico não conta como curso individual; preferir destino específico.

### 4.4 Os sessenta candidatos

O CSV em `docs/superpowers/research/2026-10-11-v04-60-candidates.csv` contém dez itens por caminho. Ele foi **transcrito da seleção conversacional anterior, não revalidado nesta auditoria**. URLs em `source_url_hint` são apenas pistas de rechecagem, nunca autorização automática de publicação. Substituições devem ser justificadas e documentadas; o objetivo é utilidade real e 60 recursos **distintos**, não atingir número artificialmente.

## 5. Arquitetura de dados recomendada

### 5.1 Preservar fonte única

Estender `learning-resources.ts` / `learning-library.ts`, sem manter dois catálogos paralelos que possam divergir. Preservar IDs, URLs e metadados dos itens existentes sem rechecagem que autorize mudança. Novos formatos podem requerer `reference`, `past-exam`, `simulator`, etc. Não quebrar o renderer de recursos antigos.

**Separar três eixos:**

1. **Caminho/público**: quais das seis etapas atendem o item (`PathId[]`).
2. **Assunto**: disciplina escolar/tecnologia, quando cabível; pode faltar em uma prova completa multidisciplinar.
3. **Objetivo/exame**: ENEM, UERJ ou seleção específica, quando houver evidência.

O campo atual `goals` não é sinônimo de `PathId`. Corrigir `tech()` e `objectiveFacts` para que a contagem de Ensino Médio não herde os recursos de Tecnologia automaticamente. Prefira extensão compatível e tipada; se precisar tornar `subject` opcional em materiais interdisciplinares, usar uma união discriminada ou guardas estáticos, não atribuir assunto falso. Documentar migração e preservar `tests/learning-resources.test.ts` como snapshot do legado, atualizando-o somente quando a mudança semântica for intencional e justificada.

### 5.2 Seleções editoriais vs. catálogo

Adicionar um único mapeamento editorial tipado `featuredResourceIdsByPath: Record<PathId, readonly string[]>` (nome ajustável ao estilo existente), com dez IDs homologados por área na aceitação final. Falhar explicitamente quando algum ID for inexistente, não publicado, duplicado dentro da lista ou reaproveitado de modo que a promessa "60 únicos" deixe de ser verdadeira. Um mesmo curso pode ser encontrado em mais de uma área via filtros, mas **pertencer a uma única seleção principal**; a contagem de "destaques" deve explicitar essa semântica. O catálogo total pode ter >60 registros.

### 5.3 Contadores

- **Destaques:** tamanho da seleção por caminho, sem repetição.
- **Recursos disponíveis:** registros publicados realmente renderizados/filtráveis naquele caminho, distintos por `id`.
- **Trilhas:** trilhas existentes resolvidas por IDs; um recurso repetido em duas trilhas não incrementa "recursos únicos" duas vezes.
- Contagens da Home são derivadas dessas seleções, nunca literais. Testar congruência entre badge, DOM e índice de busca.

### 5.4 Endereços de recursos e busca

Preferir que um resultado de recurso em `/buscar/` abra **a página interna e a âncora em que o recurso é renderizado**, nunca página errada ou item invisível. Introduzir âncoras estáveis por `id`, garantindo destino único e válido. Não criar sessenta páginas detalhadas só para suportar a busca. Expandir a indexação existente para Superior, Fundamental e Pré-Militar, inclusive matérias, fontes e formatos, sem indexar candidatos retidos.

### 5.5 Hosts externos e segurança

Atualizar `COURSE_HOSTS`, `OFFICIAL_HOSTS` e o espelho independente em `verify-dist.mjs` **somente** para domínios oficiais homologados. Validação server-side de `https://`, protocolos aceitos, duplicatas, atributos externos e ausência de recursos não publicados. Nenhum request a domínios externos durante carregamento da página; navegação ocorre ao clicar.

## 6. Busca e filtros

A página `/buscar/` já entrega conteúdo em HTML sem JS. Preservar isso. Com JavaScript habilitado, oferecer filtros progressivos e responsivos para **caminho, matéria/exame, tipo, instituição e idioma**, usando os campos existentes e estado de URL quando viável. Filtros combinam AND entre dimensões e OR dentro de multi-seleção; buscas por texto toleram acentos. Exibir contagem honesta e estado vazio com ação clara para limpar filtros. Não requerer autenticação, serviço externo, API, cookies ou backend.

Se houver trade-off de performance, começar com texto + caminho + tipo e expandir os demais somente com teste demonstrando boa UX. Não transformar página de busca em SPA; JS fica encapsulado na busca, com fallback completo.

## 7. Linguagem visual e conteúdo

**Base:** o PDF da V0.3 e `docs/superpowers/design-system.md`. Usar sistema de tokens, sem hex solto por componente.

- Manter institucional vinho no header/footer, logotipo e contraste testado.
- Conservar hero "Aprenda com direção.", duas ações principais e demonstração com recursos reais; atualizar exemplo só se os URLs continuarem válidos.
- Home: seis caminhos, um exemplo de jornada, exploração por área, trilhas, fontes, curadoria, FAQ. Facilitar acesso a Buscar e aos recursos **sem listar sessenta cards na Home**.
- Páginas internas: módulos editoriais por estágio e formato, hierarquia visual consistente e listas com informação útil por linha. Nada de carrossel automático, gradiente vistoso, gráficos vazios, imagens de bancos genéricos ou ícones decorativos em excesso.
- Tipografia Newsreader para títulos, Google Sans Flex para interface, fundo claro; responsividade 320/360/390/768/1024/1440.
- Textos sem promessas de certificados gratuitos, diplomas ou afiliação institucional sem evidência.

## 8. SEO, privacidade e acessibilidade

- Preservar canonical, Open Graph, sitemap, sete redirects legados, 404 e `/enem/`, `/uerj/`.
- Caminho sem recursos homologados permanece "Em preparação" + `noindex`, fora do sitemap. Remover essas restrições **somente após haver recursos verificados e página informativa**. A conclusão da V0.4 exige os dez destaques por caminho.
- Nenhuma matrícula ou diploma é oferecido pela Academy; links levam às instituições.
- WCAG 2.2 AA como alvo: landmarks, único H1, títulos em ordem, labels, foco visível, contraste, navegação teclado, toque, `prefers-reduced-motion`, menu com `<details>` e bom comportamento sem JS.
- Não incluir rastreamento de menores, login, geolocalização, embeds de vídeo de terceiros, pixels ou coleta pessoal.
- Não registrar termo de parceiro, patrocinador ou uso de logos externas sem fundamentação e licença.

## 9. Critérios de aceitação

**Dados e qualidade**

- [ ] Sessenta IDs editoriais **únicos**, dez em cada um dos seis caminhos; todos homologados antes da declaração de conclusão.
- [ ] Cada item renderizado com título/provedor/tipo/idioma coerentes e link HTTPS oficial funcionando.
- [ ] Catálogo preexistente preservado; nenhuma remoção apenas por não entrar nos destaques.
- [ ] Ensino Médio não conta curso tecnológico por associação automática. Contagens por caminho e por trilha são exatas e testadas.
- [ ] Provas/atlas/aulas não são apresentados como cursos; certificado e cadastro só aparecem quando verificados.
- [ ] Candidatos com link ou acesso não verificáveis não aparecem como publicados e geram relatório de bloqueio.

**Produto**

- [ ] Seis páginas oferecem conteúdo adequado, caminhos claros e CTAs sem 404.
- [ ] ENEM e UERJ permanecem acessíveis dentro de Vestibular; redirects antigos preservados.
- [ ] Busca encontra e aponta para as páginas/âncoras corretas; filtros são combináveis e acessíveis.
- [ ] Home mostra apenas informações reais, sem inventar números/instituições.
- [ ] Sem alterações não aprovadas à identidade visual e ao escopo da plataforma.

**Qualidade**

- [ ] `npm test`, `npm run check`, `npm run build` (com `verify-dist`) passam.
- [ ] Testes RED/GREEN cobrindo conteúdo, duplicação, classificação, links, busca, sitemap, preparação e contagens.
- [ ] QA nas larguras 320/360/390/768/1024/1440, sem overflow horizontal, sem controle inacessível; teclado e sem JS.
- [ ] Contraste, foco, redução de movimento, labels e sem requests a terceiros auditados.
- [ ] Capturas comparativas Home V0.3 → V0.4; Safari e Firefox quando disponíveis, declarar quando não.
- [ ] Relatório com arquivos alterados, decisões, comandos e resultados, itens homologados/retidos e riscos.
- [ ] Sem push/PR/merge/deploy antes de autorização.

## 10. Fora de escopo

Streaming/hosting próprio de cursos, pagamento, criação de contas, trilhas com progresso persistente, emissão de certificados/diplomas, gestão de turma, banco/CMS, IA recomendadora, chat, novo branding e formação militar física/médica. Futuras extensões não devem contaminar a versão inicial.

## 11. Questões de validação com o proprietário

**Sem bloqueio para iniciar implementação:** o catálogo editorial inicial tem dez itens por caminho. Se um candidato não passar verificação, substituir por um melhor e registrar o porquê. A escolha estética V0.3 e o uso das seis rotas estão decididos. **Bloqueios reais:** não publicar um item sem evidência de gratuidade/URL e não inventar requisitos militares ou acadêmicos. Caso a rede esteja indisponível, produzir a parte técnica e um relatório preciso, deixando os itens retidos fora do site e a etapa incompleta.
