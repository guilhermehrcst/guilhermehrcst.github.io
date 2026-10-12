# Pexis Academy V0.4 — Plano de implementação verificável

**Base:** `main` atual, V0.3 já incorporada via PR #32; reconfirmar antes de trabalho.  
**Especificação:** `docs/superpowers/specs/2026-10-11-pexis-academy-v04-design.md`  
**Inventário inicial:** `docs/superpowers/research/2026-10-11-v04-60-candidates.csv`  
**Política:** desenvolvimento/QA locais. Sem push, PR, merge ou deploy sem autorização.

## M0: Pré-voo (somente leitura)

1. `git status --short --branch`, branch e HEAD; `git fetch` apenas se permitido; registrar `origin/main` real e working tree.
2. Garantir que a V0.3 está na main. Branch histórica `claude/pexis-academy-v01` não é base correta após squash do PR #32.
3. Ler spec V0.3, design system e PDF (ou a seção equivalente transcrita na nova spec), catalog, taxonomy, routes, search, pages e tests.
4. Rodar `npm test`, `npm run check`, `npm run build` antes de editar; registrar total de testes e falhas, se houver.
5. Se árvore suja, incompatibilidade de branch ou conflito, parar e relatar. Usar no máximo uma branch para V0.4, criada de `main` somente se necessária.

**Saída:** baseline completo, comandos, arquivos e plano de diffs.

## M1: Modelo de dados e correção de contagem (TDD)

1. Teste RED para Tecnologia não contar automaticamente como Ensino Médio.
2. Separar caminho, matéria e exame de forma compatível; respeitar conteúdo multi-matéria (provas completas).
3. Testar identidade, URLs, hosts, verificações e ausência de IDs inválidos/duplicados.
4. Introduzir seleções editoriais tipadas (dez destaques por caminho), inicialmente em estado staging seguro enquanto a pesquisa não terminou.
5. Garantir que os recursos legados e as sete trilhas não desapareceram.

**Saída:** esquema e seletores sem mudança visual massiva, testes GREEN.

## M2: Curadoria e homologação dos 60 candidatos

1. Para cada CSV, abrir URL oficial específica; verificar conteúdo integral gratuito, idioma, tipo real, requisitos de cadastro, certificado, nível adequado, atualização; registrar evidência/data/status.
2. Reutilizar IDs já existentes se o item for o mesmo; não duplicar registros da mesma oferta.
3. Para candidatos rejeitados, buscar substitutos confiáveis dentro da **mesma área**, sem preencher à força com aula aleatória.
4. Separar bancos de provas e materiais interdisciplinares do modelo de assunto único.
5. Expandir allowed hosts com teste independente. Candidatos sem evidência ficam retidos, não exibidos.

**Saída:** manifesto com 60 homologados únicos ou tabela de bloqueios explícitos; nenhuma alegação falsa.

## M3: Páginas por caminho

1. Fundamental: etapas 1º–5º/6º–9º, matérias, recursos adequados.
2. Médio: preservar o mapa curricular e o catálogo; introduzir dez destaques de forma editorial.
3. Vestibular: preservar ENEM/UERJ, adicionar materiais verificados de outras provas sem criar páginas artificiais.
4. Pré-Militar: estrutura por forças/exames, distinguir curso parcial de prova, sem inventar edital.
5. Superior: ampliar além de Matemática/Computação se dez homologados contemplarem outras áreas, sem alegação de graduação.
6. Tecnologia: preservar as sete trilhas e o catálogo, destacar dez sem truncar o acervo.

**Saída:** seis páginas funcionais, navegação interna e `noindex` correto para qualquer caminho ainda incompleto.

## M4: Busca, Home e navegação

1. Busca: indexar recurso com destino interno real/âncora; filtros úteis de caminho, matéria, formato, idioma e instituição; progressive enhancement.
2. Home: manter narrativa do PDF, atualizar estados/counts dinamicamente, CTAs, exemplos e acesso à busca.
3. Header/footer: manter vinho/logo e rotas atuais, atualizar apenas estados/hierarquia necessários; garantir tap/keyboard.
4. Revisar `/materias/`, `/sobre/`, `404`, breadcrumbs, legados e sitemap; não gerar páginas vazias.

**Saída:** UX integrada, sem JS adicional fora do necessário para busca.

## M5: QA, regressão e entrega para revisão

1. Executar testes, check, build/verify-dist; provar que as novas regras falham em fixtures adversariais.
2. Validar 60 destaque IDs, 10 por área, unicidade global, 0 URLs inválidas e destinos internos corretos.
3. Auditar visual em 320/360/390/768/1024/1440, no-JS, teclado, foco, contraste, CLS, rotas antigas.
4. Fazer comparação visual lado a lado com a referência da V0.3; guardar capturas e apontar diferenças justificadas.
5. Preparar relatório final por marco, arquivo, teste, recursos publicados/retidos e decisão de não publicar quando incompleto.
6. Pedir autorização **antes** de push, PR, merge e deploy.

## Gates de saída

- **Gate A — código:** baseline e testes verdes; sem alteração incidental de identidade.
- **Gate B — conteúdo:** 60 recursos únicos verificados e corretamente classificados; caso contrário, status "incompleto", mesmo com código pronto.
- **Gate C — UX:** nenhum caminho vazio declarado pronto; busca e navegação sem 404.
- **Gate D — release:** somente com autorização humana explícita e revisão do diff.

## Riscos controlados

- Fontes indisponíveis: manter status retido e documentar; não inventar links.
- Link genérico ou duplicado: não conta como recurso único sem destino correto.
- Quota editorial vs catálogo completo: não apagar ofertas existentes válidas.
- Provas multidisciplinares: não imputar matéria falsa.
- Direitos de terceiros: usar referência e navegação, não copiar materiais protegidos.
- Menores de idade: nenhuma coleta pessoal ou analytics comportamental.
- GitHub Pages: manter build estático, preservar redirects e método de deploy.
