# Home V2: decisões e evidências (2026-10-14)

Base: `origin/main` 7174510, mais a Home V1 (PR #66, ainda não mergeada). A V2 parte da V1 e a substitui.

## Decisões

| Tema | Decisão | Por quê |
| --- | --- | --- |
| Hero | Divisão editorial: lema em serif grande à esquerda, busca nativa (`/buscar/?q=`), ações "Explorar cursos" e "Escolher meu caminho"; à direita, um bento com a foto de um curso real (CS50x), a placa da marca e um segundo curso real (FGV). | Composição de universidade (referência McGill) feita só com o que a Academy já tem. Cada curso aparece com título e instituição, para que a foto nunca represente a instituição nem sugira parceria. |
| Fotografias | **Nenhuma fotografia nova.** | A política de rede do ambiente negou `images.unsplash.com` e `unsplash.com`. O espelho S3 só serve a versão de 400px, insuficiente. Pelo brief, aplicamos a alternativa prevista: composição gráfica original com recursos existentes. |
| Caminhos | Seis cards em cores suaves (sálvia, pêssego, azul-claro, creme, rosa, areia), cada um com uma ilustração geométrica original (`PathArt.astro`, SVG inline com cores por token). Painéis alternados acima e abaixo do texto (xadrez); no celular, a linha fica compacta. | Referências LabAcademy e Prolingo, sem copiar fotos nem layout. Contagens vêm do catálogo, e "Em preparação" é preservado. |
| Cursos em destaque | "Explore novas possibilidades.", em uma faixa de fundo areia, com os `CourseCard` da biblioteca (4 cursos reais) e o botão "Explorar todos os cursos". | Reaproveita a linguagem de /cursos/ sem criar uma segunda fonte. O Hero e os destaques nunca repetem curso (testado). |
| Trilhas | ENEM, UERJ e "Começar a programar", com 3 etapas visíveis em trilho e "e mais N etapas". | Mais compacto. Nenhuma etapa é inventada. |
| Áreas | Índice tipográfico (número, nome em serif, matérias como links), não cards. | Caminhos respondem "para quê"; áreas, "o quê". |
| Fontes | `#fontes` volta como seção própria (a âncora existia na main), com as marcas oficiais já no repositório. | A ordem pedida é instituições, depois compromisso. |
| Compromisso | Três compromissos, a data de verificação vinda de `VERIFIED_ON` e o link /sobre/. O texto agora diz que certificados, quando existem, são de quem publica e podem ser pagos. | Item 9 do brief. |

## Invariantes novos ou corrigidos (`scripts/verify-dist.mjs`, `tests/`)

- Ordem fechada das seções: `objetivo, cursos, trilhas, areas, fontes, curadoria, perguntas`.
- Instituições em `#fontes`, cada uma com um único link interno.
- `#objetivo`: seis ilustrações decorativas (`aria-hidden`, `focusable="false"`).
- O Hero e os destaques não compartilham curso, e o bloco grande do Hero é uma fotografia (`home-featured.ts`).
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
