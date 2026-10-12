# Pexis Academy V0.4 — Gate B: manifesto editorial após o Lote 03

**Estado: 0 de 60 publicados. Publicação não autorizada.** `FEATURED_RESOURCE_IDS_BY_PATH` vazio, `FEATURED_RELEASE` todo em `staging`, `PATH_STATUS` inalterado.

Fontes: `2026-10-11-v04-gateb-lote02-direct.csv`, `2026-10-11-v04-gateb-lote02-report.md` e `2026-10-11-v04-gateb-lote03-sources.md` (abertura direta das páginas oficiais por ChatGPT, fora do ambiente do Claude Code, em 11/10/2026; sem índice de busca como prova). Os registros estão em `src/lib/staging.ts`: tipados, validados pelas mesmas regras do catálogo (`resourceProblems`: caminhos, provas, anos escolares, evidência individual, método direto) e fora do catálogo público. `tests/staging.test.ts` e `tests/staging-lote03.test.ts` garantem isso.

## Resumo

As quatro grandezas não são sinônimos:

- **Fonte aberta**: a página oficial foi aberta diretamente (não por índice de busca).
- **Evidência completa**: o registro passa por todas as regras de um registro do catálogo (`resourceProblems`, P1–P4), com evidência individual. Está em `STAGED_RESOURCES` ou `REVERIFIED_LEGACY`.
- **Homologado**: há decisão editorial e registro de homologação. Ainda não existe nenhum.
- **Publicado**: está no catálogo e é exibido como destaque. Nenhum item do Gate B está publicado.

| Caminho | Fonte aberta | Evidência completa (rascunho) | Só parcial (anexos pendentes) | Homologado | Publicado (Gate B) | Para 10 |
|---|---|---|---|---|---|---|
| Ensino Fundamental | 10 | **10** | 0 | 0 | 0 | rascunho completo; aguarda homologação |
| Ensino Médio | 0 | 0 | 0 | 0 | 0 | alcançável com publicados (decisão editorial) |
| Vestibular | 4 | 4 | 0 | 0 | 0 | alcançável com publicados (decisão editorial) |
| Pré-Militar | 4 | 1 | 3 | 0 | 0 | **bloqueado: faltam 9 com evidência completa** |
| Ensino Superior | 6 | 6 | 0 | 0 | 0 | alcançável com publicados (decisão editorial) |
| Tecnologia | 5 | 5 | 0 | 0 | 0 | alcançável com publicados (decisão editorial) |
| **Total** | **29** | **26** | **3** | **0** | **0** | |

Pools de publicados com verificação legada de 2026-10-11:

| Caminho | Pool |
|---|---|
| Fundamental | 0 |
| Médio | 11 |
| Vestibular | 19 |
| Pré-Militar | 0 |
| Superior | 5 |
| Tecnologia | 15 |

Os pools se sobrepõem: há Kultivi em Médio e Vestibular, e MIT em Superior e Tecnologia. Cada ID entra numa única seleção. Mesmo assim, Médio, Vestibular, Superior e Tecnologia chegam a 10 sem repetir: o Vestibular com o INEP e as coleções da UERJ, a Tecnologia sem os cursos do MIT.

**Pré-Militar é o único caminho sem rota para 10.** Não tem pool publicado, e os três acervos do Lote 03 continuam parciais.

## Lote 03: oito aulas do Fundamental (evidência completa)

As oito aulas são recursos diferentes dos dois registros da SME do Lote 02, e não há duplicação de ID nem de URL.

Elas substituem, como alternativas documentadas, os oito candidatos pendentes do Fundamental do Lote 02. Esses candidatos ficam pendentes e não serão usados.

Para as oito:

- `registration` e `certificate` ficam `unconfirmed`, porque a fonte não os declara. Esse valor nunca é exibido. A evidência marca só `free`, `scope`, `language`, `format`, `path` e `grade`.
- Downloads, materiais vinculados e testes com login **não foram abertos**, e a nota de cada registro diz isso.
- Os dois materiais de Ciências da Natureza têm `subject: null`: não existe SubjectId para essa matéria, e nunca se usa `tecnologia`.

| ID | Título observado | Formato | Ano | Matéria | Fonte |
|---|---|---|---|---|---|
| `ef-sme-alfabeto-1` | Língua Portuguesa – Nosso Alfabeto | `lesson` | 1 | portugues | [SME Goiânia](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/lingua-portuguesa-nosso-alfabeto/) |
| `ef-sme-vegetacao-3` | Ciências da Natureza – Vegetação e a Preservação do Solo | `lesson` | 3 | — | [SME Goiânia](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/ciencias-da-natureza-vegetacao-e-a-preservacao-do-solo/) |
| `ef-sme-municipio-4` | Geografia – Município, Estado e País | `lesson` | 4 | geografia | [SME Goiânia](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/geografia-municipio-estado-e-pais/) |
| `ef-sme-vestigios-5` | História – Vestígios do Passado | `lesson` | 5 | historia | [SME Goiânia](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/historia-vestigios-do-passado/) |
| `ef-obmep-fracoes-6` | Frações, o Primeiro Contato | `lessons` | 6 | matematica | [Portal da OBMEP](https://portaldaobmep.impa.br/index.php/modulo/ver?modulo=28) |
| `ef-sme-tecnologia-vida-7` | Ciências da Natureza – Tecnologia e Vida Humana | `lesson` | 7 | — | [SME Goiânia](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/ciencias-da-natureza-tecnologia-e-vida-humana/) |
| `ef-obmep-potenciacao-8` | Potenciação | `lessons` | 8 | matematica | [Portal da OBMEP](https://portaldaobmep.impa.br/index.php/modulo/ver?modulo=1059) |
| `ef-sme-funcoes-9` | Matemática – Função de 1º e de 2º grau | `lesson` | 9 | matematica | [SME Goiânia](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/matematica-funcao-de-1o-e-de-2o-grau/) |

Destino: a seção geral do caminho Fundamental, agrupada por etapa, quando o caminho estiver ativo. Com os dois registros do Lote 02, o rascunho cobre do 1º ao 9º ano, e o 5º ano aparece duas vezes.

## Lote 03: três acervos militares (verificação parcial, não homologados)

Os três estão em `PARTIAL_VERIFICATIONS` com o estado `page-confirmed-attachments-pending`. A página oficial foi aberta, mas os anexos das provas não foram. Por isso:

- não são registros de staging;
- não entram no rascunho da seleção;
- não contam como evidência completa.

| ID | Recurso | Visto | Falta |
|---|---|---|---|
| `pm-cn-provas` | [Colégio Naval – Provas e Gabaritos](https://www.marinha.mil.br/sspm/colegionaval/colegio_princ) | provas de 2021 a 2026 e gabaritos listados | abrir os anexos |
| `pm-en-provas` | [Escola Naval – Provas e Gabaritos](https://www.marinha.mil.br/sspm/node/95) | anexos de 2020 a 2026 listados | abrir os anexos |
| `pm-eear-provas` | [EEAR – Provas Anteriores](https://ingresso.eear.fab.mil.br/SOO/home/provas_anteriores.php?sigla_conc=%25) | itens de concursos CFS e gabaritos | confirmar os PDFs das provas, não só os gabaritos |

O ITA foi reconferido no Lote 03, com provas de 2008 a 2026, e reutiliza `ita-provas-anteriores`. A diferença entre `www.vestibular.ita.br` e `vestibular.ita.br` não gera um segundo registro.

Continuam sem leitura direta completa:

- **IME**: a página respondeu 502.
- **AFA e EPCAR**: a página respondeu 403.
- **ESA e EsPCEx**: nenhum acervo oficial foi aberto.
- **Khan Academy**: as páginas vieram vazias.

## Lote 02: 18 verificações diretas

| Caminho | ID | Título oficial observado | Formato | Cadastro | Certificado | Ano | Fonte | Destino |
|---|---|---|---|---|---|---|---|---|
| Ensino Fundamental | `sme-goiania-letras-e-palavras` | Língua Portuguesa – Letras e palavras | `lesson` | not-required | none | 2 | [fonte](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/lingua-portuguesa-letras-e-palavras/) | seção geral do caminho, quando ativo |
| Ensino Fundamental | `sme-goiania-leitura-em-foco` | Língua Portuguesa: Leitura em Foco | `lesson` | not-required | none | 5 | [fonte](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/lingua-portuguesa-leitura-em-foco/) | seção geral do caminho, quando ativo |
| Vestibular | `kultivi-enem-completo` | ENEM Completo | `course` | required | available | — | [fonte](https://kultivi.com/curso/enem-completo) | seção geral do caminho, quando ativo |
| Vestibular | `kultivi-writing-enem` ♻︎ | Redação para o Enem | `course` | required | available | — | [fonte](https://kultivi.com/curso/redacao-para-enem) | já publicado (ID reutilizado; registro inalterado) |
| Vestibular | `inep-enem-provas-gabaritos` | Provas e Gabaritos do Enem | `past-exam` | not-required | none | — | [fonte](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos) | seção geral do caminho, quando ativo |
| Vestibular | `fuvest-acervo-2026` | Acervo – Vestibular USP 2026 | `past-exam` | not-required | none | — | [fonte](https://www.fuvest.br/acervo-vestibular-2026/) | seção geral do caminho, quando ativo |
| Pré-Militar | `ita-provas-anteriores` | Provas de Vestibulares Anteriores - ITA | `past-exam` | not-required | none | — | [fonte](https://vestibular.ita.br/provas.htm) | seção geral do caminho, quando ativo |
| Ensino Superior | `mit-1801sc` | Single Variable Calculus | `course` | not-required | none | — | [fonte](https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/) | Ensino Superior: incluir no grupo Matemática (HIGHER_EDUCATION_GROUPS) e declarar o caminho. |
| Ensino Superior | `mit-801sc` | Classical Mechanics | `course` | not-required | none | — | [fonte](https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/) | Ensino Superior: criar o grupo Física. |
| Ensino Superior | `mit-7012` | Introduction to Biology | `course` | not-required | none | — | [fonte](https://ocw.mit.edu/courses/7-012-introduction-to-biology-fall-2004/) | Ensino Superior: criar o grupo Biologia. |
| Ensino Superior | `yale-psyc-110` | Introduction to Psychology | `course` | not-required | none | — | [fonte](https://oyc.yale.edu/introduction-psychology/psyc-110) | Ensino Superior: criar o grupo Psicologia. |
| Ensino Superior | `yale-econ-252` | Financial Markets (2011) | `course` | not-required | none | — | [fonte](https://oyc.yale.edu/economics/econ-252) | Ensino Superior: criar o grupo Economia. |
| Ensino Superior | `ou-environment-treading-lightly` | Environment: treading lightly on the Earth | `course` | not-required | statement | — | [fonte](https://www.open.edu/openlearn/nature-environment/environmental-studies/environment-treading-lightly-on-the-earth/content-section-0) | Ensino Superior: criar o grupo Meio ambiente. |
| Tecnologia | `cs50x` ♻︎ | CS50’s Introduction to Computer Science | `course` | not-required | unconfirmed | — | [fonte](https://cs50.harvard.edu/x/) | já publicado (ID reutilizado; registro inalterado) |
| Tecnologia | `cs50p` ♻︎ | CS50’s Introduction to Programming with Python | `course` | not-required | unconfirmed | — | [fonte](https://cs50.harvard.edu/python/) | já publicado (ID reutilizado; registro inalterado) |
| Tecnologia | `odin-foundations` | Foundations Course | `track` | not-required | unconfirmed | — | [fonte](https://www.theodinproject.com/paths/foundations/courses/foundations) | Tecnologia: incluir na trilha Desenvolvimento Web. |
| Tecnologia | `google-mlcc` | Machine Learning Crash Course | `course` | not-required | unconfirmed | — | [fonte](https://developers.google.com/machine-learning/crash-course/) | Tecnologia: incluir na trilha Inteligência Artificial. |
| Tecnologia | `ms-learn-cloud-concepts` | Introdução à infraestrutura de nuvem: descrever conceitos de nuvem | `track` | not-required | unconfirmed | — | [fonte](https://learn.microsoft.com/pt-br/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/) | Tecnologia: nenhuma trilha publicada cobre nuvem; decidir a trilha (ou criar uma) antes de publicar. |

♻︎ = ID já publicado, reverificado no Lote 02; não há duplicação. `unconfirmed` = a fonte não confirma; registrado e nunca exibido como fato.

## Lote 02: 42 pendentes (motivos preservados)

Os oito do Fundamental foram substituídos pelas aulas do Lote 03. Colégio Naval, Escola Naval e EEAR estão em verificação parcial.

| Caminho | # | Candidato | Estado da abertura direta | O que falta |
|---|---|---|---|---|
| Ensino Fundamental | 3 | Matemática: 1º ano | `PAGINA_SEM_TEXTO_AUDITAVEL` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Ensino Fundamental | 4 | Matemática: 5º ano | `PAGINA_SEM_TEXTO_AUDITAVEL` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Ensino Fundamental | 5 | Matemática: 9º ano | `PAGINA_SEM_TEXTO_AUDITAVEL` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Ensino Fundamental | 6 | Ciências: 1º ano | `PAGINA_SEM_TEXTO_AUDITAVEL` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Ensino Fundamental | 7 | Ciências: 7º ano | `PAGINA_SEM_TEXTO_AUDITAVEL` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Ensino Fundamental | 8 | Pré-história do Brasil | `SEM_LINK_DIRETO` | Localizar recurso especifico e abrir a fonte oficial |
| Ensino Fundamental | 9 | Atlas Geográfico Escolar | `ACESSO_FALHOU` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Ensino Fundamental | 10 | Portal de Matemática | `FONTE_ABERTA_REQUER_AJUSTE` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Ensino Médio | 1 | Álgebra 1 | `PAGINA_SEM_TEXTO_AUDITAVEL` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Ensino Médio | 2 | Geometria e Trigonometria | `PAGINA_SEM_TEXTO_AUDITAVEL` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Ensino Médio | 3 | Física do Ensino Médio | `PAGINA_SEM_TEXTO_AUDITAVEL` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Ensino Médio | 4 | Química do Ensino Médio | `PAGINA_SEM_TEXTO_AUDITAVEL` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Ensino Médio | 5 | Biologia do Ensino Médio | `PAGINA_SEM_TEXTO_AUDITAVEL` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Ensino Médio | 6 | Português: preparação para o Ensino Médio | `SEM_LINK_DIRETO` | Localizar recurso especifico e abrir a fonte oficial |
| Ensino Médio | 7 | História do Brasil: Independência | `ACESSO_FALHOU` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Ensino Médio | 8 | Geografia: mapas do Brasil e do mundo | `ACESSO_FALHOU` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Ensino Médio | 9 | Inglês pelo MEC Idiomas | `ACESSO_FALHOU` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Ensino Médio | 10 | Espanhol pelo MEC Idiomas | `ACESSO_FALHOU` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Vestibular | 3 | MEC Enem | `PAGINA_SEM_TEXTO_AUDITAVEL` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Vestibular | 4 | Pré-Vestibular Social | `FONTE_ABERTA_REQUER_ATUALIZACAO` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Vestibular | 7 | Simulado da Unicamp | `FONTE_ABERTA_REQUER_TESTE` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Vestibular | 8 | Provas da Unesp 2026 | `LINK_INADEQUADO` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Vestibular | 9 | Questões comentadas da UERJ | `ACESSO_FALHOU` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Vestibular | 10 | O IBGE no ENEM | `ACESSO_FALHOU` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Pré-Militar | 1 | Preparatório gratuito ESA (conteúdo parcial) | `ACESSO_FALHOU` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Pré-Militar | 2 | Provas anteriores da ESA | `ACESSO_FALHOU` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Pré-Militar | 3 | Provas anteriores da EsPCEx | `ACESSO_FALHOU` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Pré-Militar | 4 | Provas anteriores da EPCAR | `ACESSO_FALHOU` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Pré-Militar | 5 | Provas anteriores da AFA | `ACESSO_FALHOU` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Pré-Militar | 6 | Provas anteriores da EEAR | `FONTE_ABERTA_REQUER_ESCOPO` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Pré-Militar | 7 | Provas anteriores do Colégio Naval | `FONTE_ABERTA_ANEXO_NAO_VALIDADO` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Pré-Militar | 8 | Provas anteriores da Escola Naval | `FONTE_ABERTA_ANEXO_NAO_VALIDADO` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Pré-Militar | 9 | Provas anteriores do IME | `ACESSO_FALHOU` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Ensino Superior | 1 | e-Aulas USP | `ACESSO_FALHOU` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Ensino Superior | 2 | Cálculo I | `SEM_LINK_DIRETO` | Localizar recurso especifico e abrir a fonte oficial |
| Ensino Superior | 8 | Fundamentos da Gestão por Processos | `SEM_LINK_DIRETO` | Localizar recurso especifico e abrir a fonte oficial |
| Ensino Superior | 9 | Introdução às Relações de Consumo e aos Direitos Básicos | `LINK_INADEQUADO` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Tecnologia | 3 | Responsive Web Design | `PAGINA_SEM_TEXTO_AUDITAVEL` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Tecnologia | 4 | JavaScript | `PAGINA_SEM_TEXTO_AUDITAVEL` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Tecnologia | 6 | Introduction to Cybersecurity | `FONTE_ABERTA_REQUER_ESCOPO` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Tecnologia | 7 | Python | `PAGINA_SEM_TEXTO_AUDITAVEL` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |
| Tecnologia | 10 | Introdução ao SQL | `PAGINA_SEM_TEXTO_AUDITAVEL` | Necessario acesso externo capaz de inspecionar o conteudo completo e registrar condicoes de acesso |

## Ensino Médio: os cursos Kultivi já publicados

Os 12 cursos "… para ENEM" da Kultivi estão publicados desde a V0.3 com `paths: ['ensino-medio', 'vestibulares']` e `exams: ['enem']`. A classificação é coerente: são matérias do Ensino Médio, com recorte de ENEM declarado no título. Tecnicamente (`featuredProblems`), 11 deles podem compor a seleção do Médio; `kultivi-writing-enem` fica no Vestibular, pois um ID entra numa só seleção.

**Recomendação.** Usá-los como **parte** da seleção do Médio, não como os dez:
1. A verificação deles é a coletiva de 11/10/2026 (legado), não individual. Antes de liberar, reabrir cada página (mesmo procedimento aplicado a `kultivi-writing-enem` neste lote) e registrar a evidência.
2. Dez destaques de um único provedor, todos com recorte de ENEM, enfraquecem a curadoria do Médio. Combinar com fontes de outros provedores quando Khan Academy, MEC Idiomas e IBGE forem conferidos.
3. Um curso Kultivi destacado no Médio sai do pool do Vestibular, que segue alcançável com INEP e as coleções da UERJ.

## Próximos passos para promover um registro

1. **Pré-Militar (faltam 9 com evidência completa).** Abrir os anexos do Colégio Naval e da Escola Naval e os PDFs de provas da EEAR; depois, IME, AFA/EPCAR e ESA/EsPCEx.
   **Fundamental:** se a equipe exigir que os downloads sejam abertos, conferir os materiais vinculados das oito aulas.
2. **Promoção (por lote, com autorização única):** mover o registro de `staging.ts` para `catalogue`, aplicar o `PLACEMENT_PLAN`, acrescentar os novos hosts à lista `COURSE_HOSTS` do `verify-dist` (`sme.goiania.go.gov.br`, `portaldaobmep.impa.br`, `www.fuvest.br`, `vestibular.ita.br`, `oyc.yale.edu`, `www.open.edu`, `www.theodinproject.com`, `developers.google.com`, `learn.microsoft.com`). O build valida P1–P4.
3. **Liberação:** só com 10 por caminho; Fundamental e Pré-Militar exigem também `PATH_STATUS` ativo no mesmo commit.

## Decisões de modelo registradas

- `level` não é exibido no site e a evidência não o cobre; o tipo não tem valor para o Fundamental (registros usam `beginner` provisoriamente).
- `ms-learn-cloud-concepts`: nenhuma trilha publicada cobre nuvem; decidir a trilha antes de publicar.
- Ensino Superior: Física, Biologia, Psicologia, Economia e Meio ambiente exigem novos grupos em `HIGHER_EDUCATION_GROUPS`.
