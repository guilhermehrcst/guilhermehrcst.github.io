# Pexis Academy | Segunda rodada de 10 candidatos: pré-auditoria de fontes

**Data:** 12/10/2026. **Estado:** pesquisa técnica, sem homologação editorial.
**Esta NÃO é a criação nem a numeração de um lote de publicação L002.** A ordem real e o conteúdo de lotes só poderão ser decididos após aprovação do proprietário, com manifesto próprio.

## Contexto e limites

- Fonte de seleção: `GATEB_DRAFT_SELECTION` em `src/lib/gateb-selection-preview.ts`, na branch `feat/academy-gateb-typed-staging-v01` (`2d08ab8`).
- A seleção editorial tem 60 posições, incluindo **23 recursos já publicados** e **37 candidatos inéditos**.
- A primeira rodada tem **10 candidatos inéditos** documentados no [PR #44](https://github.com/guilhermehrcst/guilhermehrcst.github.io/pull/44). Esta rodada examina **outros 10**, sem duplicar os do PR #44.
- Produção permanece com 37 registros públicos da V0.4, `release.json` com `applied: []` e `ledger: []`; `main` não foi alterada.
- A evidência é automatizada, limitada. **Não representa o ato humano de abrir cada fonte, aprovar o conteúdo, autorizar a publicação, promover um recurso, ativar um caminho, liberar destaques ou certificar conformidade WCAG/LGPD.**

## Seis aulas SME Goiânia | Ensino Fundamental

| ID | Ano | Fonte exata / evidência | O que foi observado | Pendência ou ressalva |
|---|---|---|---|---|
| `sme-goiania-letras-e-palavras` | 2º | [SME Goiânia](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/lingua-portuguesa-letras-e-palavras/) / [sessão](https://agent.tinyfish.ai/runs/419af5c2-a836-438c-a244-0746b36a0565) | Aula de alfabeto, formação de palavras, seis exercícios escritos. Vídeo opcional; links de apoio Wordwall e Google Drive identificados; página pública. | Terceiros e downloads podem exigir controles próprios; avaliação pedagógica, consentimento, acessibilidade e comportamento de arquivos em dispositivo real pendentes. |
| `ef-sme-vegetacao-3` | 3º | [SME Goiânia](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/ciencias-da-natureza-vegetacao-e-a-preservacao-do-solo/) / [sessão de navegador](https://agent.tinyfish.ai/runs/4bd06ecc-a2ac-4139-b6c2-992be49e48cf) | A extração e a [sessão de navegador](https://agent.tinyfish.ai/runs/4bd06ecc-a2ac-4139-b6c2-992be49e48cf) confirmaram a lição do 3º ano: texto sobre raízes, vegetação e erosão, quatro propostas de atividade e experimento com solo e água, tudo visível no HTML sem login. | Arquivos de apoio no Google Drive foram identificados, **mas não abertos** neste teste. Avaliar supervisão adulta para o experimento, acessibilidade e materiais complementares antes de decisão humana. |
| `ef-sme-municipio-4` | 4º | [SME Goiânia](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/geografia-municipio-estado-e-pais/) / [sessão](https://agent.tinyfish.ai/runs/70a307a5-60d1-4d75-beb9-e005ee06a175) | Definição de município, estado e país, contexto brasileiro e goiano, cinco atividades no corpo da página sem login; vídeo e downloads complementares. | Não foi realizada auditoria WCAG; conferir arquivos complementares e acesso móvel/legendas. |
| `ef-sme-vestigios-5` | 5º | [SME Goiânia](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/historia-vestigios-do-passado/) / [sessão](https://agent.tinyfish.ai/runs/4427cab9-afaf-4809-b103-0688b6711b52) | Fontes e registros do passado, quatro atividades presentes, sem dependência de vídeo obrigatório; downloads de apoio. | Conferir imagens, materiais anexos e acessibilidade em dispositivo e tecnologia assistiva real. |
| `sme-goiania-leitura-em-foco` | 5º | [SME Goiânia](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/lingua-portuguesa-leitura-em-foco/) / [sessão](https://agent.tinyfish.ai/runs/866f4185-51dc-4e4e-a6f3-0457557d08ef) | A página mostra questões de leitura e vídeo, mas o texto-base `O Mistério do Quintal` não está integralmente no corpo HTML. | **Pendência relevante:** sem o arquivo externo `BAIXE O TEXTO`, o aluno não tem todas as informações para responder às questões; confirmar o conteúdo e o acesso ao arquivo em navegador comum antes de recomendar a aula. |
| `ef-sme-tecnologia-vida-7` | 7º | [SME Goiânia](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/ciencias-da-natureza-tecnologia-e-vida-humana/) / [sessão](https://agent.tinyfish.ai/runs/82acaae9-8196-46e6-a99b-4cc9713a44e7) | Ciências da Natureza, tema ciência/tecnologia/sociedade/ambiente, quatro exercícios e texto no corpo da página; sem login para o conteúdo principal. | Registrar dependências Google Drive e um link encurtado `tinyurl.com/3p6vbnv9` cujo destino final ainda não foi auditado. **Não categorizar como curso de programação ou trilha de Tecnologia.** |

**Separação de privacidade:** o componente `src/components/ResourceItem.astro` da Pexis Academy exibe **somente um link de saída** para cada URL oficial, com `target="_blank"` e `rel="noopener noreferrer"`. Assim, os scripts de Wordwall, YouTube, Canva e Google Drive incorporados **nas páginas da SME** não são automaticamente incorporados à Academy pelo card. A experiência de privacidade e cookies após abrir a fonte externa deve ser tratada separadamente. Nenhuma conformidade LGPD foi inferida.

## Quatro apostilas Fundação Cecierj | Vestibular

| ID | Link direto do registro tipado | Resultado de extração independente | Questões abertas |
|---|---|---|---|
| `cecierj-pvs-portugues-v1` | [Português volume 1](https://canal.cecierj.edu.br/042022/a205887b2635b3f593ce443d1603fa7d.pdf) | Resposta `HTTP 200`, `application/pdf`, **162 páginas**. Capa confirma pré-vestibular Cecierj, edição de 2021, `VENDA PROIBIDA`. | Material de referência, não curso nem banco de provas. **Linkar a fonte original; não re-hospedar, vender ou redistribuir o PDF.** Avaliar aprendizagem e acessibilidade. |
| `cecierj-pvs-matematica-mod1` | [Matemática módulo 1](https://canal.cecierj.edu.br/122016/efcafab1e59a9c49c5244cbbdc982539.pdf) | Resposta `HTTP 200`, PDF de **118 páginas**, módulo de 2015 da Fundação Cecierj. | Conferir conteúdo e didática atuais; não inferir que a apostila fornece matrícula ou certificado. |
| `cecierj-pvs-historia-mod2` | [História módulo 2](https://canal.cecierj.edu.br/122016/d0522fa0af463530f6629b02000952d5.pdf) | Resposta `HTTP 200`, PDF de **128 páginas**, módulo de 2015. | **Risco de desatualização contextual:** checar fatos contemporâneos antes de apresentá-lo como referência atual. |
| `cecierj-pvs-geografia-mod1` | [Geografia módulo 1](https://canal.cecierj.edu.br/122016/91e80944820052a74356bfa1fc1b6489.pdf) / [sessão de navegador](https://agent.tinyfish.ai/runs/bb793073-e557-4705-ab61-358073bc29e7) | Após timeout do primeiro extrator, verificador independente retornou `HTTP 200`, PDF de **126 páginas digitais**. Navegador abriu `canal.cecierj.edu.br` sem redirecionamento para IP nem alerta TLS; o catálogo bibliográfico menciona 128 páginas impressas. | Uma ferramenta de extração mostrou `final_url=https://200.156.70.29/...`; o **navegador não reproduziu o redirecionamento**. Não inferir falha TLS. Concluir inspeção visual/acessibilidade e atualizar exemplos factuais de 2015 quando necessário. |

**Amostragem:** para os quatro PDFs, a conferência independente `maxAge: 0` extraiu amostra inicial (duas páginas digitais por arquivo), não uma auditoria visual exaustiva de todas as páginas. Um extrator adicional conseguiu obter texto mais longo de três deles, mas isso não prova compatibilidade com leitores de tela ou que cada página esteja correta.

## O que descobrimos e qual é a próxima decisão

1. **Nenhuma URL foi definitivamente classificada como quebrada.** As seis aulas responderam à extração; os quatro PDFs Cecierj tiveram retorno independente HTTP 200 de suas URLs oficiais.
2. **A fonte faz diferença.** `sme-goiania-leitura-em-foco` depende da disponibilidade real do arquivo que contém o texto-base; simplesmente abrir a página não basta. `ef-sme-tecnologia-vida-7` permanece uma aula de Ciências da Natureza, não um curso de software.
3. **A idade do material importa.** Apostilas de 2015 podem ser úteis para fundamentos, mas informações históricas, territoriais ou políticas potencialmente mutáveis precisam de revisão antes de receber a recomendação de conteúdo atualizado.
4. **Não repetir assinaturas de aprovação por IA.** Nenhum dos dez recebe `approved` por esta revisão. Eventual `held` também é uma decisão humana vinculada à evidência, no contrato do motor de publicação.
5. **Próximo gate:** responsável editorial abre as URLs e arquivos em navegador comum, confere os contratos, decide individualmente `approved` ou `held`, e só depois outro PR pode preparar um manifesto de publicação e, em ato separado, pedir autorização de lote.

### Escopo desta alteração

Somente este documento de QA foi criado. **Nenhum** `src/lib/staging*.ts`, `release.json`, `lots.ts`, `PATH_STATUS`, `FEATURED_RELEASE`, guarda de teste, `main` ou workflow de deploy foi modificado. Nenhum recurso novo está publicado por esta rodada.
