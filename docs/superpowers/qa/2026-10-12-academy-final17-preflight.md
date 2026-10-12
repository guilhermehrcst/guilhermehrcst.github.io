# Pexis Academy | Gate B: pré-auditoria dos 17 candidatos finais (12/10/2026)

**Tipo:** evidência de pesquisa independente. **Estado de publicação:** inalterado. **Decisões editoriais:** nenhuma.

Este documento completa a **cobertura de triagem preliminar** dos 37 candidatos ainda não publicados na seleção de 60 recursos (os primeiros dez estão no [PR #44](https://github.com/guilhermehrcst/guilhermehrcst.github.io/pull/44), os dez seguintes no [PR #45](https://github.com/guilhermehrcst/guilhermehrcst.github.io/pull/45)). Triagem de URL não é homologação nem aprovação. Não inventar uma taxa de homologação de 37/37.

## Snapshot e limites

- Base: `feat/academy-gateb-typed-staging-v01` / `2d08ab8c27654e94b432914c45c8a7b588d45795`; PR #37 segue draft contra a `main`. `GATEB_DRAFT_SELECTION` tem 60 IDs únicos: 23 publicados já existentes e 37 candidatos.
- Estado de produção observado: 37 recursos públicos legados; `src/data/academy-release/release.json` contém `mode: production`, `applied: []`, `ledger: []`.
- Pesquisa: extração live de URLs (`ttl/maxAge: 0`), sessões interativas do navegador e leitura amostral de PDFs oficiais. Ferramentas distintas produzem capacidades de renderização e erros distintos.
- Não se registrou decisão humana `verified`, `approved`, `held` nem `authorization`, não se criou manifesto L001/L002, não se alterou catálogo, `main`, deploy, `PATH_STATUS` nem destaques. Quando uma URL falha, **reter para decisão humana**, não fingir indisponibilidade definitiva.

## Portal OBMEP e preparação ENEM | três candidatos

| ID / URL oficial | Evidência nova | Pendências e limites |
|---|---|---|
| `ef-obmep-fracoes-6` · [Frações, o Primeiro Contato](https://portaldaobmep.impa.br/index.php/modulo/ver?modulo=28) | [Sessão](https://agent.tinyfish.ai/runs/15dc686e-eb6a-45d6-8cbf-f779b29c31ac): módulo público com descrições de videoaulas, botões para assistir e recursos de PDFs teóricos/cadernos; modal de vídeo abriu, sem login no índice. | A sessão produziu **contagens internamente incoerentes de vídeos**: não usar seus números como fatos. Botão “Assistir Legendado” abriu um modal, mas legenda efetivamente exibida não foi comprovada. O texto “6º ano” não aparece na página específica; a classificação deve ser verificada contra o índice oficial/caderno. Não inferir que todos os vídeos ou quizzes funcionem sem login. |
| `ef-obmep-potenciacao-8` · [Potenciação](https://portaldaobmep.impa.br/index.php/modulo/ver?modulo=1059) | [Sessão](https://agent.tinyfish.ai/runs/0f8f4e8f-e817-4370-ba03-aa35611960a3): aulas e exercícios listados, sem conta para ver índice; PDF [caderno oficial](https://cdnportaldaobmep.impa.br/portaldaobmep/uploads/material/65gaqtmw89wk0.pdf) confirmado por ferramenta independente `HTTP 200`, 5 páginas, texto com exercícios e capa **“Oitavo Ano”**. | Reprodução de vídeo não foi comprovada. Nem todos os exercícios resolvidos foram abertos. Vinculação explícita ao 8º ano está no PDF, não na página principal. |
| `kultivi-enem-completo` · [ENEM Completo](https://kultivi.com/curso/enem-completo) | [Sessão](https://agent.tinyfish.ai/runs/6ef2ce91-e6e5-442c-8a69-fb8c7e81ca5c): página exibe 16 disciplinas, **1.058 aulas**, 378h30, matrícula gratuita e certificado digital gratuito declarado; soma das aulas dos módulos coincide com 1.058. | **Acesso às videoaulas exige conta**; clicar “comece a estudar” abriu formulário de cadastro, sem vídeo prévio. Não foi criada conta nem verificado o conteúdo atrás do login. O registro tipado já declara `registration: required` e `certificate: available`. Não promover sem verificação do contrato dentro da plataforma, por pessoa autorizada. |

## Ensino Superior e IA | cinco candidatos

| ID / fonte exata | Evidência nova | Lacunas |
|---|---|---|
| `mit-801sc` · [MIT Classical Mechanics](https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/) | Página oficial extraída com identificação do curso 8.01SC, 2016, graduação, vídeos e problem sets. | Não foi testada nesta rodada a reprodução de mídia ou a abertura de uma lição completa em navegador; a data do curso deve ser mostrada honestamente. |
| `mit-7012` · [MIT Introduction to Biology](https://ocw.mit.edu/courses/7-012-introduction-to-biology-fall-2004/) | Página oficial com escopo de Biologia, notas, exames, soluções, listas e vídeos, edição de 2004. | **Conteúdo antigo:** avaliar cientificamente o que continua correto; testar uma aula e material de avaliação em navegador, sem assumir vídeos acessíveis. |
| `yale-econ-252` · [Open Yale Financial Markets (2011)](https://oyc.yale.edu/economics/econ-252) | Página oficial identifica ECON 252 e curso gravado em 2011, com descrição de riscos, mercados financeiros, seguros e bancos. | Aulas e avaliações individuais não reabertas nesta rodada; referências econômicas de 2011 não são dados atuais de mercado. Não prometer diploma nem créditos. |
| `ou-environment-treading-lightly` · [Open University OpenLearn](https://www.open.edu/openlearn/nature-environment/environmental-studies/environment-treading-lightly-on-the-earth/content-section-0) | Extrator direto respondeu `bot_blocked` (desafio Cloudflare), mas a [sessão de navegador independente concluída](https://agent.tinyfish.ai/runs/23ee9270-7948-4478-be6f-0781192821aa) abriu o curso: **15 horas**, inglês, 11 seções públicas de estudo sem cadastro, formatos para download e declaração gratuita de participação disponível após cadastro e acompanhamento. | Acesso pode mostrar desafio anti-bot inicialmente. **`statement of participation` não é diploma, crédito acadêmico nem certificação universitária formal.** Confirmar em navegador humano como se obtém exatamente a declaração antes de prometer emissão. O registro tipado mantém `certificate: participation`. |
| `google-mlcc` · [Google Machine Learning Crash Course](https://developers.google.com/machine-learning/crash-course/) | [Navegador concluído](https://agent.tinyfish.ai/runs/434b5026-e780-4044-b656-455251a6d192): curso e player de vídeo abriram sem login; o exercício interativo de parâmetros em [regressão linear](https://developers.google.com/machine-learning/crash-course/linear-regression) respondeu a uma seleção com feedback imediato. Página com `?hl=pt-br` exibiu conteúdo em português. | **Diferença de experiência/metadata:** o registro original marca `language: 'en'`; a origem tem alternativa pt-BR. Decidir humanamente se vale vincular a versão pt-BR e alterar o registro/digest somente em PR editorial. Não assumir que todo exercício de programação ou curso foi testado; sem promessa de certificado ou de progresso salvo sem conta. |

## Pré-Militar | sete provas e um curso

Os sete PDFs abaixo foram testados por verificador independente na **URL exata do registro tipado**. Nos sucessos, retorno `HTTP 200`, `application/pdf`, com capa e primeiro trecho, **não inspeção integral de cada página**, nem garantia WCAG/móvel. Um dos sete segue inacessível neste ambiente.

| ID | URL de referência / evidência | Resultado / decisão pendente |
|---|---|---|
| `pm-en-provas` | [Escola Naval, CPAEN 2025 dia 1](https://www.inscricao.marinha.mil.br/marinha/CPAEN%20D1%20Amarela.pdf?id_file=8961) | PDF 19 páginas, capa oficial Marinha/CPAEN 2025, Matemática e Inglês. Revisão de leitor PDF, acessibilidade e conteúdo integral pendente. |
| `pm-eear-provas` | [EEAR CFS 1/2024](https://ingresso.eear.fab.mil.br/SOO/escolaridade/CFS%201%202024/prova_cfs%201%202024_cod_02_03%2007%202023%2010%2013%2002.pdf) | PDF 17 páginas. Capa menciona gabarito oficial e provas de Português, Inglês, Matemática e Física. Não assumir que índice, gabarito e prova sejam recursos separados ou que tudo esteja acessível. |
| `pm-eam-provas` | [Escolas de Aprendizes-Marinheiros 2023](https://assets.marinha.mil.br/sspm/sites/www.marinha.mil.br.sspm/files/provas/CPAEAM-2023-PROVA%20AMARELA.pdf) | PDF 15 páginas, capa CPAEAM 2023, Matemática, Português, Ciências e Inglês. Inspeção amostral. |
| `pm-afa-provas` | [AFA 2025 versão A](https://www.fab.mil.br/ingresso/arquivos/2024/afa/afa2025_prova_versao_a.pdf) | PDF 24 páginas; capa declara 64 questões objetivas e redação. Não inferir disponibilidade permanente. |
| `pm-epcar-provas` | [EPCAR/CPCAR 2026 versão A](https://www.fab.mil.br/ingresso/arquivos/2025/cpcar/cpcar-2026-08-05-2025-P1-vers%C3%A3o-A.pdf) | PDF 17 páginas; capa declara 48 questões e redação, aplicação de 22/06/2025. A edição é 2026, a prova ocorreu em 2025; manter distinção no metadado. |
| `pm-esa-provas-2026` | [ESA 2026](https://esa.eb.mil.br/images/SCA/Prova-Geral_2026.pdf) | **BLOQUEADO neste ambiente:** novo acesso devolveu `ERR_CONNECTION_CLOSED`. Não declarar 200, nem promover, nem inferir indisponibilidade universal. Continua candidato para decisão humana de retenção `held` até navegador convencional abrir URL exata ou haver substituição editorial explícita. |
| `pm-ime-provas` | [IME CFG 2024/2025](https://www.ime.eb.mil.br/images/arquivos/admissao/cfg/provas-anteriores/2024-2025/CFG_Objetiva_24_25.pdf) | PDF 24 páginas, capa de prova objetiva com 40 questões. Amostra independente confirmou a fonte. |

### Curso `cecierj-aprovarj`

A [página AprovaRJ da Fundação Cecierj](https://extensao.cecierj.edu.br/cursos/aprovarj/) anuncia preparação online gratuita para escolas militares, técnicas e institutos federais. [Sessão de navegador](https://agent.tinyfish.ai/runs/9fe00252-af02-4ad9-ae54-9fbb19d212d9) confirmou que o acesso aos materiais internos ocorre em `https://extensao.cecierj.edu.br/sav/` **com cadastro/login obrigatório**. A página informa **ausência de certificação**. Nenhum curso interno foi acessado após login; gratuita é a oferta declarada, não uma inspeção de todas as aulas. O registro tipado já define `registration: required` e `certificate: none`.

## Apostila de Física Cecierj (candidato `cecierj-pvs-fisica-v1`)

[Física, volume 1](https://canal.cecierj.edu.br/042022/cad642065613839097b51486f3ec3eec.pdf), Fundação Cecierj: `HTTP 200`, `application/pdf`, **188 páginas**, capa institucional com indicação de **VENDA PROIBIDA**. Primeiro material extraído identificou o volume; não há análise exaustiva de suas 188 páginas. **A Pexis Academy deve linkar a fonte oficial**, não espelhar nem monetizar a apostila sem direito de redistribuição verificado. `format: reference` permanece preciso.

## Achados transversais que alteram prioridades

1. **Cadastro não é paywall.** Kultivi e AprovaRJ prometem estudo gratuito, mas exigem conta para assistir aulas. Eles devem ser classificados honestamente; a auditoria não passou pelos logins. Não usar a ausência de preview como prova de inexistência das aulas.
2. **Acesso ao PDF não é acessibilidade WCAG.** O leitor de PDF da automação pode falhar apesar de `HTTP 200`; conteúdo de imagem, texto pesquisável, legibilidade no telefone e compatibilidade com leitor de tela exigem teste específico.
3. **Exercícios sem conta precisam ser demonstrados, não inferidos de botões.** OBMEP Potenciação tem PDF de exercícios efetivamente confirmado, capa do 8º ano; Frações tem materiais observados mas contagens de vídeos do agente inconsistentes.
4. **Atualização de conteúdo:** cursos MIT de 2004 e 2016, Yale de 2011 e apostilas antigas não podem ser anunciados como materiais atualizados para 2026 sem revisão específica.
5. **Fonte bloqueada:** ESA 2026 permanece inacessível neste ambiente e fora de release automático. A Open University exigiu superar uma checagem Cloudflare, mas abriu na sessão de navegador posterior; não confundir estes dois estados.
6. **Publicidade e parceria:** Pexis Academy age como diretório independente que envia o estudante a fontes externas. Não afirmar afiliação institucional nem distribuir materiais de terceiros sem autorização/licença.

## Checklist para desbloquear a próxima etapa

- [ ] Revisar manualmente URLs dos candidatos, formatos prometidos, gratuidade e idioma.
- [ ] Corrigir divergências de `src/lib/staging*.ts` apenas com evidência e digest recalculado, mantendo testes.
- [ ] Conferir mídia e interatividade real ainda não testadas (OBMEP/MIT), revisar a versão pt-BR do Google antes de qualquer alteração de registro, e revisar conteúdo de cursos acessíveis só após cadastro (Kultivi/AprovaRJ), respeitando a privacidade de contas.
- [ ] Separar, de modo explícito, itens que exigem `held` por decisão humana dos aprováveis após conferência.
- [ ] Somente uma pessoa decide `approved`, `held`, autoriza um lote exato e, em ato posterior, permite aplicá-lo ao catálogo.
- [ ] Fazer QA do `dist/` e rollback da versão realmente autorizada antes de merge/deploy.

**Escopo desta branch:** documentação de pré-auditoria apenas. **Publicação = 37, aprovações por esta rodada = 0, lotes aplicados = 0.** Não inserir decisões/assinaturas fictícias nem modificar a `main`.
