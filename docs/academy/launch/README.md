# Pexis Academy | lançamento incremental e histórico de ensaios

> **L002 ITA (13/10/2026):** esta release publica **44 recursos** (43 anteriores + somente
> `ita-provas-anteriores`, um **acervo oficial de provas e gabaritos**, não um curso).
> Ativa apenas a rota `/pre-militar/`; Ensino Fundamental continua `preparing`,
> sem conteúdos pendentes promovidos. Os destaques continuam em `staging`.
> O manifesto L002 foi autorizado e pinado com digest verificável no release ledger.
>
> **Autorização de produção registrada em decisão humana separada:** em 13/10/2026,
> o proprietário orientou avançar **até a publicação do site**, restrita a este
> escopo. A decisão está em `l002-ita-only-plan.json` sob `publicationAuthorization:
> approved` e `publicationScope: main-and-github-pages-l002-ita-only`.
> A autorização não substitui CI aprovado, revisão de PR ou verificação real
> do deploy. O merge e a implantação efetiva são confirmados somente nos
> eventos do GitHub Actions e na página pública, não neste documento.
>
> **QA de release:** `345/345` testes, `astro check` com zero erros e `verify-dist`
> aprovado no HEAD da branch isolada `89a5760`. O QA anterior do frontend
> ativo, em ensaio isolado, contemplou 360, 390, 768 e 1280 px (38 verificações,
> zero falhas), com capturas em `docs/superpowers/qa/2026-10-13-pre-militar-frontend/`.
> O QA dos PDFs oficiais em leitor de tela real e gestos móveis permanece
> não verificado e não deve ser anunciado como acessível sem teste.
> Para liberação, evidências e reversão, veja
> `l002-production-checklist-2026-10-13.md`.
>
> **Histórico:** `rehearse.sh plan-a|plan-b` partia da V0.4 (37 recursos) e
> não é o ensaio do L002 atual. Os testes históricos estão isolados e
> não devem alterar a release autorizada 43 → 44.


**Registro histórico pré-L001:** naquele momento não havia decisões editoriais nem publicação incremental. O catálogo
continha os 37 recursos da V0.4 (`release.json`: `production`, `applied: []`, `ledger: []`). Tudo aqui foi
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
