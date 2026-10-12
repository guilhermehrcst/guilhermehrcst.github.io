# Pexis Academy | Operação da publicação incremental

Guia operacional do motor de publicação por lotes. Sem banco de dados e sem painel: tudo é arquivo tipado
ou JSON versionado no repositório, revisado em PR.

**Três decisões separadas, sempre humanas:**

1. **Aprovar um recurso** (por ID, URL exata e digest do registro completo) — no manifesto do lote.
2. **Autorizar a publicação de um lote exato** — no campo `authorization` do mesmo manifesto.
3. **Aplicar o lote** ao catálogo público — em `release.json`, num PR com merge e deploy autorizados.

Ativar um caminho (`PATH_STATUS`) e liberar destaques (`FEATURED_RELEASE`) são outras decisões, também
separadas. Merge, CI verde, relatório de pesquisa ou simulação **não** são autorização editorial.

## Peças

| Arquivo | Papel |
|---|---|
| `src/lib/learning-resources.ts` | Catálogo tipado (37 publicados + 3 retidos) e a projeção pública `publishedResources` |
| `src/lib/staging.ts`, `src/lib/staging-gateb.ts` | Registros candidatos tipados. Importá-los não publica nada |
| `src/data/academy-release/baseline.json` | Digest de cada um dos 37 da V0.4, como publicados (idênticos à `main` 5e4b086). Trava de integridade |
| `src/data/academy-release/lots/L000-nome.json` | Manifesto de lote: decisões humanas e, quando houver, autorização |
| `src/lib/release/lots.ts` | Lista dos manifestos (um import por arquivo); um teste a mantém igual aos arquivos |
| `src/data/academy-release/release.json` | `mode`, lotes aplicados, `ledger` de todo lote já aplicado (cada um preso ao seu digest) e inventário público declarado |
| `src/lib/release/engine.ts` | Estados, transições, validação fechada e projeção cumulativa |
| `src/lib/release/canonical.ts` | Serialização canônica e `digestOf` (SHA-256) |
| `scripts/verify-dist.mjs` | Verificador independente do `dist/`: inventário, suspensos ausentes, modo simulação recusado |
| `tools/academy-release.ts` | Ferramenta do operador: calcula digests e imprime esqueletos; nunca decide |

**Projeção pública** = 37 da V0.4 (cada um igual ao seu digest de base) + aprovados de lotes aplicados
(cada um igual ao digest, URL, instituição, formato e evidência aprovados) − suspensões de lotes aplicados.
Qualquer divergência, ou inventário diferente do declarado, **falha o build**.

**Estados:** `candidate → verified → approved → published`; `held` (retido, volta só por nova verificação);
`suspended` (sai de todas as superfícies públicas; volta só por nova verificação e aprovação). Uma
aprovação de `candidate`, `held` ou `suspended` carrega a própria verificação (o bloco `evidence`).

## 1. Como cadastrar um novo recurso?

Adicione o registro tipado completo em `src/lib/staging*.ts` (ou num novo módulo de candidatos importado
pelo `pool` de `learning-resources.ts`), com `verified.evidence` individual: URL de evidência no próprio
host, verificações feitas (`free`, `scope`, `language`, `format`, `path`; `registration` e `certificate`
quando afirmados), nota auditável e data. Cadastro e certificado desconhecidos ficam `unconfirmed` — a
interface não exibe alegação não confirmada. O registro nasce `candidate` e não aparece em lugar nenhum.

## 2. Como registrar evidência?

No próprio registro (`verified`), e no manifesto do lote, no bloco `evidence` da entrada:
`on` (data), `version` (identificador do registro de evidência, por exemplo o relatório de QA), `method`
(`official-page` ou `youtube-page`; nunca índice de busca), `url` e `observed` (o que foi visto, em frase
auditável). O manifesto exige que esses campos sejam iguais aos do registro. Extração automática de
conteúdo não é homologação em navegador: diga exatamente o que foi demonstrado.

## 3. Como homologar?

Uma pessoa abre a URL exata num navegador comum e confere o contrato do formato (proposta §2): conteúdo
anunciado acessível e gratuito, instituição, título, formato, idioma, série/etapa quando houver,
cadastro e certificado só se comprovados. Se algo divergir, corrija o registro tipado **antes** de calcular
o digest. A homologação é registrada como entrada `decision: "verified"` (opcional) ou já como parte da
aprovação.

## 4. Como solicitar aprovação?

Gere o esqueleto de cada entrada:

```bash
node --experimental-strip-types tools/academy-release.ts entry <id>
```

Ele traz `id`, `url`, `digest`, `institution`, `format` e a evidência do registro; `decision`,
`decidedBy`, `decidedOn` e `evidence.version` vêm marcados `PREENCHER` e o schema recusa o manifesto
enquanto houver um. Monte `src/data/academy-release/lots/L00N-nome.json` (veja o modelo abaixo), com
`authorization: null`, registre o arquivo em `src/lib/release/lots.ts` e abra um PR pedindo a decisão.
Um lote registrado e não aplicado não publica nada (o build o valida e reporta `ifApplied`).

```json
{
  "schema": "pexis-academy-lot/1",
  "lot": "L001-nome",
  "title": "…",
  "createdOn": "AAAA-MM-DD",
  "simulation": false,
  "hosts": [{ "host": "example.gov.br", "institution": "Mesma string do provider" }],
  "entries": [ { "…": "saída de tools/academy-release.ts entry <id>, preenchida por uma pessoa" } ],
  "suspensions": [],
  "authorization": null
}
```

## 5. Como autorizar um lote?

A pessoa responsável preenche, por entrada, `decision: "approved"`, `decidedBy` (nome de uma pessoa;
nomes de ferramentas como Claude, Codex, GPT, "bot", "AI" ou "fixture" são recusados, em qualquer
caixa, acento ou largura de caractere, em toda decisão e na autorização) e `decidedOn`. Itens com pendência
ficam `decision: "held"` com `reason` — não travam os demais. Depois, a autorização de publicação do lote
exato: `"authorization": { "by": "…", "on": "AAAA-MM-DD" }`, com data não anterior às decisões. Cada host
novo entra em `hosts` com a instituição revisada.

## 6. Como simular?

Num worktree descartável, nunca na branch de produção:

```bash
git worktree add /tmp/sim HEAD && ln -s "$PWD/node_modules" /tmp/sim/node_modules
python3 docs/superpowers/qa/2026-10-12-incremental-release/simulate.py /tmp/sim AB
cd /tmp/sim && ACADEMY_RELEASE_SIMULATION=1 npm run build
```

Lotes simulados têm `simulation: true` e `decidedBy` começando por `SIMULAÇÃO` (lido sem caixa nem acento: `Simulação`, `simulacao`… também
marcam simulação, e por isso são recusados num lote real); o motor os recusa num
`release.json` em modo `production`, e o `verify-dist` recusa qualquer `release.json` em modo `simulation`
sem a variável `ACADEMY_RELEASE_SIMULATION=1`. Resultado da simulação desta branch:
`docs/superpowers/qa/2026-10-12-incremental-release/README.md`.

## 7. Como verificar?

```bash
npm ci && npm test && npx astro check && npm run build   # build inclui verify-dist
node --experimental-strip-types tools/academy-release.ts status
```

E QA no navegador do `dist/` (páginas do caminho, âncora `#recurso-<id>`, link externo único em nova aba
com `noopener noreferrer`, busca, 360 px sem rolagem horizontal). Os testes `tests/release-candidate/`
(contrato completo da V0.4: 74 registros, 60 destaques) continuam valendo; `tests/incremental-release/`
cobre lotes parciais.

## 8. Como publicar após autorização?

No PR do lote, e só com autorização expressa para o lote exato:

1. `lot-digest` do manifesto autorizado:
   `node --experimental-strip-types tools/academy-release.ts lot-digest src/data/academy-release/lots/L00N-nome.json`
2. `release.json`: acrescente `{ "lot": "L00N-nome", "digest": "…" }` ao fim de `applied` **e** ao fim de
   `ledger` (o registro de todo lote já aplicado, que só cresce, em ordem) e declare o novo `inventory`
   (ordenado). Esquecer um ID, ou declarar um que não sai, falha o build.
3. Espelhos escritos à mão em `scripts/verify-dist.mjs` (barreira independente): `COURSE_HOSTS` com os
   hosts novos; se um caminho for ativado, `CANONICAL`, `PREPARING`, `PATH_PAGES` e `OBJECTIVE_PATHS`; trilhas
   e áreas novas de Tecnologia/Superior quando surgirem.
4. Se a decisão incluir ativar Fundamental ou Pré-Militar: `PATH_STATUS` em `src/lib/taxonomy.ts`. O build
   recusa a ativação sem recurso publicado na própria página do caminho.
5. Atualize, uma a uma e com o motivo, as guardas de estado que falharem (lista medida na simulação:
   `docs/superpowers/qa/2026-10-12-incremental-release/guards-AB.txt`). Nunca pule nem apague uma guarda.
6. CI verde no commit final, revisão, merge e deploy autorizados.

### Mudar um recurso já publicado

Qualquer mudança num registro publicado (título, URL, cadastro, evidência…) deixa o build vermelho até a
reaprovação ser **aplicada no mesmo PR**: o motor não guarda a versão antiga para continuar publicando, e
publicar a versão nova sem aprovação aplicada seria publicar metadado não aprovado. Os dados dos
registros ficam em `src/lib/catalogue-records.ts` (e nos módulos de candidatos), lidos pela ferramenta sem
passar pela projeção: `tools/academy-release.ts digest|entry <id>` funciona com o build vermelho e dá o
digest que a reaprovação precisa. Um registro alterado deixa de valer como confiança de host da V0.4: o
lote revisa o host para a instituição. Manter a versão antiga publicada enquanto a nova aguarda aprovação
(snapshots versionados por digest) é deliberadamente fora deste motor e fica para um PR próprio.

## 9. Como suspender um recurso?

Num novo lote: `"suspensions": [{ "id": "…", "reason": "…", "decidedBy": "…", "decidedOn": "…" }]`,
autorização e aplicação como em 5 e 8; o inventário deixa de declarar o ID. A suspensão, como toda decisão,
nomeia uma pessoa (nomes de ferramentas são recusados). O recurso sai de páginas,
busca, âncoras, destaques e dados públicos; `verify-dist` falha se o ID sobrar em qualquer arquivo do
`dist/`. Se ele estiver numa seleção de destaques liberada, o build falha até a seleção ser corrigida.
O manifesto antigo **não** é editado: o histórico fica nos lotes. Para voltar, o recurso precisa de
verificação nova: evidência com data **estritamente posterior** à suspensão; a do mesmo dia não prova verificação nova (o mesmo vale para um item `held`).

## 10. Como fazer rollback?

- **Antes do deploy:** retire do fim de `applied` o último lote e volte o `inventory` ao anterior; o lote
  **fica no `ledger`** e o manifesto continua registrado e preso ao digest (decisão preservada, não
  publicada; editá-lo ou apagá-lo falha o build). Um lote revertido não volta a ser aplicado nem
  conta como pendente: para publicar de novo suas decisões, registre-as num lote novo. A simulação provou que o `dist/` volta byte a byte ao do
  lote anterior.
- **Depois do deploy:** reverta o commit do PR do lote (`git revert`) e faça novo deploy autorizado; ou,
  para tirar um único recurso, use uma suspensão (9), que deixa trilha.
- Nunca reescreva um manifesto já aplicado, mesmo depois do rollback: o build recusa (o digest preso no
  `ledger` de `release.json` não bate).

## Limites conhecidos

- O digest prova que o registro não mudou desde a aprovação; não prova que a página externa não mudou.
  Retestar links ao longo do tempo continua necessário.
- A imutabilidade dos manifestos é garantida contra edição isolada (digest preso) e contra remoção
  isolada (inventário e teste de registro). Uma edição coordenada de manifesto, `release.json` e
  inventário no mesmo PR só é detectada pela revisão humana do PR.
- A data do rodapé ("Recursos verificados em …") continua sendo `VERIFIED_ON` da V0.4; um lote com
  evidência de outra data não a altera (comportamento herdado, a decidir no PR do primeiro lote real).
