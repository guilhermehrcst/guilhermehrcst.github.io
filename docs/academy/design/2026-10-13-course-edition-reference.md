# Pexis Academy | Redesign editorial das páginas de cursos

**Referência:** gravação de 13/10/2026 enviada pelo responsável, mostrando o padrão visual da página "Explorar" do GitHub Universe '26. O vídeo fundamenta as decisões de composição; o projeto não reutiliza fotos, logos, textos, ícones próprios ou identidade do GitHub.

## Elementos traduzidos da referência

- Fundo claro neutro com réguas finas e alto contraste.
- Cabeçalho horizontal leve, preservando a marca oficial Pexis Academy.
- Hero amplo: título sans-serif de escala editorial com barra inclinada ("/") e lead curto em coluna adjacente. Layout empilhado no celular.
- Seções em grade divididas por linhas, títulos amplos com a barra, descrições compactas e navegação real por âncoras.
- Recursos verdadeiramente publicados em cards: painel visual autoral com o ícone oficial da Academy, autoria/instituição, nome exato do recurso, formato, informações comprovadas de acesso e um único link externo com CTA vermelho Pexis.
- Grid de uma coluna em telefones pequenos, duas em tablets e três em telas amplas; acessibilidade com alvo mínimo de 44 px, navegação por teclado e redução de movimento.
- Fechamento editorial com nome PEXIS ACADEMY em fonte grande. Não copia marca GitHub Universe.

## Implementação

`Base.courseEdition` permite opt-in somente nas páginas educacionais: Ensino Fundamental, Médio, Vestibular, Pré-Militar, Superior, Tecnologia, índice de Matérias, matérias individuais, ENEM e UERJ. A Home, busca e Sobre continuam com sua apresentação atual.

`ResourceItem` ganha painel visual decorativo desenhado por CSS e formado pela identificação verdadeira do provedor, sem fotos fabricadas e sem depender de imagens externas. Todas as URLs, tags semânticas, formatos editoriais e âncoras de busca continuam governados pelos modelos atuais.

A identidade usa o vermelho institucional `#720111`, sem importar a cor verde da referência. Todos os tokens visuais adicionais ficam apenas em `src/styles/global.css`, seguindo os contratos de contraste do repositório.

**Não envolve publicação de material L003:** os 20 candidatos permanecem em revisão e os 44 recursos públicos de L001/L002 não são alterados. A interface é modificada apenas na branch de PR #60.

## Critérios para aprovar visualmente

- CI: testes completos, `astro check` e `verify-dist` verdes.
- Conferir em navegador real 390, 768 e 1280 px: nenhum overflow, âncoras, responsividade e foco visível.
- Confirmar apresentação do cartão de ITA com apenas sua prova anterior oficial e nenhuma playlist ainda não aprovada.
- Revisão humana da equivalência visual à gravação antes do merge na `main`.
