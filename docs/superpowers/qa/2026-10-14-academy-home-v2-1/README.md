# Home V2.1: refinamento de precisão (2026-10-14)

Base: `origin/main` 5a9190c (Home V2 mergeada no #67). Não é um redesign: a direção criativa e a estrutura da V2 foram preservadas. Só as páginas da Home mudam.

## Diagnóstico inicial (inspeção das capturas da main, 5 viewports, por seção)

| Seção | Problema observado | Causa |
| --- | --- | --- |
| Hero | Foto cortada em quadrado: faixa de teto escuro, palco comprimido | `aspect-ratio: 1` sobre uma foto 3:2 |
| Hero | Disco vinho de 104px no meio da borda da foto, competindo com o palco e lendo como botão | Tamanho e posição do disco |
| Hero | Legenda de duas linhas, como um segundo parágrafo | Título completo do curso na legenda |
| Hero | "Escolher meu caminho" (24px) competindo com o botão (17px) | Escala do link secundário |
| Hero | Foto sem prioridade na composição | Grade 50/50 |
| Caminhos | Estado acima do nome, invertendo a hierarquia pedida | Ordem do markup |
| Caminhos | Hover instável | Deslocamento de 3px e zoom de 5% |
| Cursos | Dois cards escuros seguidos (grafite e vinho) | Capas sem foto pintadas com tinta escura |
| Cursos | Rótulo em serif grande competindo com o título real; 6 linhas de metadados | Hierarquia tipográfica dos cards |
| Cursos | Faixas vazias | Escalonamento de 56px |
| Cursos | Carrossel sem pista visível no celular | Nenhum indicador de rolagem |
| Trilhas | Aspecto documental | Linha vertical em toda a altura da lista |
| Trilhas | "e mais 1 etapa" solto; inícios das listas desalinhados entre os cards | Cabeçalhos de alturas diferentes |
| Áreas | Glifos de 48px dominando o nome (20px) | Escala da decoração |
| Áreas | Cards altos demais (5:6 em três colunas) | Proporção fixa do card |
| Fontes | Marcas pequenas | 6 células de ~190px; marcas a 66% |
| Compromissos | Linhas vinho de 2px competindo com os títulos; selo da data pesado | Peso das divisórias e do selo |
| FAQ | Coluna esquerda larga e vazia | Proporção da grade |
| Ritmo | 112px entre seções | Padding das seções somado; hairlines em todas as seções |
| Footer | Nenhum defeito observado | — |

## Alterações por componente

- **HomeHero:**
  - Grade 46/54 e título com `clamp(4.75rem, 1.5rem + 4.6vw, 5.5rem)` (88px em 1440, 82px em 1194, 90px no iPad retrato).
  - Serif 400 com −0,025em; sans 600 com −0,04em.
  - Busca com 60px de altura, botão de 48px, hover e foco visíveis.
  - Link secundário de 18px.
  - Foto 5:4 no desktop, 16:9 no iPad retrato e 4:3 no celular.
  - Selo de 56 a 64px dentro do canto da foto, com anel de papel.
  - Legenda de uma linha: "Foto do curso CS50x, Harvard University."
- **HomePaths:** ordem nome → descrição → estado; hover de 2px e zoom de 3%.
- **HomeCourseFeature:**
  - O título real em serif é o protagonista; o rótulo virou kicker pequeno.
  - Instituição com avatar e uma linha de fatos.
  - Duração (quando a fonte informa) em chip no canto.
  - Véu escuro só na parte inferior das fotos.
  - Cursos sem foto usam o fundo claro da área (mesmo tom do card da área) com glifos no tom profundo.
  - Escalonamento de 24px.
  - Pista "Deslize para ver os quatro cursos" abaixo de 1100px.
- **FeaturedPaths:**
  - Cabeçalho tingido com o objetivo e a descrição.
  - "Primeiros passos" com o primeiro passo marcado em vinho.
  - Linha curta só entre os marcadores.
  - Link no rodapé de cada card.
  - `subgrid`: cabeçalhos e listas alinhados entre os três cards.
- **HomeAreas:**
  - Glifos menores (26–36px, 72% de opacidade) e nome de 22px.
  - Cards quadrados em três colunas e 5:6 no tablet.
  - Rotação de ±0,6°.
  - Matérias sem quebra interna.
  - Pista "Deslize para ver as seis áreas" no celular.
- **OfficialSources:** três colunas por duas linhas a partir de 760px, marcas a 95% (72% nas conjuntas), células de 8rem.
- **index.astro:**
  - Compromissos com hairline e uma marca vinho curta, número em vinho e data discreta.
  - FAQ em grade 4/8: perguntas de 17px, estado aberto em vinho e foco visível.
  - Ritmo de cerca de 96, 72 e 56px.
  - Hairlines só antes de compromissos e perguntas.
- **area-signs.ts:** `AREA_TONE` virou a fonte única do tom de cada área (cards das áreas e capas dos cursos).
- **Footer:** inalterado. Nenhum defeito observado, e ele é compartilhado por todas as páginas.

Paleta, fontes e tokens globais inalterados. Catálogo e seleção editorial inalterados.

## Evidências

- `npm test`: 416/416. `npm run check`: 0 erros e 0 avisos. `npm run build`: verde (verify-dist, rebase e project-base).
- 13 mutações negativas no HTML construído, todas pegas pelo verify-dist.
- Navegador:
  - 390, 834, 1194 e 1440: sem overflow, 0 erros de console, 0 requisições externas, axe sem violações, placeholder inteiro, busca `?q=` funcionando (também sem JS), 38 links internos com 200.
  - 1920: sem overflow, axe limpo, 0 requisições externas.
  - Teclado: 50 paradas em `main`, todas com indicador visível. O campo de busca mostra o foco no formulário (`:focus-within`, borda vinho e anel).
  - `prefers-reduced-motion`: nada anima.
- Regressão: só `index.html` difere da main. 11 páginas ficaram idênticas pixel a pixel em 390, 834 e 1280.
- Altura da página (antes → depois): 1440 6275 → 6174 · 1920 6270 → 6171 · 1194 6308 → 6051 · 834 8394 → 8436 · 390 8480 → 8601.
  - No celular a página cresce: as pistas de rolagem e as descrições inteiras ocupam espaço.
- Comparações lado a lado nesta pasta: `comparacao-<seção>-1440.jpg`, `comparacao-dobra-<viewport>.jpg` e `comparacao-inteira-<viewport>.jpg`.
  - Na captura "antes" de áreas, o cabeçalho fixo aparece dentro do recorte. É um artefato da captura daquele momento, não da página; as capturas "depois" escondem o cabeçalho fixo nos recortes.

## Limitações

- Fotografias continuam limitadas às imagens do catálogo (o domínio de fotos externas segue bloqueado no ambiente).
- Leitores de tela reais (VoiceOver e TalkBack) não foram testados.
