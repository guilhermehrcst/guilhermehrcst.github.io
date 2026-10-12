# Simulação do motor de publicação incremental (2026-10-12)

**SIMULAÇÃO.** Todas as decisões abaixo são marcadas `SIMULAÇÃO` nos manifestos, os lotes têm
`simulation: true`, e nada foi publicado. Os IDs foram escolhidos para exercitar o motor (inclusive um
item parcial e uma suspensão), **não** são a proposta do Lote 01
(`docs/superpowers/plans/2026-10-12-academy-lote-01-proposal.md`).

Base: branch `feat/academy-incremental-release-engine-v01`, commit do motor `dc7ae7f` (código da simulação
idêntico ao do PR). Ambiente: Node 22.22.0, Astro 7.3.6, Chromium (Playwright 1.56.1). Os hosts externos
não são acessíveis neste ambiente: a QA verifica o `dist/` (destinos, âncoras, links), não as fontes.

## Cenários

`simulate.py <worktree> <cenário>` grava os manifestos (digests calculados por
`tools/academy-release.ts`), registra-os em `src/lib/release/lots.ts`, escreve `release.json` em modo
`simulation`, ativa Fundamental e Pré-Militar e atualiza os espelhos de `verify-dist`.

| Cenário | Lotes registrados | Lotes aplicados | Publicados |
|---|---|---|---|
| Produção (esta branch) | — | — | 37 |
| `A` | L001 | L001: `google-mlcc`, `mit-1801sc`, `ef-obmep-fracoes-6`, `ita-provas-anteriores` aprovados; `pm-esa-provas-2026` **held** | 41 |
| `AB` | L001, L002 | L001 + L002: `odin-foundations`, `ef-sme-alfabeto-1`, `pm-afa-provas` aprovados; **suspensão** de `google-mlcc` | 43 |
| `A-pending-B` (rollback de B) | L001, L002 | L001 | 41 |

## Resultados medidos

| Verificação | Resultado |
|---|---|
| Build de produção (sem lotes) vs. build anterior ao motor (`f5896d7`) | `diff -r dist`: **idênticos byte a byte** |
| Build + `verify-dist` (`ACADEMY_RELEASE_SIMULATION=1`), A / AB / A-pending-B | 3/3 passam: 24 páginas, 0 em preparação |
| `verify-dist` do `dist/` simulado **sem** a variável | falha: `mode simulation: a simulated release is never published` |
| `dist/` de `A-pending-B` vs. `A` | **idênticos byte a byte** (lote registrado e não aplicado não publica; rollback reproduz o estado anterior) |
| Cumulativo: os 4 de A e os 37 da V0.4 em AB | presentes, exceto o suspenso; `verify-dist` confere inventário = recursos no `dist/` |
| `google-mlcc` suspenso em AB | 0 arquivos do `dist/` contêm o ID (páginas, busca, âncoras, dados) |
| `pm-esa-provas-2026` (held) | 0 arquivos em A e AB |
| Fundamental e Pré-Militar ativos em AB | sem `noindex`, no sitemap, recursos na própria página, **sem seção Destaques**, sem texto de preparação |
| QA Playwright (`qa.mjs`), 360 e 1280 px, todas as páginas do sitemap | A: 236 verificações, 0 falhas; AB: 252 verificações, 0 falhas (`qa-A.json`, `qa-AB.json`) |
| Detalhe da QA | HTTP 200, uma `h1`, sem rolagem horizontal, indexável; em cada recurso de Fundamental/Pré-Militar: visível, **um** link externo, igual à URL do registro, `target=_blank` com `noopener noreferrer`; âncora `#recurso-<id>` leva ao recurso; busca contém os publicados e não o suspenso; nenhuma requisição externa; nenhum erro de página |
| Testes da branch dentro do worktree AB | 252 passam, 32 falham: todas guardas de "estado de hoje" (`guards-AB.txt`); `tests/release-candidate/` e as suítes de motor/caminhos passam |

Na primeira medição da âncora, 2 verificações falharam porque a medição foi feita antes do fim da rolagem
suave (`scroll-behavior: smooth`): o recurso estava a 934 px no instante 0 e assentou a 96 px do topo após
400 ms. A QA passou a esperar a rolagem estabilizar; não houve mudança no site.

## Revisão Codex (PR #43) e nova medição

Após as correções da revisão (`6d3ba3e`: host preso à instituição, observação aprovada = nota do registro,
aprovações de lotes registrados conferidas contra o registro, ID suspenso após o prefixo `recurso-`), os
três cenários foram reconstruídos: build + `verify-dist` passam em A, AB e A-pending-B, e A continua
idêntico byte a byte a A-pending-B. A referência obsoleta `"/tecnologia/#recurso-google-mlcc"` num arquivo
de dados do `dist/` de AB passava no `verify-dist` anterior e agora falha
(`the suspended resource google-mlcc is still in dist`); o `dist/` de AB limpo continua passando.

Segunda revisão Codex (`878e669`: arrays com buracos recusados, suspensão por ferramenta recusada,
confiança de host só de registro inalterado, retorno de `held`/suspenso só com evidência posterior,
ferramenta operando com build vermelho): os três cenários foram reconstruídos de novo, build +
`verify-dist` passam, A idêntico a A-pending-B, `google-mlcc` e `pm-esa-provas-2026` em 0 arquivos do
`dist/` de AB. Num worktree com o título de `cs50x` alterado, `tools/academy-release.ts digest cs50x`
devolve o novo digest, `status` relata o problema do build e o build falha
(`cs50x: changed since it was published`).

Terceira revisão Codex (`82ae951`: `ledger` de lotes já aplicados em `release.json`, decisões `verified` e
`held` só por pessoas, data de retirada limpa só por aprovação, QA com código de saída): os três cenários
reconstruídos passam (o cenário A-pending-B agora registra B no `ledger`, como um rollback real), A segue
idêntico a A-pending-B, e a QA Playwright passou de novo (A: 236, AB: 252 verificações, 0 falhas, saída 0).
A mesma QA com uma expectativa deliberadamente errada sai com código 1.

## Guardas de estado (AB)

As 32 falhas em `guards-AB.txt` são testes que fixam o estado atual (nenhum lote aplicado, 37 publicados,
Fundamental e Pré-Militar em preparação, contagens e listas). Três delas são novas desta branch
(`production today…`, `14. the repository release applies nothing…`, `this PR applies no lot…`). Um PR de
lote real as atualiza uma a uma, com o motivo; nenhuma é pulada.

`docs/superpowers/qa/2026-10-12-v04-evidence/rc-apply.py` (promoção direta de staging para o catálogo)
deixou de funcionar **por desenho**. Medido: o script aplica, e o build falha primeiro por importação
duplicada (`STAGED_RESOURCES` já importado pelo motor); retirada essa linha, o motor recusa com 74
problemas (37 `two records with this id` e 37 publicados `without a baseline digest or an approval`). A
promoção passa a ser só por lote.

## Reproduzir

```bash
git worktree add /tmp/sim-AB HEAD && ln -s "$PWD/node_modules" /tmp/sim-AB/node_modules
python3 docs/superpowers/qa/2026-10-12-incremental-release/simulate.py /tmp/sim-AB AB
(cd /tmp/sim-AB && ACADEMY_RELEASE_SIMULATION=1 npm run build)
(cd /tmp/sim-AB/dist && python3 -m http.server 4401 --bind 127.0.0.1 &)
cp docs/superpowers/qa/2026-10-12-incremental-release/{qa.mjs,records.json,expected.json} /tmp/
node /tmp/qa.mjs http://127.0.0.1:4401 /tmp/sim-AB/dist AB /tmp
```
