# Pexis Academy | QA visual das páginas de cursos (13/10/2026)

## Origem da referência

Gravação enviada pelo usuário: `ScreenRecording_10-13-2026 17-16-24_1.mp4`, que mostra a página Explorar do GitHub Universe '26. A análise compara composição, tipografia, divisórias, cartões e layout responsivo. A Academy mantém marca, recursos, autores, textos e paleta próprios.

## Prévia examinada

- PR #60 na branch `editorial/academy-l003-pre-militar-20-v01`, commit `724e4456`.
- Build real de GitHub Actions: [38465491076](https://github.com/guilhermehrcst/guilhermehrcst.github.io/actions/runs/38465491076), status success, artefato `academy-pr-preview`.
- Os arquivos HTML, CSS, fontes e imagens do artefato foram carregados localmente em Chromium 144. O navegador bloqueou URLs locais, então o HTML/CSS reais do build foram usados com CSS/fontes/imagens incorporados em data URLs para capturas. Isso testa visualização e DOM, mas não rede, SSR, interação com provedores externos ou aparelho físico.

## Abrangência do QA

| Rota | Larguras |
| --- | --- |
| Pré-Militar | 390, 768, 834 e 1280px |
| Ensino Médio | 390 e 1280px |
| Vestibular | 768px |
| Tecnologia | 1280px |

Na prévia inspecionada, todas as oito combinações apresentaram:
- zero rolagem horizontal no documento;
- zero exceções JavaScript e zero imagens ausentes após carregamento;
- cartões em uma coluna (390px), duas colunas (tablet) ou três colunas (desktop grande) conforme a largura do conteúdo;
- links de recursos e âncoras existentes preservados, incluindo ITA.

Foram realizadas checagens adicionais no Chromium para o Pré-Militar a 390/768/834/1280px: menu móvel nativo aberto e fechado a 390px; navegação desktop visível de 768px em diante; CTA visual do card acionando o link genuíno `https://vestibular.ita.br/provas.htm`; foco via teclado com outline de 2px.

## Defeito real detectado e correção

O build inicial tinha cabeçalho e rodapé na cor vinho, com links escuros sobre o vinho e alguns links claros após tentativa de colocar o rodapé em cinza. Causa: estilos escopados de `SiteHeader.astro`, `SiteFooter.astro` e `PageIntro.astro` gerados depois de `global.css`, empatando/ganhando na especificidade.

A correção adiciona seletor de maior especificidade para o fundo claro do cabeçalho/rodapé, títulos e links legíveis em tinta escura, banda introdutória no mesmo tom, menu horizontal em 768/834px e divisão sutil entre opções. Na validação local da correção, o cabeçalho ficou `rgb(231, 236, 233)` em todas as oito combinações, sem overflow, imagens faltantes ou exceções; o rodapé apresentou links escuros e logo visível.

## Limitações e segurança editorial

- O vídeo e os screenshots de validação permanecem como evidência nesta conversa; as imagens de QA não são incorporadas ao repositório.
- O efeito em WebKit/Safari e a acessibilidade em leitores de tela reais não foram aferidos.
- Nenhum dos 20 recursos candidatos do L003 foi publicado. `main`, `release.json`, catálogo público de 44 recursos e autorizações permanecem inalterados.
- Após este ajuste, o CI e a prévia da branch precisam ser gerados novamente para garantir que o CSS compilado mantém as correções. O merge/deploy permanece bloqueado até revisão visual humana.

