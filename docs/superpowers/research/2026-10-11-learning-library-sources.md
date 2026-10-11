# Learning Library V0.1 — Source Audit

Date: 2026-10-11

This note records the evidence used to publish the initial Ensino Médio / vestibular resource seed. It is deliberately stricter than a normal link list: a published resource must have a direct HTTPS URL and the represented learning content must be fully free.

## Admission rules

- No trials, teaser-only resources, affiliate redirects, or courses whose essential lessons require payment.
- Registration may be required.
- A paid optional certificate does not disqualify a resource when the learning content itself is fully free.
- Exam practice is preferably first-party.
- Goal tags such as `vestibular` are editorial relevance metadata. They do not claim that the provider officially prepares every vestibular.

## Kultivi academic seed

Provider: Kultivi  
Verification method: official provider page  
Verified: 2026-10-11  
Access: provider course pages identify the courses as free/online; registration is free. Kultivi's support material states that its courses, certificates and supporting materials are free.

| Resource | Direct source |
| --- | --- |
| Matemática para ENEM | https://kultivi.com/curso/matematica |
| Português para ENEM | https://kultivi.com/curso/portugues |
| Redação para ENEM | https://kultivi.com/curso/redacao-para-enem |
| Física para ENEM | https://kultivi.com/curso/fisica |
| Química para ENEM | https://kultivi.com/curso/quimica |
| Biologia para ENEM | https://kultivi.com/curso/biologia |
| História para ENEM | https://kultivi.com/curso/historia-2 |
| Geografia para ENEM | https://kultivi.com/curso/geografia |
| Filosofia para ENEM | https://kultivi.com/curso/filosofia |
| Sociologia para ENEM | https://kultivi.com/curso/sociologia |
| Inglês para ENEM | https://kultivi.com/curso/ingles-para-enem |
| Espanhol para ENEM | https://kultivi.com/curso/espanhol-para-enem |

## ENEM official practice / guidance

Provider: INEP  
Verification method: official government page  
Verified: 2026-10-11

- Participant writing guide 2026: https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/a-redacao-do-enem-2026-cartilha-do-a-participante
- Official past tests and answer keys: https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos
- ENEM reference matrices: https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem

The writing guide is published as a `practice` resource in V0.1. The other two official INEP pages are retained as editorial evidence for the ENEM study track.

## UERJ official practice

Provider: Revista do Vestibular UERJ / Vestibular UERJ  
Verification method: official UERJ pages  
Verified: 2026-10-11

The Revista do Vestibular maintains commented questions from current and previous editions and describes them as study references. V0.1 publishes direct subject collections:

| Subject | Direct source |
| --- | --- |
| Língua Portuguesa e Literatura | https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=1 |
| Língua Portuguesa Instrumental com Redação | https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=11 |
| Matemática | https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=9 |
| História | https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=5 |
| Geografia | https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=6 |
| Espanhol | https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=2 |
| Física | https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aano=&anivel=dificil&aseq_area=&aseq_disciplina=8&aseq_etapa=&sb=Buscar |

Current exam-structure evidence: https://sistema.vestibular.uerj.br/portal_vestibular_uerj/perguntas_frequentes/

The FAQ states that the Exame Discursivo includes Redação for every candidate plus two specific disciplines, which is why the UERJ page must describe the current process rather than copy the ENEM structure.

## Re-verification of migrated technology catalogue

All legacy entries with non-null URLs were re-checked on 2026-10-11 for free learning access.

- Harvard CS50: official CS50 OpenCourseWare pages for CS50x, CS50P, CS50W, CS50 AI and CS50 SQL state free/OpenCourseWare access.
- MIT OpenCourseWare: the exact 6.100L, 6.0002, 6.006, 6.042J and 18.06 pages remain openly available.
- Fundação Bradesco Escola Virtual: the official provider states that its courses are fully free; the exact Python, HTML/CSS/JS and FluêncIA entries remain listed.
- FGV: the legacy official course URLs resolve into FGV's current free-course catalogue.
- Cisco Networking Academy: the official Introduction to Cybersecurity page marks the course as Free.

Held-back Microsoft Learn / IBM records remain unpublished because the intended exact Portuguese resource could not be confirmed.

## Pexis Academy: re-verification

Date: 2026-10-11 (Pexis Academy V0.1 implementation, plan T3.2 and T4.3).

### Access from the build environment

The official INEP and UERJ pages could not be opened from the implementation environment on this date:
the outbound proxy refused `www.gov.br` (HTTP 403 on CONNECT) and a second fetcher could not resolve the
host. This is an environment limit, not evidence that any page changed. The official pages recorded above
were verified on this same date by the original audit, and that verification stands. Nothing below is
published on the strength of the search index alone unless stated.

### ENEM reference matrix: Mathematics learning map (not published)

Goal: the learning map of `/materias/matematica/` (spec §6.1). Rule: each proposed item must match an
object of knowledge of the ENEM reference matrix; an item without a match is dropped; if the matrix cannot
be opened, no map is published (plan T4.3).

Evidence available today, by search index only (method `search-index`), pointing to INEP documents:
`https://download.inep.gov.br/download/enem/matriz_referencia.pdf` and
`https://download.inep.gov.br/enem/outros_documentos/enem_matriz_de_referencia_v1.pdf`. The index groups
the Mathematics objects of knowledge into numerical, geometric, statistics and probability, algebraic,
and algebraic-geometric knowledge, and notes that the list differs between editions.

Prepared mapping, to confirm against the official PDF before publishing:

| Proposed item | Object of knowledge in the matrix (per the index) | Status |
| --- | --- | --- |
| Fundamentos | no corresponding object | dropped |
| Aritmética | conhecimentos numéricos (operações em conjuntos numéricos, razões e proporções, porcentagem e juros) | pending |
| Álgebra | conhecimentos algébricos (equações e inequações) | pending |
| Funções | conhecimentos algébricos (funções do 1º e 2º graus, polinomiais, racionais, exponenciais e logarítmicas) | pending |
| Geometria | conhecimentos geométricos | pending |
| Trigonometria | trigonometria do ângulo agudo; ciclo trigonométrico e funções trigonométricas | pending |
| Estatística | representação e análise de dados; medidas de tendência central; desvios e variância | pending |
| Probabilidade | noções de probabilidade | pending |

Decision: `SUBJECTS.matematica.topics` stays empty in V0.1. Publishing needs the official PDF opened at
its source; then the table above becomes the list in `src/lib/taxonomy.ts` and the test in
`tests/taxonomy.test.ts` changes with it.
