# Home V2: decisões e evidências (2026-10-14)

Base: `origin/main` 7174510, mais a Home V1 (PR #66, ainda não mergeada). A V2 parte da V1 e a substitui.

## Análise das referências visuais (rodada de fidelidade)

As quatro imagens enviadas foram abertas e analisadas uma a uma antes de qualquer código. A rodada anterior seguia só os princípios do brief e a influência delas não era perceptível; esta rodada aplica decisões concretas de cada uma.

| Referência | Decisões identificadas | Onde entram na Home | Adaptação à Pexis |
| --- | --- | --- | --- |
| **McGill** | Uma fotografia grande de cantos retos ao lado do texto. Título em serif que termina numa linha em sans bold. Link grande em vermelho com sublinhado grosso como chamada. Círculo vermelho sólido sobre a foto. | **Hero.** "Aprenda" em Newsreader e "com direção." em Google Sans Flex bold (o h1 continua com o texto exato do lema). Foto única do curso CS50x. "Escolher meu caminho" é um link vinho grande com sublinhado de 3px. Disco vinho com o símbolo da Pexis sobre a borda da foto. | Sem botão de play, porque o Hero não tem vídeo. A legenda nomeia o curso e a instituição, sem sugerir parceria. A busca continua. |
| **LabAcademy** | Cards largos e coloridos, com cantos de ~32px. Imagem em recorte com canto chanfrado no alto à direita. Disco branco com ↗ no canto oposto. Pílula com contorno sobre o título. O card do meio vem invertido (texto em cima, imagem embaixo). | **Escolha seu caminho.** Os seis caminhos em cards paisagem, com tons sálvia, pêssego, azul-claro, creme, rosa e areia. Ilustração em painel chanfrado (`clip-path`). Disco ↗. Pílula com a contagem real ou "Em preparação". O card do meio de cada fileira vem invertido. | Ilustrações originais (`PathArt`) no lugar de fotos. Todos os caminhos ficam visíveis, sem carrossel. |
| **ART Course** | Cards imersivos com a imagem ocupando tudo e o título de display sobreposto em branco. Fileira horizontal com ritmo escalonado. "Show all" como pílula vermelha à direita do título. Avatares e uma pílula escura no rodapé do card. | **Cursos em destaque.** `HomeCourseFeature`: a foto do curso sob véu escuro, ou um fundo vinho ou grafite com os glifos da área. O rótulo do curso em serif grande, depois título oficial, instituição e fatos. Rodapé com o avatar da instituição e a duração verificada. Fileira escalonada no desktop e rolagem horizontal no celular e no tablet. "Explorar todos os cursos" à direita. | Nada de progresso, ouvintes, matrículas ou avaliações; o verify-dist rejeita essas métricas. Gráficos que já têm letreiro próprio nunca recebem texto por cima. |
| **Prolingo** | Cards verticais. Painel de vidro fosco na base, com título forte e texto. Rotação alternada leve. | **Áreas.** Cards em retrato (5:6) com campo de glifos da área (π √ Σ, Aa ¶, H₂O λ…), painel fosco com o nome em sans bold e as matérias como links, e rotação de ±1,5° que zera no hover e no foco. | Os glifos são conteúdo gerado por CSS: decoração pura, fora do texto da página e da árvore de acessibilidade. |

Comparações lado a lado (referência × seção em 1440px): ficam fora do repositório, porque as referências são imagens de terceiros. Foram anexadas ao relatório da sessão.

## Decisões

| Tema | Decisão | Por quê |
| --- | --- | --- |
| Fotografias | **Nenhuma fotografia nova.** | A política de rede do ambiente negou `images.unsplash.com` e `unsplash.com`. O espelho S3 só serve a versão de 400px. Usamos a alternativa prevista no brief: composição gráfica original com recursos existentes. |
| Cursos do Hero e dos destaques | Hero: CS50x (fotografia). Destaques: CS50P, Redação para ENEM, Single Variable Calculus e CS50 AI. As duas listas nunca compartilham curso (testado). | Duas fotos reais e duas capas tipográficas, cobrindo Tecnologia, Vestibular e Ensino Superior. |
| Trilhas | ENEM, UERJ e "Começar a programar", com 3 etapas num trilho e "e mais N etapas". | Mais compacto. Nenhuma etapa é inventada. |
| Fontes | `#fontes` volta como seção própria (a âncora existia na main), com as marcas oficiais já no repositório. | A ordem pedida é instituições, depois compromisso. |
| Compromisso | Três compromissos, a data vinda de `VERIFIED_ON` e o link /sobre/. O texto agora diz que certificados, quando existem, são de quem publica e podem ser pagos. | Item 9 do brief. |

## Invariantes novos ou corrigidos (`scripts/verify-dist.mjs`, `tests/`)

- Ordem fechada das seções: `objetivo, cursos, trilhas, areas, fontes, curadoria, perguntas`.
- Instituições em `#fontes`, cada uma com um único link interno.
- `#objetivo`: seis ilustrações decorativas (`aria-hidden`, `focusable="false"`).
- Nenhuma métrica que a Academy não tem: ouvintes, inscritos, matrículas, visualizações, avaliações, aulas concluídas ou percentuais.
- Cards com foto têm fundo grafite por baixo, para o texto branco continuar legível se a imagem não carregar (achado do axe).
- O Hero mostra uma fotografia, e o Hero e os destaques não compartilham curso (`home-featured.ts`). As duas partes do título formam exatamente o lema.
- `PathArt` não carrega nem linka nada externo (sem `<image>`, `href` ou `url()`).
- **Bug pré-existente corrigido:** o regex de alegações não pegava "patrocínio", por causa do acento. Agora usa `patroc[ií]n`.
- Contraste medido de `--ink`, `--muted` e `--action` sobre as seis superfícies novas.

## Evidências

- `npm test`: 409/409. `npm run check`: 0 erros e 0 avisos. `npm run build`: verde (verify-dist, rebase e project-base).
- 11 mutações negativas no HTML construído, todas pegas pelo verify-dist.
- QA no navegador em 390, 834, 1194 e 1440:
  - sem overflow horizontal;
  - 0 erros de console e 0 requisições externas;
  - axe (wcag2a/aa, 21aa, best-practice) sem violações;
  - placeholder inteiro no campo;
  - Enter leva a `/buscar/?q=python` (6 resultados);
  - sem JavaScript, leva a `/buscar/?q=enem`;
  - 38 links internos com 200.
- Regressão: só a Home muda no HTML (/materias/ difere apenas no agrupamento do CSS). 11 páginas comparadas pixel a pixel com a main em 390, 834 e 1280, idênticas.
- Altura da página inteira (antes = main publicada, depois = V2):

| Largura | Antes | Depois |
| --- | --- | --- |
| 390 | 11185 | 8725 |
| 834 | 9477 | 8756 |
| 1194 | 6464 | 5916 |
| 1440 | 6343 | 5851 |

Capturas: `antes-*.jpg` e `depois-*.jpg` nesta pasta (as de página inteira estão em meia resolução).

## Não comprovado / pendente

- Fotografias reais nos cards de caminhos e no Hero. Para isso, o domínio `images.unsplash.com` (ou outra fonte licenciada) precisa ser liberado no ambiente. Cada foto deve ter registro de autor, licença e hash.
- Leitores de tela reais (VoiceOver e TalkBack) não foram testados; só axe e inspeção da árvore.
