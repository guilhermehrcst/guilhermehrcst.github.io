# Pexis Academy | ITA 2025: prova e gabarito, conferência de fonte

**Revisão de referência:** 12/10/2026 (Brasil) / 13/10/2026 (UTC)  
**Base:** Gate C staging `c1fe1548b847bfebec9bde9d0026e086387346cb` após PR #53; `main` contém 43 recursos, L001 aplicado.  
**Estado:** evidência de QA técnica para decisão humana. **Não é aprovação editorial, não autoriza ativação, manifesto ou deploy.**

## Exatamente o que foi conferido

| Documento | URL oficial | Resultado |
| --- | --- | --- |
| Índice | https://vestibular.ita.br/provas.htm | Página do ITA acessível sem conta, com links organizados por ano/fase |
| Prova, 1ª fase, vestibular 2025 | https://vestibular.ita.br/provas/2025_fase1.pdf | PDF acessível; **28 páginas**; capa identifica ITA, vestibular **2025**, 1ª fase |
| Gabarito da mesma prova, vestibular 2025 | https://vestibular.ita.br/provas/gabarito_2025.pdf | PDF acessível; **1 página**, identifica 2025; **48 itens** no gabarito |

A prova indica **48 questões** numeradas por quatro componentes de 12 questões: Matemática 1–12, Física 13–24, Química 25–36 e Inglês 37–48. O gabarito contém a mesma divisão. As questões **9** e **18** aparecem anuladas (sem alternativa correta), como informa a nota do próprio gabarito. Isto é parte dos documentos oficiais, não inferência sobre correções.

**Procedimentos realizados:** abertura da página oficial; clique nos links de prova e gabarito **do mesmo ano** em uma sessão de navegador sem login; inspeção da capa, texto de questões, imagens/diagramas, tabela de respostas e nota de anulação; conferência independente do texto dos PDFs e de sua primeira página. A automação do navegador completou a verificação de conteúdo em 12 passos. Prova/gabarito não foram copiados para o repositório.

## Limitações verificadas

1. **Experiência móvel: não verificada.** O visualizador do navegador de QA não oferecia controle confiável do viewport em 390px nem teste de gestos de zoom. Não afirmar que os PDFs são responsivos ou fáceis de usar no telefone.
2. **Acessibilidade: avaliação parcial.** Há texto extraível no PDF e figuras nos enunciados, mas **não foi validada leitura por leitor de tela, estrutura de tags, ordem de leitura, descrição de figuras ou navegação por teclado**. Extração de texto não equivale à conformidade WCAG.
3. **Escopo do recurso:** o destino é um **arquivo de provas anteriores e gabaritos oficiais**, no formato `past-exam`, não um curso, aula acompanhada, inscrição ou oferta de certificação.
4. **Atualidade:** o candidato aponta para um índice atualizado pelo ITA, não para um edital específico. Inscrição, requisitos, datas e conteúdo cobrado devem ser consultados no edital do processo seletivo vigente.
5. **Cadastro:** o índice e esses dois PDFs foram acessados sem cadastro. Isso não comprova o acesso a qualquer recurso futuro que o ITA possa adicionar.

## Parecer técnico e gates

**`ita-provas-anteriores`: elegível para decisão editorial individual**, com ressalva explícita sobre leitura móvel e acessibilidade dos PDFs. O registro existente em `src/lib/staging.ts` permanece inalterado, inclusive `registration: 'not-required'` e `format: 'past-exam'`.

Este exame **não remove** os bloqueios das duas aulas do Ensino Fundamental (`ef-sme-alfabeto-1` e `ef-sme-funcoes-9`) documentados em `l002-editorial-review-2026-10-12.md`.

Uma etapa futura, **se autorizada separadamente**, pode ativar apenas **Pré-Militar**, usando um L002 com **um** recurso e inventário projetado de **43 → 44**, mantendo Ensino Fundamental em `preparing`. Esse lote exige: aprovação editorial humana do registro/digest exato, autorização explícita de ativação de Pré-Militar, autorização separada de aplicar manifesto e depois de merge/deploy, testes do build e QA do site; este relatório **não executa nenhum desses atos**.
