# Manifestos de lote

Um arquivo `L000-nome.json` por lote, imutável depois de aplicado. Cada lote é um registro de decisões
humanas (verificação, aprovação, retenção, suspensão) e, quando houver, da autorização para publicá-lo.
Um manifesto aqui **não publica nada**: só `../release.json` aplica um lote ao catálogo público.

Formato, regras e passo a passo: `docs/academy/operacao-publicacao-incremental.md`.
Cada arquivo novo também entra em `src/lib/release/lots.ts`; o teste
`tests/incremental-release/repository.test.ts` mantém a lista e os arquivos iguais.
