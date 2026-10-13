# Pexis Academy | L002: revisão editorial independente dos três candidatos

**Data da revisão:** 12/10/2026 (Brasil), 13/10/2026 (UTC)  
**Base imutável observada:** `main` em `b4786d23724a8e9f671ac3693d08c375472f15e9`, 43 recursos publicados; Gate C após PR #52 em `8d65ec611fdad5799a5dd091fba7d03fa295bd74`.  
**Estado:** parecer técnico de conteúdo, NÃO aprovação editorial humana, NÃO autorização de ativação, NÃO manifesto de publicação, NÃO lançamento.

## Parecer resumido

| ID | Decisão recomendada (não executada) | Razão principal |
|---|---|---|
| `ef-sme-alfabeto-1` | **RETER para recuração** | Afirmação histórica imprecisa no conteúdo infantil, anexos externos e acessibilidade ainda não auditada |
| `ef-sme-funcoes-9` | **RETER para recuração** | Confusão matemática entre função afim e linear, habilidades EF07/EF08 em material rotulado 9º ano, anexo com login |
| `ita-provas-anteriores` | **APTO A DECISÃO EDITORIAL** | Índice oficial gratuito e provas/gabaritos reais; faltam QA móvel/acessibilidade dos PDFs |

"Reter" e "apto" são **recomendações da revisão**, não decisões do proprietário. Nenhum `LotEntry.decision` foi criado ou alterado.

## 1. Ensino Fundamental, 1º ano: `ef-sme-alfabeto-1`

- **Fonte original:** https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/lingua-portuguesa-nosso-alfabeto/
- A página oficial está acessível em HTML sem login obrigatório. Declara 1º ano, habilidades EF01LP04/EF01LP10 e sete atividades.
- **Precisão:** o texto diz que o alfabeto latino é *derivado diretamente* do grego. Essa forma ignora as mediações e adaptações associadas a alfabetos gregos ocidentais e à tradição etrusca na história do alfabeto latino. A frase não deveria ser transmitida por nós como conteúdo historicamente conferido. Referência de contraste: Encyclopaedia Britannica, Alphabet (ed. histórica) em https://en.wikisource.org/wiki/1911_Encyclop%C3%A6dia_Britannica/Alphabet .
- **Acessibilidade pedagógica:** algumas questões requerem interpretação de imagens ou palavras ilustradas. Não houve auditoria manual dos atributos alternativos, contraste, foco ou leitura por tecnologia assistiva. Não declarar acessibilidade plena.
- **Dependências:** a página do provedor incorpora um jogo Wordwall e oferece anexos via Google Drive; jogo básico abre publicamente, mas opções de conta/assinatura existem. Uma URL Drive testada não pôde ser alcançada pelo extrator (não comprova indisponibilidade universal).
- **Menores de idade:** recomendar link externo explícito e acompanhamento de responsável para serviços de terceiros, sem espelhamento e sem iframe do Wordwall dentro da Academy. Pexis Academy hoje usa links `target="_blank"` e `rel="noopener noreferrer"` em `src/components/ResourceItem.astro`.
- **Alternativa para auditar:** https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/parlendas-alfabeto/ . Foi aberta sem login, é claramente do 1º ano, apresenta exercícios textuais (nome, letras e parlenda) e não repete a alegação sobre derivação direta. A videoaula é complementar; requer checar acessibilidade e comportamento ao abrir o serviço externo. **Ainda não integra o inventário tipado nem recebe aprovação.**

## 2. Ensino Fundamental, 9º ano: `ef-sme-funcoes-9`

- **Fonte original:** https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/matematica-funcao-de-1o-e-de-2o-grau/
- O corpo HTML está público, com explicação, exemplos e quatro exercícios; a fonte declara destinatários do 9º ano.
- **Problema conceitual:** o texto chama genericamente `y = ax+b` de *função linear*. Na distinção matemática usual, `f(x)=ax+b` é afim e `f(x)=ax` (termo `b=0`) é o caso linear. Os exemplos `y=2x+6` e `y=-x+2` não são funções lineares nesse sentido. Referência de contraste: https://brasilescola.uol.com.br/matematica/funcao-de-primeiro-grau.htm .
- **Correspondência curricular a confirmar:** o rodapé do próprio recurso rotulado 9º ano enumera habilidades `EF07MA17-A/B` e `EF08MA13`, associadas aos 7º/8º anos. Não deduzir daí que toda a atividade está errada; pedir conferência formal da classificação no 9º ano.
- **Cadastro:** ao abrir uma URL de complemento `docs.google.com/.../copy`, a verificação retornou `login_required`. O conteúdo principal permanece aberto. Portanto `registration: 'unconfirmed'` é o registro cauteloso correto; nunca declarar que *todo* material funciona sem cadastro.
- **Alternativa para auditar:** https://portaldaobmep.impa.br/index.php/modulo/ver?modulo=35 , módulo "Função Afim" do IMPA/OBMEP, aberto com videoaulas, exercícios e materiais teóricos. O PDF público https://portaldaobmep.impa.br/uploads/material/letogmw5mo00g.pdf identifica **9º ano**. **Atenção:** a solução do exercício 2 aparentemente contém erro tipográfico ao usar `f(100)=272`, embora o enunciado indique `212°F` e o cálculo subsequente use coeficiente 1,8, coerente com 212°F. Exigir revisão do PDF completo, não classificar como recurso impecável. Este módulo cobre **função afim**, não substitui sozinho o conteúdo de função quadrática.
- Não copiar ou editar conteúdo do provedor como se fosse produção da Academy; o caminho é substituição por fonte confiável, anotação editorial visível e/ou contato com a instituição.

## 3. Pré-Militar: `ita-provas-anteriores`

- **Fonte:** https://vestibular.ita.br/provas.htm
- Índice oficial do ITA abriu sem autenticação, com provas e gabaritos em vários anos, inclusive entradas de **2026** e **2025**.
- Amostra independente: PDF da prova da 1ª fase de 2025 `https://vestibular.ita.br/provas/2025_fase1.pdf` com **28 páginas** e texto de questões; gabarito 2026 `https://vestibular.ita.br/provas/gabarito_2026.pdf` com **1 página** e nota oficial de anulação da questão 6. A prova da 1ª fase de 2026 é apontada por URL, mas o leitor web recusou carregar o arquivo de aproximadamente **12,8 MB** por limite de extração. Isso não comprova link quebrado.
- É **`past-exam`**, nunca `course`. Não prometer inscrição, vagas, atualidade do edital, elegibilidade ou certificação com base no arquivo de provas.
- Pendente: renderização visual completa, mobile e tecnologia assistiva dos PDFs; verificação de uma prova e gabarito correspondentes do mesmo ano para QA completa.
- **Parecer:** apto à decisão editorial individual, ainda sem assinatura. A ativação de Pré-Militar pode ser decidida **separadamente** do Ensino Fundamental, após aprovação de um recurso oficial colocado na página própria.

## Privacidade e integridade da Academy

- A política de proteção de crianças deve considerar LGPD e **ECA Digital**, em vigor desde março de 2026. Orientações da ANPD: https://www.gov.br/anpd/pt-br/assuntos/eca-digital e https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-publica-orientacoes-preliminares-e-cronograma-para-afericao-de-idade-no-ambiente-digital .
- Links para terceiros não equivalem à incorporação de seus rastreadores pela Academy. Ainda assim, antes de promover conteúdo para crianças: conferir aviso de saída, política de dados, finalidade da navegação, idade provável e acessibilidade. A análise jurídica específica depende das funcionalidades efetivas e não é substituída por esta auditoria.
- Gratuidade do texto principal **não** significa que todos os anexos, recursos interativos, contas opcionais ou certificados sejam livres de cadastro.
- Nunca alterar `verified`, `registration` ou outro campo de `LearningResource` silenciosamente: uma mudança exige novo digest e decisão humana vinculada ao registro final.

## Conclusão e próxima sequência

1. **Não lançar L002 como combinação original de três IDs** sem resolver as duas pendências pedagógicas. Preservar o teste do PR #52 como simulação histórica, não como GO de release.
2. Recurar as duas aulas do Fundamental e criar novos registros tipados somente após auditoria dos links alternativos, faixa escolar, acessibilidade, condições de acesso, licença e privacidade.
3. Revisar PDFs do ITA no navegador móvel e registrar amostra correspondência prova↔gabarito antes da decisão final humana.
4. **Desacoplar as ativações:** permitir proposta própria de Pré-Militar quando houver recurso autorizado, mantendo Fundamental em `preparing` enquanto houver questões de qualidade. Não habilitar destaques sem dez registros válidos por caminho.
5. Para qualquer próximo lote real: registrar `approved` apenas mediante manifestação editorial humana sobre digests exatos, obter aprovação da ativação de caminhos separadamente e só então solicitar autorização do manifesto de publicação e de merge/deploy.
6. Contagem: produção **43 recursos**; a meta de **60 destaques** é uma seleção editorial de dez por caminho, não "60 cursos" do mesmo formato. Alguns materiais são aulas, provas ou referências.

**Este arquivo documenta pesquisa e recomendações; não assina decisões nem autoriza operações.**
