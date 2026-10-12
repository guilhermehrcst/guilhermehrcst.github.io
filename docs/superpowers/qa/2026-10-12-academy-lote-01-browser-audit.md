# Pexis Academy | Lote 01 | QA externa de candidatos (12/10/2026)

**Documento de evidência, NÃO uma decisão editorial e NÃO uma autorização de publicação.**
A inspeção foi executada por agentes automatizados em sessões de navegador e por leitores independentes de páginas/PDFs. Um relatório de automação não pode assinar `verified`, `approved`, `held` ou `authorization` em nome de uma pessoa.

## Snapshot imutável desta rodada

- Repositório: `guilhermehrcst/guilhermehrcst.github.io`.
- Base observada do PR #37: `feat/academy-gateb-typed-staging-v01` em `2d08ab8c27654e94b432914c45c8a7b588d45795` (PR draft, base `main` em `5e4b086`).
- `src/data/academy-release/release.json`: `mode: production`, `applied: []`, `ledger: []`, 37 IDs no `inventory`.
- O PR #43 do motor foi integrado **ao staging**, não à `main`. Último CI de staging observado: [38308179248](https://github.com/guilhermehrcst/guilhermehrcst.github.io/actions/runs/38308179248), build aprovado e deploy ignorado (309 testes relatados no PR #37).
- Seleção deste documento: os 10 **candidatos** da proposta `docs/superpowers/plans/2026-10-12-academy-lote-01-proposal.md`; **zero aprovados por este documento**.
- Contagens de eventual release: 37 + até 10 candidatos - suspensões, **somente após aprovação individual, autorização do lote e aplicação**. Nenhuma dessas três transições ocorreu.

## Matriz de evidência por candidato

| ID e caminho | Evidência nova e alcance | Lacunas para decisão humana |
|---|---|---|
| `ef-sme-alfabeto-1` · Fundamental | [Navegador](https://agent.tinyfish.ai/runs/a5e61cdd-973c-41a6-ab77-33cee1bfee3c): página SME 1º ano abriu, 7 atividades de letras e jogo Wordwall utilizável sem login, links para slides/atividades/texto reportados acessíveis. | Acesso aos materiais complementares não equivale a auditoria integral dos arquivos; verificar acessibilidade, cookies/privacidade do Wordwall e experiência da criança antes de aprovar. |
| `ef-sme-funcoes-9` · Fundamental | [Navegador](https://agent.tinyfish.ai/runs/a0f88cc6-aed0-4525-ac5a-f06e32499d59): 9º ano, funções de 1º/2º grau, conteúdo teórico e quatro exercícios presentes; anexos Google Docs identificados. | O player da videoaula de YouTube exigiu checagem anti-bot; reprodução **não confirmada**, sem inferir que esteja quebrado para pessoas. Verificar se links `/copy` exigem login para gerar cópia e se a lição permanece útil sem vídeo. |
| `inep-enem-provas-gabaritos` · Vestibular | [Navegador](https://agent.tinyfish.ai/runs/7cc3daa8-1cfb-45dc-8df8-7cbfecc324f4): abas de 2025/2024 carregaram com JS, links oficiais de provas/gabaritos presentes. PDFs amostrais de 2025 confirmados em origem por leitor independente (ver abaixo). | Não inferir que **todos** os anos e arquivos abram a partir de duas amostras; testar acessibilidade móvel e navegação via teclado. A análise automática cometeu erro temporal ao afirmar que o ENEM 2025 ainda não teria ocorrido: alegação descartada. |
| `fuvest-acervo-2026` · Vestibular | [Navegador](https://agent.tinyfish.ai/runs/544f2b7d-48c8-46a0-8f96-54bd64588a38): provas e gabaritos das duas fases na página oficial; prova V1 2026 (38 páginas) e gabarito 2026 (2 páginas) independentes confirmados em PDFs válidos. | QA responsiva em telefone ainda não realizada; não afirmar todos os PDFs verificados individualmente. |
| `ita-provas-anteriores` · Pré-Militar | [Navegador](https://agent.tinyfish.ai/runs/89408ed8-f789-42d4-9c87-93bad65515ce): índice oficial de provas anteriores sem login. Leitor independente confirmou PDF da 1ª fase 2024 (22 páginas) e gabarito 2024 (1 página). | O visualizador da automação não renderizou PDF, embora o arquivo tenha sido lido por ferramenta independente; testar viewer real em mobile/desktop. Não afirmar acessibilidade ou disponibilidade de todo o histórico com base apenas na amostra. |
| `mit-1801sc` · Superior | [Navegador](https://agent.tinyfish.ai/runs/cc0987cd-b6b8-41a3-b290-8b822e09a7ae): MIT OCW Single Variable Calculus em inglês, notas/aulas, sessões, provas, listas, PDF de transcrição, sem login/paywall. | Vídeos identificados, mas não reproduzidos exaustivamente; curso de 2010 e sem certificado/crédito; fazer revisão pedagógica e comunicação honesta. |
| `yale-psyc-110` · Superior | [Navegador](https://agent.tinyfish.ai/runs/f5679cf1-c877-4064-ae79-220eefa25107): Open Yale Courses, Psychology PSYC 110, Lecture 1 disponível em `https://oyc.yale.edu/psychology/psyc-110/lecture-1`, player YouTube e transcrição HTML, sem login/paywall. | Curso gravado em 2007, referências sujeitas a desatualização; não presumir atualidade integral nem certificado/crédito universitário. |
| `odin-foundations` · Tecnologia | [Navegador](https://agent.tinyfish.ai/runs/e8621ca0-98a1-4852-992d-6df7666631be): Foundations gratuito, lições de HTML/CSS/JS/Git e cinco projetos, leitura sem cadastro. | Não foi comprovado se salvar progresso exige cadastro. Termos oficiais citam CC BY-NC-SA 4.0: **indicar e linkar**, não copiar/espelhar o curso sem análise de licença. Nenhum certificado confirmado. |
| `ms-learn-cloud-concepts` · Tecnologia | [Navegador anterior](https://agent.tinyfish.ai/runs/f1ce30e4-f26b-47cb-b5a2-e0a5e78abc0f), também documentado no PR #37: rota pt-BR e primeira unidade legíveis sem login; três módulos sobre nuvem. [Extração de fonte](https://learn.microsoft.com/pt-br/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/) confirmou conteúdo. | A interface avisa sobre tradução por IA. Certificação AZ-900 é separada, não prometê-la ao aluno; `certificate: unconfirmed` permanece correto. |
| `pm-cn-provas` · Pré-Militar | [Navegador](https://agent.tinyfish.ai/runs/4f38d0f5-db16-4ad5-9d79-a429db835223) + leitor independente da [prova CPACN 2025 (URL exata)](https://assets.marinha.mil.br/sspm/sites/www.marinha.mil.br.sspm/files/provas/CPACN%201DIA%20AMARELO.pdf): HTTP 200, PDF 19 páginas, capa oficial da Marinha, Matemática e Inglês do 1º dia; amostra das 3 primeiras páginas extraída. | Browser automatizado não renderizou PDF nativamente. O agente levantou suspeita de páginas digitalizadas sem texto selecionável e leitura móvel inadequada, **não confirmada por inspeção independente da camada de texto**. Fazer verificação manual de viewer, contraste, zoom, navegação e alternativa acessível. |

## PDFs validados em segunda ferramenta (amostra)

Todos os URLs abaixo retornaram `HTTP 200` e `application/pdf` em acesso de extração live (`maxAge: 0`), com capa/trecho textual da página inicial:

| Fonte | URL independente | PDF |
|---|---|---|
| INEP, prova ENEM 2025, Caderno 1 Azul, dia 1 | [Prova](https://download.inep.gov.br/enem/provas_e_gabaritos/2025_PV_impresso_D1_CD1.pdf) | 32 páginas |
| INEP, gabarito ENEM 2025, Caderno 1 Azul, dia 1 | [Gabarito](https://download.inep.gov.br/enem/provas_e_gabaritos/2025_GB_impresso_D1_CD1.pdf) | 1 página |
| Fuvest 2026, primeira fase, V1 | [Prova](https://www.fuvest.br/wp-content/uploads/fuvest2026-fase1-prova-V1.pdf) | 38 páginas |
| Fuvest 2026, primeira fase | [Gabarito](https://www.fuvest.br/wp-content/uploads/fuvest2026-fase1-gabarito.pdf) | 2 páginas |
| ITA 2024, primeira fase | [Prova](https://vestibular.ita.br/provas/2024_fase1.pdf) | 22 páginas |
| ITA 2024, gabarito | [Gabarito](https://vestibular.ita.br/provas/gabarito_2024.pdf) | 1 página |
| Marinha, Colégio Naval CPACN 2025 | [Prova amarela](https://assets.marinha.mil.br/sspm/sites/www.marinha.mil.br.sspm/files/provas/CPACN%201DIA%20AMARELO.pdf) | 19 páginas (amostra de 3 páginas) |

**Limites da metodologia:** `HTTP 200`, texto extraído e um PDF amostral **não** provam que todas as páginas, recursos incorporados, leitor de tela, vídeos, inscrições ou certificados funcionem. Bloqueio anti-bot do YouTube no ambiente automatizado também **não** é prova de indisponibilidade ao aluno. Esta auditoria não mede WCAG, conformidade LGPD dos sites externos ou retenção/telemetria de terceiros. Não atribuir essa conformidade por ausência de banner.

## Ações antes de qualquer decisão editorial

1. **Conferência humana na fonte exata, individualmente:** título, instituição, formato, faixa/série, conteúdo completo do formato prometido, gratuidade, idioma, registro/conta, certificado; abrir em navegador comum, especialmente anexos/páginas bloqueadas por automação. Incluir acessibilidade de PDF e conteúdo para menores.
2. **Contratos tipados:** comparar cada registro de `src/lib/staging*.ts` com o observado. Corrigir metadados ou notas apenas se comprovado e documentado; recalcular digest após mudança, nunca manter digest obsoleto. O `ef-sme-funcoes-9` não deve prometer reprodução de vídeo não comprovada; o `ef-sme-alfabeto-1` tem nota histórica de anexos não testados, exigindo revisão cuidadosa.
3. **Decisão por recurso, humana:** usar `tools/academy-release.ts entry <id>` e registrar `decidedBy` e `decidedOn` verdadeiros, com evidência vinculada ao registro. Nenhuma ferramenta pode se passar por aprovador ou preencher `approved` sem essa decisão. Retenções `held` não bloqueiam os demais.
4. **Autorização separada por lote:** somente após decisões individuais, autorizar exatamente o manifesto L001 com `authorization`, registrar novos hosts vinculados à instituição, e então pedir revisão do PR de aplicação antes de publicar.
5. **Release:** aplicar no `release.json`, `ledger`, `inventory`, espelhos `verify-dist`, decidir `PATH_STATUS` separadamente, preservar guardas de estado, executar testes e QA de navegador no build final. Merge da branch #37 e deploy não estão autorizados por este relatório.

### Parecer

**Resultado técnico:** os dez links do Lote 01 tiveram alguma inspeção em navegador; amostras de PDFs nas fontes oficiais tiveram verificação independente. Existem ressalvas concretas sobre mídia YouTube, acessibilidade potencial do documento CPACN, testes mobile, histórico completo de arquivos e privacidade de embeds.

**Resultado editorial:** `candidate` para os 10, **zero recursos homologados por decisão humana neste documento**; `approved = 0`, `authorization = null`, `applied = []`. Não ativar Fundamental/Pré-Militar nem liberar destaques com base nestes resultados. Preferir liberar gradualmente somente recursos que atendam ao contrato verificado e assinado, sem esperar dez destaques para abrir uma trilha útil.

## Evidências e contexto complementar

- [Proposta Lote 01](../../plans/2026-10-12-academy-lote-01-proposal.md)
- [Guia operacional de publicação incremental](../../../academy/operacao-publicacao-incremental.md)
- [Comentário de QA do primeiro recurso no PR #37](https://github.com/guilhermehrcst/guilhermehrcst.github.io/pull/37#issuecomment-6132661275)
- [Preflight dos nove candidatos no PR #37](https://github.com/guilhermehrcst/guilhermehrcst.github.io/pull/37#issuecomment-6132697169)

Este documento não contém dados pessoais de estudantes, não reproduz PDFs/cursos externos e não altera qualquer arquivo executável ou manifesto de release.
