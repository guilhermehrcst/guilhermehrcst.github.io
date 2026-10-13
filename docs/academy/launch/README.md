# Lançamento da Academy: Lote 01 preparado e ensaiado

> **Estado atual (12/10/2026, 23h40 BRT):** este README preserva os ensaios históricos da V0.4
> (37 recursos antes do L001). A `main` publica **43 recursos**, com **L001-plano-b** aplicado.
> O manifesto `L002-ita-pre-militar` está registrado com aprovação **editorial** individual,
> mas `authorization: null`. Os PRs [#55](https://github.com/guilhermehrcst/guilhermehrcst.github.io/pull/55)
> e [#56](https://github.com/guilhermehrcst/guilhermehrcst.github.io/pull/56) continuam em draft;
> o [#57](https://github.com/guilhermehrcst/guilhermehrcst.github.io/pull/57) já foi integrado **somente**
> na branch do #56. Pré-Militar e Fundamental continuam `preparing`. Não houve autorização
> de ativação, aplicação do L002, merge na `main` nem deploy.
>
> **Não use `rehearse.sh plan-a|plan-b` como ensaio do L002.** Ele reproduz a etapa histórica
> que partia de 37 recursos. O ensaio de projeção 43 → 44 do ITA está em
> `tests/incremental-release/l002-ita-only-preflight.test.ts` e o patch inerte em
> `docs/academy/launch/l002-ita-activation.patch`. Eles não liberam a publicação.
>
> **Fluxo futuro, somente após autorizações distintas:** registrar `authorization.by/on` no manifesto
> L002 pendente (preservando o conteúdo editorial exato); aplicar em uma branch de release
> o patch de ativação; executar `tools/academy-release.ts check` e `apply` com o manifesto
> já registrado; atualizar os testes que fixam a identidade 43 e rodar QA/CI.
> O comando `apply` aceita esse manifesto **somente** se ainda não estiver no ledger,
> tiver autorização válida e for idêntico ao arquivo registrado; ele não altera o manifesto
> nem dispara deploy. Merge para `main` e deploy exigem autorização posterior.

**Estado:** engenharia pronta, **nenhuma decisão editorial e nenhuma publicação**. O catálogo público continua
com os 37 recursos da V0.4 (`release.json`: `production`, `applied: []`, `ledger: []`). Tudo aqui foi
medido em cópias descartáveis com lotes marcados `SIMULAÇÃO`.

## O que está pronto

| Peça | Para quê |
|---|---|
| `tools/academy-release.ts draft/check/apply/rollback` | Gera o esqueleto do manifesto, mostra o que um lote preenchido publicaria (hosts novos, recursos sem página), aplica um lote autorizado (manifesto, `lots.ts`, `release.json` com inventário da projeção) e desfaz o último lote aplicado mantendo o `ledger`. Cada escrita é verificada num processo novo, como no build; se algo falha, todos os arquivos voltam ao estado anterior. |
| `plans.json` | Os IDs exatos de cada plano. |
| `plan-b.patch` | Plano B (6 recursos em caminhos ativos, 37 → 43): guardas de estado e espelhos de `verify-dist` (4 hosts, trilha Computação em Nuvem, Ensino Superior como objetivo de Matemática). |
| `plan-a.patch` | Plano A (9 recursos, 37 → 46) **com** a ativação de Fundamental e Pré-Militar em `taxonomy.ts` e todos os espelhos dessa ativação; inclui o conteúdo do Plano B. |
| `rehearse.sh plan-b\|plan-a [workdir]` | Ensaio reprodutível (o workdir, absoluto, não pode existir: o script nunca apaga nem reaproveita um diretório): aplica o patch e um lote `SIMULAÇÃO` pela ferramenta e roda testes, `astro check`, build e `verify-dist`. Só passa se os únicos testes divergentes forem os 3 que fixam a identidade da release. |
| `qa.mjs` | QA de navegador do `dist/` ensaiado. |

## Medições (12/10/2026, commit desta branch)

| Verificação | Plano B | Plano A |
|---|---|---|
| Publicados | 43 | 46 |
| Testes | 316 passam; só os 3 pinos de identidade divergem | idem |
| `astro check`, build, `verify-dist` | passam (22 páginas, 2 em preparação) | passam (24 páginas, 0 em preparação) |
| QA de navegador, 360 e 1280 px (`qa-plan-*.json`) | 246 verificações, 0 falhas | 295 verificações, 0 falhas |
| Rollback (patch revertido + `rollback`) | `dist/` idêntico byte a byte ao de produção | idem |
| Acessibilidade (axe-core 4.10.2, regras WCAG 2.1 A/AA, todas as páginas, 360 e 1280 px, após a animação e com movimento reduzido) | 0 violações | 0 violações |
| Negativos | Plano B com `ita-provas-anteriores` a mais: recusado (`placement: … has no page`), nada escrito. QA do Plano A contra o build do Plano B: 9 falhas, saída 1. | |

Efeitos visíveis medidos (Plano B): Vestibular 20 → 22, ENEM 13 → 14, Ensino Superior 6 → 8 com o grupo
**Psicologia**, Tecnologia 17 → 19 com a trilha **Computação em Nuvem** (8 trilhas), Odin em Desenvolvimento
Web; a nota do ENEM passa a apontar para o recurso do INEP na própria página; a linha do MIT na Home passa
a abrir a busca filtrada (MIT em Tecnologia e Matemática); o resumo de Ensino Superior passa a ser
"Materiais gratuitos de nível superior em Matemática, Computação e Psicologia." No Plano A, Fundamental
(2 recursos) e Pré-Militar (1) ficam indexáveis, no sitemap e sem seção de destaques.

## Sequência para lançar (depois das decisões humanas)

1. **Decisões por recurso** (pessoa identificada, data, evidência própria): `approved` ou `held` por ID, na
   matriz `docs/superpowers/plans/2026-10-12-academy-launch-editorial-checkpoint.md`.
2. **Decisão de ativação** de Fundamental e Pré-Militar, à parte. Sem ela, só o Plano B.
3. Preencher o manifesto: `node --experimental-strip-types tools/academy-release.ts draft L001-<nome> <ids aprovados e retidos>`;
   a pessoa preenche `decision`, `decidedBy`, `decidedOn`, `evidence.version`, `title`, `createdOn`.
4. **Autorização do lote exato** (`authorization.by/on`), por pessoa, em ato separado.
5. `tools/academy-release.ts check <arquivo>`: zero `problems`; hosts novos e recursos sem página conferidos.
6. Numa branch a partir do staging: `git apply docs/academy/launch/plan-<a|b>.patch`, depois
   `tools/academy-release.ts apply <arquivo>`. Atualizar os 3 pinos de identidade
   (`tests/incremental-release/repository.test.ts`, e os dois de `engine.test.ts`: "production today" e "14.")
   com o nome e o inventário reais.
7. Se o conjunto aprovado for diferente do plano, rodar o ensaio com os IDs aprovados e ajustar as guardas
   uma a uma, com o motivo (o patch é o ponto de partida, não um atalho).
8. `npm test`, `npx astro check`, `npm run build`, `node docs/academy/launch/qa.mjs …` no `dist/`; PR, CI,
   revisão; merge e deploy só com autorização expressa.

**Rollback:** reverter as guardas/ativação do plano e `tools/academy-release.ts rollback L001-<nome>` no
mesmo PR (o manifesto e o pino no `ledger` ficam; o histórico nunca é reescrito).

## Reproduzir

```bash
docs/academy/launch/rehearse.sh plan-a /tmp/ensaio-a
(cd /tmp/ensaio-a/dist && python3 -m http.server 4702 --bind 127.0.0.1 &)
PLAYWRIGHT=/caminho/para/playwright/index.mjs node docs/academy/launch/qa.mjs http://127.0.0.1:4702 /tmp/ensaio-a plan-a .
```

Medido antes da animação de entrada terminar, o axe acusa contraste baixo em `.eyebrow`/`.lead` também na
produção atual; com a página assentada (1,5 s) ou com movimento reduzido, 0 violações: é a opacidade da
transição, não a cor. Limites: os hosts externos não abrem neste ambiente; a QA verifica o `dist/` (destinos, âncoras, links,
busca, largura), não as fontes. Chromium apenas.
