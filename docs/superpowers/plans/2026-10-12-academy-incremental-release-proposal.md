# Pexis Academy V0.4 | Proposta de liberação incremental de recursos

**Status:** PROPOSTA PARA DECISÃO. **Não é autorização para alterar as regras do release ou publicar conteúdo.**  
**Base técnica observada:** PR #37 em `de953ac973bd390873c69b8b186c6720fcc0bb11`.  
**Contexto:** QA externo de 37 novos candidatos, incluindo conteúdo confirmado, verificações parciais e dificuldade de abertura do PDF ESA 2026. O catálogo atual de 37 recursos publicados permanece preservado.

## 1. Problema e princípio

O contrato de V0.4 combina dois objetivos distintos:

1. **Segurança editorial:** nenhum recurso aparece ao aluno sem comprovação adequada do conteúdo, gratuidade, procedência e metadados.
2. **Meta de curadoria:** dez destaques por caminho, sessenta destaques distintos.

Hoje, `src/lib/path-status.ts` exige que **Ensino Fundamental e Pré-Militar só se tornem ativos depois de seus dez destaques homologados e liberados**; `src/lib/featured.ts` valida dez por caminho quando uma lista é liberada. Isso faz um único URL externo problemático bloquear recursos já prontos, sem aumentar a segurança de cada recurso.

**Proposta:** tornar a **autorização de cada recurso** independente da **completude dos destaques**. Continuar com a meta editorial de dez destaques por caminho, mas tratá-la como um marco de curadoria, não como condição para liberar todo o catálogo.

## 2. Contrato editorial mínimo por formato

Toda publicação exige URL HTTPS oficial, fonte e título verdadeiros, formato real, caminho correto, idioma, gratuidade para o material anunciado, registro datado de verificação e um destino interno que renderize o recurso. Exibir cadastro/certificado apenas se comprovados. Não inferir série escolar, edital, ano de prova, duração nem emissão de certificados.

| Tipo | Evidência necessária | Limite honesto |
| --- | --- | --- |
| Curso ou trilha | Página oficial, unidade/aula concreta alcançável, conteúdo de estudo gratuito, regra de cadastro observada quando aplicável | Não prometer reprodução ou certificação que não tenha sido testada |
| Aula ou série de aulas | Conteúdo ou uma aula acessível e relacionado ao título, com série/etapa conferida na fonte | Vídeo não reproduzido fica registrado como pendência específica; avaliar se material textual alternativo cumpre a oferta |
| Prova anterior ou simulado | Fonte da instituição organizadora, concurso/ano/tipo reais, documento que exibe questões legíveis | PDF extraível mas impraticável no navegador não recebe aprovação automática; avaliar outro link **oficial** ou suspender só a prova |
| Material de referência | Documento/obra específica e amostra de conteúdo acessível, autoria e abrangência correspondentes | Não tratar apostila como curso nem apostila de Cecierj como prova oficial UERJ |
| Prática ou lista de questões | Exercício ou conjunto de questões realmente aberto, sem pagamento obrigatório | Não inventar gabarito, soluções ou progresso salvo |

**Observação:** acesso público da página, texto extraído, navegação interativa, reprodução de mídia, acessibilidade do PDF e elegibilidade a certificado são evidências diferentes. O relatório deve dizer exatamente o que demonstrou. Cursos que pedem conta gratuita podem entrar apenas com o cadastro indicado corretamente e evidência suficiente da gratuidade anunciada.

## 3. Estados e aprovações individuais

Sugeridos para futura implementação, com padrão **nega por padrão**:

- `candidate`: identificado; não publicado.
- `verified`: passou no contrato do formato, com evidências datadas.
- `approved`: editor aprovou **ID, URL exata e versão/data da evidência** para inclusão. Toda alteração de URL, inclusive no mesmo host, exige nova autorização.
- `published`: entrou no catálogo público, com teste de integridade, rota, link e busca.
- `held`: pendência ou risco identificado; retido, sem bloquear outros IDs.
- `suspended`: publicado anteriormente, mas removido de exposição mediante evidência de link quebrado ou problema material, com trilha de auditoria.

Não interpretar um `verified` automaticamente como `approved`; evidência de uma ferramenta sem decisão editorial não aciona promoção. Nunca reaproveitar a aprovação de outro ID, URL ou data.

Registrar em **manifesto de autorização versionado e imutável por lote** para cada ID: ID exato, URL aprovada exata (incluindo caminho/query), identificador e versão/data da evidência editorial, instituição, formato, URL original/final, data, método, conteúdos observados, exigências de conta, incertezas, revisor e decisão. O build deve comparar os valores de URL/evidência **do registro resolvido** com os aprovados no manifesto, falhando em qualquer divergência (inclusive mudança para outra página do mesmo host). Não basta validar domínio ou reaproveitar uma aprovação para o ID mutável. Não exigir teste de navegador humano para cada fase do site se um método equivalente é suficiente **para o formato e para a alegação feita**, mas nunca ocultar limitações reais.

## 4. Como o release por lotes funcionaria

1. Escolher um **manifesto explícito de entradas aprovadas (ID + URL exata + versão/data da evidência)**, com aprovação editorial do lote; não usar `STAGED_RESOURCES` ou `GATEB_NEW_RESOURCES` inteiros como origem automática de publicação.
2. Resolver cada ID no catálogo/staging tipado, com correspondência unívoca, e **comparar a URL e a versão/data da evidência com o manifesto aprovado**, recusando qualquer alteração mesmo dentro de um host permitido. Sem duplicatas, sem aceitar URL antiga/alternativa implicitamente.
3. Validar integridade de registros, evidências, hosts necessários, links, âncoras internas, filtros da busca, grupos e contagens.
4. Preparar **release candidate isolado** contendo apenas os IDs aprovados, preservando todos os 37 legados.
5. Decidir independentemente, por caminho:
   - **Caminho em preparação:** `noindex`, fora do sitemap e sem recursos expostos.
   - **Caminho ativo:** tem pelo menos um recurso verdadeiramente aprovado, exibido na página correta; a estrutura da página, descrição e navegação são honestas quanto à cobertura real. **Fundamental e Pré-Militar devem obrigatoriamente renderizar pelo menos um recurso na respectiva página objetivo**, não somente numa matéria, prova ou página relacionada. Preservar e testar essa proteção separada do contador geral de recursos exibidos.
   - **Destaques completos:** só mostrar a seção **Dez destaques** quando seus dez IDs exclusivos, comprovados e aprovados estiverem efetivamente publicados; não preencher vagas artificialmente.
6. Rodar testes, segurança, QA visual/mobile, `verify-dist` independente e prova de rollback.
7. Publicar **somente após GO técnico + autorização humana explícita para o lote exato**. `draft`, merge em staging, CI verde e relatório de pesquisa não autorizam deploy.
8. Manter IDs `held` fora do lote sem travar os demais. Retestar os links ao longo do tempo, sem prometer disponibilidade permanente.

## 5. Mudanças de código que precisariam de PR separado

**Não realizar automaticamente por este documento.** A implementação requer review de arquitetura, testes RED/GREEN e nova autorização para alterar o contrato editorial:

- `src/lib/path-status.ts`: retirar **somente** a exigência de dez destaques liberados de `GATED_PATHS`. **Preservar como condição independente** a checagem de pelo menos um recurso aprovado renderizado **na própria página objetivo** de Fundamental e Pré-Militar (não basta em rota de matéria/prova), além da recusa de caminho ativo sem recurso mostrado e de destaques liberados em `preparing`. Preservar o teste adversarial de recurso apenas em outra página de `tests/path-status.test.ts`.
- `src/lib/featured.ts`: manter dez destaques e exclusividade global ao publicar a seção; permitir que caminho ativo exista **sem destaques completos**. Não preencher seleção final com IDs não publicados.
- `src/lib/taxonomy.ts`: atualizar `PATH_STATUS` apenas para caminhos cujo release parcial tenha comprovação de conteúdo renderizado, nunca como ação genérica para todos.
- `src/lib/learning-resources.ts` e `staging*.ts`: usar **manifesto versionado de autorização de ID + URL exata + versão/data de evidência**, validado no build contra o registro realmente resolvido. Uma URL alterada depois da aprovação exige nova homologação e causa falha, mesmo no mesmo domínio. Não promover o staging inteiro nem deixar importação de staging em rotas do build público.
- `src/lib/placement.ts`, páginas de Fundamental e Pré-Militar e `src/lib/search-index.ts`: verificar que cada novo ID tem destino real e `#recurso-<id>` renderizado, evitando tela vazia e copy de preparação na página ativa.
- `scripts/verify-dist.mjs`: atualizar **espelhos independentes** de estados e hosts sob revisão, preservando fail-closed, sitemap/noindex, links, contagens e ordem de seções.
- `tests/`: **preservar integralmente o contrato de release completo** em `tests/release-candidate/context.ts`, `tests/release-candidate/readiness.test.ts` e `tests/release-candidate/STAGING-GUARDS.md`, incluindo 37 legados + 37 candidatos, 60 destaques e seus invariantes. Para lotes menores, **criar contexto e suíte novos, separados**, sem modificar, relaxar ou reaproveitar indevidamente as asserções da V0.4 completa. O release completo continua obrigatório quando a seleção final for promovida.

## 6. Cenários mínimos de regressão (RED antes da mudança)

| Cenário | Esperado |
| --- | --- |
| Promover apenas recursos aprovados de Tecnologia/Ensino Superior | Só esses IDs aparecem; os 37 legados continuam intactos; demais caminhos e destaques permanecem no estado atual |
| Ativar Fundamental com um recurso aprovado **na própria página objetivo** | Caminho passa a ter página ativa informativa com esse item, sitemap e canonical corretos, mas sem seção "Dez destaques" |
| Ativar Pré-Militar com um PDF oficial aprovado **na própria página objetivo** | Mostra o recurso real e deixa explícito que outros processos/anos não foram verificados; não anuncia datas ou editais inventados |
| ESA `held` ou URL inacessível | Nunca entra na allowlist nem é renderizada; outros recursos aprovados continuam elegíveis |
| Caminho ativo sem nenhum recurso renderizado **na própria página** (mesmo que apareça em matéria ou prova) | **Build falha**, mantendo o guard de `GATED_PATHS` separado da contagem geral |
| Destacar menos de dez ou incluir recurso não aprovado | Seção de destaque não é publicada; seleção liberada incompleta **falha** |
| ID ou URL duplicados; host desconhecido | **Build falha** |
| Mesmo ID aprovado, mas URL trocada por outra página do mesmo host ou evidência alterada | **Build falha** até nova aprovação explícita da entrada exata no manifesto |
| Lote parcial de poucos recursos + release completo com todos os destaques | Cada suíte passa em **contexto separado**; nunca substituir/relaxar os 60 destaques e 74 registros do release completo |
| Novo recurso com certificado ou cadastro desconhecido | Interface omite alegação não confirmada; QA distingue fonte e experiência |
| Preparar lote parcialmente e voltar atrás | Build do staging e catálogo legado reproduzidos sem alterações incidentais |
| Publicar lote sem autorização humana explícita | **Operação proibida** |

## 7. Primeiros lotes candidatos, não aprovados

- **Lote A:** cursos públicos com unidades de estudo textuais acessíveis, como Google ML Crash Course, Odin Project, Microsoft Learn e materiais de universidades, após conferência editorial individual.
- **Lote B:** aulas do Fundamental com ano/escolaridade documentados, após validar o acesso a seu conteúdo principal; ativar o caminho apenas se a página ficar útil e honesta.
- **Lote C:** provas oficiais e apostilas do Vestibular/Pré-Militar com documento oficial utilizável e concurso/ano correto. **ESA 2026 permanece `held`** até ter URL institucional navegável ou substituição editorial formal.
- **Lote D:** recursos com vídeo inacessível ao QA, necessidade de login ou outras verificações parciais, após completar as pendências relevantes ao tipo.

Esses lotes são **sugestões de ordem**, não IDs aprovados. Cada execução futura gera arquivo de decisão com IDs, URL, revisão e autorização.

## 8. Critérios para aceitar a política

Antes de implementar: aprovação editorial explícita da mudança de contrato, consentimento de que "dez destaques" é meta separada, e acordo quanto às evidências mínimas por tipo de recurso.

Antes de publicar: CI, UX, verificador independente, URLs verificadas no contexto de suas alegações, proteção de menores, ausência de analytics adicionais, rollback e autorização humana para o **lote exato**.

**Esta proposta não altera `main`, a branch do PR #37, o catálogo público, `FEATURED_RELEASE`, `PATH_STATUS`, domínios permitidos ou deploy.**
