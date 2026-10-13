# Pexis Academy | L002 ITA: checklist de produção

**Data da autorização:** 13/10/2026, horário de Brasília.
**Escopo:** apenas `ita-provas-anteriores`, `past-exam`, e ativação de `/pre-militar/`.
**Fluxo:** PR #59 para `main`, GitHub Pages por `.github/workflows/deploy.yml`.
**Fonte da autorização:** orientação humana em conversa de 13/10/2026: “Vms avançando até chegar na publicação do site”. Isto é uma autorização distinta do lote e da ativação, condicionada a revisão e testes.

## Evidência técnica pré-publicação

- A release candidata isolada (HEAD `89a57603fc9f59b4e44e8effe7fccff91de1144b`) obteve [CI verde, execução 38340472924](https://github.com/guilhermehrcst/guilhermehrcst.github.io/actions/runs/38340472924): **345 testes**, 0 falhas, zero erros/avisos/dicas de tipo, build e `verify-dist` aprovados.
- `verify-dist` verificou 23 rotas indexáveis, uma em preparação, sete redirecionamentos, página 404 e 86 arquivos de saída.
- A página ativa do frontend foi verificada anteriormente, em worktree descartável, nas larguras **360, 390, 768 e 1280 px** com **38 verificações e zero falhas**. Evidência no [PR #57](https://github.com/guilhermehrcst/guilhermehrcst.github.io/pull/57#issuecomment-6136908830). Quatro capturas em `docs/superpowers/qa/2026-10-13-pre-militar-frontend/`; essas capturas são evidência da interface no ensaio, não de um deploy público.
- Fonte ITA verificada: [acervo oficial](https://vestibular.ita.br/provas.htm), amostra correspondente de prova/gabarito da primeira fase de 2025, detalhes em `ita-2025-source-qa.md`.
- Material é **arquivo de provas antigas**, não curso; não afirmar requisitos, cronogramas ou dados do edital vigente.
- PDF em **390px**, zoom por gestos e **leitor de tela real** permanecem não verificados. Não declarar conformidade WCAG para os PDFs externos.

## Gates antes do merge e deploy

- [ ] O HEAD do PR final contra `main` mantém os 43 recursos anteriores e adiciona **somente** `ita-provas-anteriores`, sem Fundamental.
- [ ] O digest de `L002-ita-pre-militar` e os pins de `release.json` coincidem exatamente; L001 intacto; nenhum registro adicional foi aprovado.
- [ ] `/pre-militar/` `active`, `/ensino-fundamental/` `preparing`; destaques ainda `staging`.
- [ ] CI final com `npm test`, `astro check`, `npm run build` e `verify-dist` totalmente verde.
- [ ] Revisão de PR não encontra bloqueio crítico (incluindo revisão Codex quando disponível).
- [ ] Merge com `expected_head_sha` para evitar integrar um HEAD que mudou.

## Gates após deploy (verificar na produção)

- [ ] Workflow `Build and deploy` de push à `main` termina com build e deploy `success`.
- [ ] `https://guilhermehrcst.github.io/pre-militar/`: conteúdo ITA visível, rota canônica, sem `noindex`.
- [ ] Link `#recurso-ita-provas-anteriores` presente e busca por ITA aponta para essa âncora.
- [ ] `/ensino-fundamental/` permanece `noindex` e sem recursos publicados.
- [ ] `sitemap-index.xml` (ou `sitemap.xml`, conforme o site gera) inclui `/pre-militar/`.
- [ ] Verificar funcionamento em dispositivo móvel e desktop, caso navegador de QA esteja disponível.

## Reversão segura

Se build/deploy falhar, **não declarar a publicação concluída**. Se a `main` tiver sido alterada e a release se mostrar incorreta, criar um **revert integral do merge do PR #59** por novo PR (preservando histórico), executar CI e implantar a `main` revertida; isso restaura o estado L001 com 43 recursos. Não editar isoladamente o manifesto pinado, o ledger ou a categoria; a mudança foi concebida para ser atômica. Registrar o incidente e o SHA revertido.
