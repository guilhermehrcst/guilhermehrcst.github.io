# Pexis Academy | Proposta do Lote 01 (publicação incremental)

**Status: PROPOSTA PARA DECISÃO EDITORIAL. Nenhum item abaixo está aprovado.** Este documento não altera
`release.json`, não cria manifesto de lote e não publica nada. O Claude não atribui `approved` a nenhum
recurso: a aprovação é uma decisão humana registrada no manifesto (ver
`docs/academy/operacao-publicacao-incremental.md`).

**Base de evidência:** `docs/superpowers/qa/2026-10-12-v04-external-qa-round4.json` (rodada 4, 37 candidatos)
e a decisão do proprietário de que os 28 itens confirmados por extração **não estão homologados**. Os
estados abaixo são os da rodada 4, sem promoção: "content access confirmed" é conteúdo extraído de página
ou PDF ao vivo, não homologação em navegador.

## Como ler as categorias

| Categoria | Significado | Pode entrar num lote aprovado? |
|---|---|---|
| Confirmado por extração | Conteúdo público extraído ao vivo; sem sessão interativa | Só depois da abertura por uma pessoa e da decisão |
| Confirmado em navegador interativo | Sessão interativa abriu o conteúdo (rodada 4 ou anterior) | Sim, após conferência de que nada mudou e da decisão |
| Parcial | Página alcançada; atividade, vídeo ou parte relevante não inspecionada | Não, até completar a pendência do formato |
| Bloqueado | Nenhum navegador abriu a página | Não (`held`) |
| Aprovado pelo proprietário | Decisão humana registrada num manifesto | **Nenhum item hoje** |

## Lote 01 proposto: 10 recursos, um caminho por vez sem depender de 10 destaques

Critérios: evidência mais forte disponível por formato, formatos textuais ou documentos legíveis (sem
depender de vídeo), hosts oficiais, ao menos um item na **própria página** de Fundamental e de Pré-Militar
para permitir ativá-los, e nenhum item parcial ou bloqueado.

| # | ID | Caminho | Instituição | Formato | URL exata | Evidência atual (rodada 4) | Por que neste lote | Pendente antes de aprovar |
|---|---|---|---|---|---|---|---|---|
| 1 | `ef-sme-alfabeto-1` | Fundamental | SME Goiânia | lesson | https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/lingua-portuguesa-nosso-alfabeto/ | content access confirmed; navegador interativo não confirmado | Aula textual da rede municipal, 1º ano: abre o caminho Fundamental (anos iniciais) com um item na própria página. | Abertura por uma pessoa em navegador comum; conferir título, gratuidade, idioma e cadastro do registro tipado; registrar a evidência datada. |
| 2 | `ef-sme-funcoes-9` | Fundamental | SME Goiânia | lesson | https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/matematica-funcao-de-1o-e-de-2o-grau/ | content access confirmed; navegador interativo não confirmado | Aula textual, 9º ano: cobre os anos finais sem depender de vídeo. | Abertura por uma pessoa em navegador comum; conferir título, gratuidade, idioma e cadastro do registro tipado; registrar a evidência datada. |
| 3 | `inep-enem-provas-gabaritos` | Vestibular | INEP | past-exam | https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos | content access confirmed; navegador interativo não confirmado | Fonte oficial do INEP, host já publicado (www.gov.br); passa a ser recurso, não só nota de fonte. | Abertura por uma pessoa em navegador comum; conferir título, gratuidade, idioma e cadastro do registro tipado; registrar a evidência datada. |
| 4 | `fuvest-acervo-2026` | Vestibular | Fuvest | past-exam | https://www.fuvest.br/acervo-vestibular-2026/ | content access confirmed; navegador interativo não confirmado | Acervo oficial da Fuvest com provas e gabaritos. | Abertura por uma pessoa em navegador comum; conferir título, gratuidade, idioma e cadastro do registro tipado; registrar a evidência datada. |
| 5 | `ita-provas-anteriores` | Pré-Militar | ITA | past-exam | https://vestibular.ita.br/provas.htm | content access confirmed; navegador interativo não confirmado | Índice oficial do ITA com provas de 2026 e anos anteriores (PDF da 1ª fase abriu); segundo item do Pré-Militar, de outra instituição. | Abertura por uma pessoa em navegador comum; conferir título, gratuidade, idioma e cadastro do registro tipado; registrar a evidência datada. |
| 6 | `mit-1801sc` | Superior | MIT OpenCourseWare | course | https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/ | content access confirmed; navegador interativo não confirmado | Curso do MIT OCW (Cálculo de uma variável; sessão 23 aberta na rodada 4), host já publicado (ocw.mit.edu); entra no grupo Matemática já existente. | Abertura por uma pessoa em navegador comum; conferir título, gratuidade, idioma e cadastro do registro tipado; registrar a evidência datada. Vídeos não reproduzidos na rodada 4: o registro não pode prometer vídeo. |
| 7 | `yale-psyc-110` | Superior | Open Yale Courses | course | https://oyc.yale.edu/introduction-psychology/psyc-110 | content access confirmed; navegador interativo não confirmado | Curso aberto de Yale com transcrição pública da Lecture 1; abre o grupo Psicologia com um curso (grupo de um curso é permitido). | Abertura por uma pessoa em navegador comum; conferir título, gratuidade, idioma e cadastro do registro tipado; registrar a evidência datada. |
| 8 | `odin-foundations` | Tecnologia | The Odin Project | track | https://www.theodinproject.com/paths/foundations/courses/foundations | content access confirmed; navegador interativo não confirmado | Currículo aberto, textual; não depende de conta para o conteúdo anunciado. | Abertura por uma pessoa em navegador comum; conferir título, gratuidade, idioma e cadastro do registro tipado; registrar a evidência datada. Conta opcional para acompanhamento: conferir `registration` do registro. |
| 9 | `ms-learn-cloud-concepts` | Tecnologia | Microsoft Learn | track | https://learn.microsoft.com/pt-br/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/ | verified previous browser; navegador interativo confirmado | Big Tech com verificação específica: sessão interativa anterior confirmou rota pt-BR e primeira unidade legível sem login. | Conferir que a página não mudou desde a sessão interativa; registrar a evidência datada. A página avisa tradução por IA; certificado não comprovado (fica `unconfirmed`). |
| 10 | `pm-cn-provas` | Pré-Militar | Marinha do Brasil / SSPM | past-exam | https://assets.marinha.mil.br/sspm/sites/www.marinha.mil.br.sspm/files/provas/CPACN%201DIA%20AMARELO.pdf | content access confirmed; navegador interativo confirmado | Única prova militar com confirmação em navegador interativo (rodada 4): abre o caminho Pré-Militar na própria página. | Conferir que a página não mudou desde a sessão interativa; registrar a evidência datada. PDF escaneado (busca por texto limitada): avaliar acessibilidade antes de aprovar. |

Efeitos se aprovado e autorizado (verificados na simulação, não em produção):

- Catálogo público: 37 + 10 = 47; os 37 da V0.4 inalterados (digest de base).
- Ativação de Fundamental e Pré-Militar é **decisão separada** (`PATH_STATUS`); com estes itens, cada
  página teria recurso próprio e nenhuma seção "Dez destaques".
- Destaques continuam não liberados em todos os caminhos.
- Hosts novos a revisar no manifesto e no espelho de `scripts/verify-dist.mjs`: `sme.goiania.go.gov.br`,
  `assets.marinha.mil.br`, `vestibular.ita.br`, `oyc.yale.edu`, `learn.microsoft.com`,
  `www.theodinproject.com`, `www.fuvest.br` (`ocw.mit.edu` e `www.gov.br` já publicados).
- `inep-enem-provas-gabaritos` publicado muda a nota de fonte da página ENEM (guarda
  `exam-guides.test.ts` deve ser atualizada deliberadamente no PR do lote).
- `ms-learn-cloud-concepts` abre a trilha de Tecnologia "computação em nuvem": a lista de trilhas de
  `verify-dist.mjs` precisa do item.

## Retidos (`held`): fora do Lote 01, sem bloquear os demais

| ID | Caminho | Estado (rodada 4) | Motivo da retenção |
|---|---|---|---|
| `ef-obmep-fracoes-6` | Fundamental | partial | PARCIAL: videoaulas; reprodução não verificada. |
| `ef-obmep-potenciacao-8` | Fundamental | partial | PARCIAL: videoaulas; reprodução não verificada. |
| `kultivi-enem-completo` | Vestibular | partial | PARCIAL: navegador interativo abriu, mas aulas em vídeo e regra de conta não foram inspecionadas. |
| `mit-801sc` | Superior | partial | PARCIAL: mídia/atividade não inspecionada. |
| `mit-7012` | Superior | partial | PARCIAL: mídia/atividade não inspecionada. |
| `google-mlcc` | Tecnologia | content access confirmed | Big Tech sem verificação específica além da extração de conteúdo: fica fora até sessão interativa própria. |
| `pm-eam-provas` | Pré-Militar | partial | PARCIAL: documento alcançado, conteúdo relevante não inspecionado por inteiro. |
| `cecierj-aprovarj` | Pré-Militar | partial | PARCIAL: atividade/aula atrás de etapa não inspecionada. |
| `pm-esa-provas-2026` | Pré-Militar | blocked browser | BLOQUEADO: o PDF oficial não abre em navegador (ERR_CONNECTION_CLOSED). Fica `held` até URL navegável ou substituição editorial formal. |

## Para lotes seguintes (aguardam abertura por uma pessoa e decisão)

`sme-goiania-letras-e-palavras`, `sme-goiania-leitura-em-foco`, `ef-sme-vegetacao-3`, `ef-sme-municipio-4`, `ef-sme-vestigios-5`, `ef-sme-tecnologia-vida-7`, `yale-econ-252`, `ou-environment-treading-lightly`, `cecierj-pvs-portugues-v1`, `cecierj-pvs-matematica-mod1`, `cecierj-pvs-historia-mod2`, `cecierj-pvs-geografia-mod1`, `cecierj-pvs-fisica-v1`, `pm-en-provas`, `pm-eear-provas`, `pm-afa-provas`, `pm-epcar-provas`, `pm-ime-provas`.

## O que falta para o Lote 01 virar publicação

1. Uma pessoa abre cada URL em navegador comum e registra a evidência datada (o que viu, gratuidade,
   idioma, cadastro, certificado só se confirmado).
2. Se o registro tipado divergir do que foi visto, corrige-se o registro **antes** de calcular o digest.
3. A pessoa responsável grava `decision: approved` por item no manifesto `L001-…json`, com seu nome e data.
4. Autorização explícita de publicação do lote exato (`authorization`), separada das aprovações.
5. PR com o manifesto, `release.json` (lote aplicado, inventário 47), espelhos de `verify-dist`, guardas de
   estado atualizadas uma a uma, simulação e QA. Merge e deploy só com autorização expressa.

A simulação desta branch (`docs/superpowers/qa/2026-10-12-incremental-release/`) usou outros IDs, de
propósito, incluindo um parcial (`ef-obmep-fracoes-6`) e a suspensão de `google-mlcc`: ela prova o motor,
não esta proposta.
