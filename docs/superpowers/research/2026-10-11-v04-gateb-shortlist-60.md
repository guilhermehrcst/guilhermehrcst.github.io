# Pexis Academy V0.4 | Gate B: shortlist operacional de 60 recursos

**Data da triagem:** 11/10/2026 (fuso Brasil). **Estado:** rascunho editorial, sem homologação final e sem autorização de publicação. **Base:** merge técnico #33, `466291de9774e88ca51d82098c5edbcdedd77da1`.

## Objetivo e regras

- Planejar **60 destaques distintos**, exatamente **10 por caminho**, sem repetir IDs entre caminhos. Estes invariantes foram conferidos na preparação deste documento.
- O catálogo de produção continua com **37 recursos**; `FEATURED_RELEASE` permanece em `staging`; `FEATURED_RESOURCE_IDS_BY_PATH` continua vazio; Fundamental e Pré-Militar continuam `preparing`.
- Este documento **não promove registros**, **não atesta livre acesso aos anexos não abertos** e **não autoriza merge/deploy**. Não confundir um slot preenchido com recurso homologado.
- Fontes: `src/lib/learning-resources.ts`, `src/lib/staging.ts`, `docs/superpowers/research/2026-10-11-v04-gateb-manifest.md` e consulta direta às páginas oficiais em 11/10/2026. Datas e métodos de evidência individuais anteriores foram preservados, não substituídos por uma data fictícia.

## Legenda das situações

- `STAGED`: fonte e escopo registrados nos lotes 02/03, em `STAGED_RESOURCES`; requer decisão editorial e promoção técnica antes de aparecer no site.
- `REVERIFIED_LEGACY`: ID já publicado, com evidência direta reaproveitada dos lotes.
- `LEGACY_DIRECT_PAGE`: ID já publicado; a página oficial foi reaberta nesta rodada para confirmar o destino e a natureza pública do conteúdo; **não significa matrícula ou anexos privados testados**.
- `LEGACY_RECHECK_BLOCKED`: ID publicado, mas a tentativa de reabrir a página de questões da UERJ falhou nesta rodada. Não atribuir nova data de verificação.
- `PARTIAL_ATTACHMENT`: índice institucional das provas confirmado, porém o anexo de prova não pôde ser inspecionado. Não promover.
- `INDEX_ONLY_BLOCKED`: referência ao arquivo encontrada em página indexada, mas a abertura direta deu 403. Não promover.
- `MISSING_DIRECT_SOURCE` e `OFFICIAL_SITE_502`: ausência de fonte oficial verificável para o recurso específico. Não promover.
- `LEGACY_PAGE_INCOMPLETE`: a URL retornou página com conteúdo insuficiente para nova auditoria; manter condição legada, sem afirmar revalidação.

## Seleção preliminar de 60 posições

| Caminho | # | Recurso/ID | Situação | URL institucional |
|---|---:|---|---|---|
| Ensino Fundamental | 1 | `ef-sme-alfabeto-1` | `STAGED` | [Fonte](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/lingua-portuguesa-nosso-alfabeto/) |
| Ensino Fundamental | 2 | `sme-goiania-letras-e-palavras` | `STAGED` | [Fonte](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/lingua-portuguesa-letras-e-palavras/) |
| Ensino Fundamental | 3 | `ef-sme-vegetacao-3` | `STAGED` | [Fonte](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/ciencias-da-natureza-vegetacao-e-a-preservacao-do-solo/) |
| Ensino Fundamental | 4 | `ef-sme-municipio-4` | `STAGED` | [Fonte](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/geografia-municipio-estado-e-pais/) |
| Ensino Fundamental | 5 | `ef-sme-vestigios-5` | `STAGED` | [Fonte](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/historia-vestigios-do-passado/) |
| Ensino Fundamental | 6 | `sme-goiania-leitura-em-foco` | `STAGED` | [Fonte](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/lingua-portuguesa-leitura-em-foco/) |
| Ensino Fundamental | 7 | `ef-obmep-fracoes-6` | `STAGED` | [Fonte](https://portaldaobmep.impa.br/index.php/modulo/ver?modulo=28) |
| Ensino Fundamental | 8 | `ef-sme-tecnologia-vida-7` | `STAGED` | [Fonte](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/ciencias-da-natureza-tecnologia-e-vida-humana/) |
| Ensino Fundamental | 9 | `ef-obmep-potenciacao-8` | `STAGED` | [Fonte](https://portaldaobmep.impa.br/index.php/modulo/ver?modulo=1059) |
| Ensino Fundamental | 10 | `ef-sme-funcoes-9` | `STAGED` | [Fonte](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/matematica-funcao-de-1o-e-de-2o-grau/) |
| Ensino Médio | 1 | `kultivi-math-enem` | `LEGACY_DIRECT_PAGE` | [Fonte](https://kultivi.com/curso/matematica) |
| Ensino Médio | 2 | `kultivi-portuguese-enem` | `LEGACY_DIRECT_PAGE` | [Fonte](https://kultivi.com/curso/portugues) |
| Ensino Médio | 3 | `kultivi-physics-enem` | `LEGACY_DIRECT_PAGE` | [Fonte](https://kultivi.com/curso/fisica) |
| Ensino Médio | 4 | `kultivi-chemistry-enem` | `LEGACY_DIRECT_PAGE` | [Fonte](https://kultivi.com/curso/quimica) |
| Ensino Médio | 5 | `kultivi-biology-enem` | `LEGACY_DIRECT_PAGE` | [Fonte](https://kultivi.com/curso/biologia) |
| Ensino Médio | 6 | `kultivi-history-enem` | `LEGACY_DIRECT_PAGE` | [Fonte](https://kultivi.com/curso/historia-2) |
| Ensino Médio | 7 | `kultivi-geography-enem` | `LEGACY_DIRECT_PAGE` | [Fonte](https://kultivi.com/curso/geografia) |
| Ensino Médio | 8 | `kultivi-philosophy-enem` | `LEGACY_DIRECT_PAGE` | [Fonte](https://kultivi.com/curso/filosofia) |
| Ensino Médio | 9 | `kultivi-sociology-enem` | `LEGACY_DIRECT_PAGE` | [Fonte](https://kultivi.com/curso/sociologia) |
| Ensino Médio | 10 | `kultivi-english-enem` | `LEGACY_DIRECT_PAGE` | [Fonte](https://kultivi.com/curso/ingles-para-enem) |
| Vestibular | 1 | `kultivi-enem-completo` | `STAGED` | [Fonte](https://kultivi.com/curso/enem-completo) |
| Vestibular | 2 | `kultivi-writing-enem` | `REVERIFIED_LEGACY` | [Fonte](https://kultivi.com/curso/redacao-para-enem) |
| Vestibular | 3 | `inep-enem-provas-gabaritos` | `STAGED` | [Fonte](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos) |
| Vestibular | 4 | `fuvest-acervo-2026` | `STAGED` | [Fonte](https://www.fuvest.br/acervo-vestibular-2026/) |
| Vestibular | 5 | `inep-writing-2026` | `LEGACY_DIRECT_PAGE` | [Fonte](https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/a-redacao-do-enem-2026-cartilha-do-a-participante) |
| Vestibular | 6 | `uerj-portuguese-practice` | `LEGACY_RECHECK_BLOCKED` | [Fonte](https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=1) |
| Vestibular | 7 | `uerj-math-practice` | `LEGACY_RECHECK_BLOCKED` | [Fonte](https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=9) |
| Vestibular | 8 | `uerj-history-practice` | `LEGACY_RECHECK_BLOCKED` | [Fonte](https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=5) |
| Vestibular | 9 | `uerj-geography-practice` | `LEGACY_RECHECK_BLOCKED` | [Fonte](https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=6) |
| Vestibular | 10 | `uerj-physics-practice` | `LEGACY_RECHECK_BLOCKED` | [Fonte](https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aano=&anivel=dificil&aseq_area=&aseq_disciplina=8&aseq_etapa=&sb=Buscar) |
| Pré-Militar | 1 | `ita-provas-anteriores` | `STAGED` | [Fonte](https://vestibular.ita.br/provas.htm) |
| Pré-Militar | 2 | `pm-cn-provas` | `PARTIAL_ATTACHMENT` | [Fonte](https://www.marinha.mil.br/sspm/colegionaval/colegio_princ) |
| Pré-Militar | 3 | `pm-en-provas` | `PARTIAL_ATTACHMENT` | [Fonte](https://www.marinha.mil.br/sspm/node/95) |
| Pré-Militar | 4 | `pm-eear-provas` | `PARTIAL_ATTACHMENT` | [Fonte](https://ingresso.eear.fab.mil.br/SOO/home/provas_anteriores.php?sigla_conc=%25) |
| Pré-Militar | 5 | `pm-eam-provas` | `PARTIAL_ATTACHMENT` | [Fonte](https://www.marinha.mil.br/sspm/escola-aprendizes/a-eam-provag) |
| Pré-Militar | 6 | `pm-afa-provas` | `INDEX_ONLY_BLOCKED` | [Fonte](https://www.fab.mil.br/ingresso/anteriores.html) |
| Pré-Militar | 7 | `pm-epcar-provas` | `INDEX_ONLY_BLOCKED` | [Fonte](https://www.fab.mil.br/ingresso/anteriores.html) |
| Pré-Militar | 8 | `pm-esa-provas` | `MISSING_DIRECT_SOURCE` | **Não localizada** |
| Pré-Militar | 9 | `pm-espcex-provas` | `MISSING_DIRECT_SOURCE` | **Não localizada** |
| Pré-Militar | 10 | `pm-ime-provas` | `OFFICIAL_SITE_502` | [Fonte](https://www.ime.eb.mil.br/index.php) |
| Ensino Superior | 1 | `mit-1801sc` | `STAGED` | [Fonte](https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/) |
| Ensino Superior | 2 | `mit-801sc` | `STAGED` | [Fonte](https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/) |
| Ensino Superior | 3 | `mit-7012` | `STAGED` | [Fonte](https://ocw.mit.edu/courses/7-012-introduction-to-biology-fall-2004/) |
| Ensino Superior | 4 | `yale-psyc-110` | `STAGED` | [Fonte](https://oyc.yale.edu/introduction-psychology/psyc-110) |
| Ensino Superior | 5 | `yale-econ-252` | `STAGED` | [Fonte](https://oyc.yale.edu/economics/econ-252) |
| Ensino Superior | 6 | `ou-environment-treading-lightly` | `STAGED` | [Fonte](https://www.open.edu/openlearn/nature-environment/environmental-studies/environment-treading-lightly-on-the-earth/content-section-0) |
| Ensino Superior | 7 | `mit-6100l` | `LEGACY_DIRECT_PAGE` | [Fonte](https://ocw.mit.edu/courses/6-100l-introduction-to-cs-and-programming-using-python-fall-2022/) |
| Ensino Superior | 8 | `mit-60002` | `LEGACY_DIRECT_PAGE` | [Fonte](https://ocw.mit.edu/courses/6-0002-introduction-to-computational-thinking-and-data-science-fall-2016/) |
| Ensino Superior | 9 | `mit-6006` | `LEGACY_DIRECT_PAGE` | [Fonte](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/) |
| Ensino Superior | 10 | `mit-6042j` | `LEGACY_DIRECT_PAGE` | [Fonte](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/) |
| Tecnologia | 1 | `cs50x` | `REVERIFIED_LEGACY` | [Fonte](https://cs50.harvard.edu/x/) |
| Tecnologia | 2 | `cs50p` | `REVERIFIED_LEGACY` | [Fonte](https://cs50.harvard.edu/python/) |
| Tecnologia | 3 | `odin-foundations` | `STAGED` | [Fonte](https://www.theodinproject.com/paths/foundations/courses/foundations) |
| Tecnologia | 4 | `google-mlcc` | `STAGED` | [Fonte](https://developers.google.com/machine-learning/crash-course/) |
| Tecnologia | 5 | `ms-learn-cloud-concepts` | `STAGED` | [Fonte](https://learn.microsoft.com/pt-br/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/) |
| Tecnologia | 6 | `fb-python` | `LEGACY_DIRECT_PAGE` | [Fonte](https://www.ev.org.br/cursos/linguagem-de-programacao-python-basico) |
| Tecnologia | 7 | `fb-web` | `LEGACY_DIRECT_PAGE` | [Fonte](https://www.ev.org.br/cursos/crie-um-site-simples-usando-html-css-e-javascript) |
| Tecnologia | 8 | `cs50w` | `LEGACY_DIRECT_PAGE` | [Fonte](https://cs50.harvard.edu/web/) |
| Tecnologia | 9 | `cs50ai` | `LEGACY_DIRECT_PAGE` | [Fonte](https://cs50.harvard.edu/ai/) |
| Tecnologia | 10 | `cisco-cyber` | `LEGACY_PAGE_INCOMPLETE` | [Fonte](https://www.netacad.com/courses/introduction-to-cybersecurity) |

## Estado por caminho e decisões editoriais

1. **Fundamental (10/10 candidatos com evidência em staging):** a seleção cobre do 1º ao 9º ano; alguns slides, arquivos complementares e atividades autenticadas continuam não inspecionados. Não alterar o status do caminho antes da decisão editorial sobre escopo gratuito suficiente.
2. **Médio (10/10 IDs legados):** todos os dez são cursos da Kultivi voltados ao ENEM. As páginas oficiais foram abertas diretamente nesta rodada. Essa concentração editorial é provisória; pode-se substituí-los por fontes equivalentes confiáveis antes da liberação, sem reduzir a diversidade de matérias.
3. **Vestibular (10/10 slots):** o acervo INEP e a Fuvest estão em staging, a cartilha do INEP está no catálogo legado; cinco páginas da UERJ não puderam ser reabertas. Preservar os IDs legados, sem inventar reverificação.
4. **Pré-Militar (1 direto, 4 índices com anexos pendentes, 5 sem comprovação direta completa):** **bloqueador principal**. ITA está em staging; Colégio Naval, Escola Naval, EEAR e Escolas de Aprendizes-Marinheiros têm índices oficiais inspecionados, mas arquivos não abertos. Para AFA e EPCAR, `https://www.fab.mil.br/ingresso/anteriores.html` apareceu no resultado oficial com exames de 2021 a 2026, mas respondeu 403 na abertura. ESA/EsPCEx não tiveram páginas de acervo abertas. Site do IME respondeu 502. **Nenhum desses nove slots está homologado.**
5. **Superior (10/10 slots):** seis cursos com evidência em staging e quatro cursos legados do MIT OCW reabertos. Antes da promoção, acrescentar grupos correspondentes em `HIGHER_EDUCATION_GROUPS` e verificar os destinos do `placementOf`.
6. **Tecnologia (10/10 slots):** cinco registros do estágio, quatro cursos legados com páginas abertas nesta rodada e Cisco com retorno insuficiente. Antes da promoção, integrar as trilhas de web/IA/nuvem sem classificar nuvem como segurança sem justificativa.

## Próximos passos executáveis, sem pausas por microaprovação

- **Edição A:** conferir anexos dos acervos militares e buscar alternativas oficiais quando não abrirem. A fonte documental deve ser do editor responsável pelo exame, não material pago nem resumo de busca. Não contar duas edições de uma mesma coleção como dois recursos.
- **Edição B:** reverificar os cinco links da UERJ e o Cisco em navegador com acesso completo, ou substituir por recursos equivalentes diretamente auditados.
- **Edição C:** registrar um veredito editorial individual (`HOMOLOGATED`/`BLOCKED` e evidência com data, URL, método, nota, cadastro, certificado) antes de mover qualquer item para o catálogo.
- **Integração:** somente após 60 decisões válidas, promover registros, configurar páginas/trilhas, selecionar 10 por caminho, ativar Fundamental e Pré-Militar no mesmo commit e executar testes/CI e revisão externa **antes** de merge/deploy.
- **Limites:** não relaxar os validadores P1–P4, não presumir que resultados de busca são prova, não publicar conteúdo parcial e não criar segundo recurso para a mesma URL/coleção.

## Resultado da triagem

- **Slots planejados:** 60/60, **IDs distintos:** 60/60, **10 por caminho:** sim.
- **Situações:** `STAGED`: 23; `LEGACY_DIRECT_PAGE`: 19; `REVERIFIED_LEGACY`: 3; `LEGACY_RECHECK_BLOCKED`: 5; `PARTIAL_ATTACHMENT`: 4; `INDEX_ONLY_BLOCKED`: 2; `MISSING_DIRECT_SOURCE`: 2; `OFFICIAL_SITE_502`: 1; `LEGACY_PAGE_INCOMPLETE`: 1.
- **Homologações finais novas neste documento:** 0. **Mudanças ao site publicado:** 0.
