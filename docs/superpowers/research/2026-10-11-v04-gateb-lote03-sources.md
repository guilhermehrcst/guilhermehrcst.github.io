# Pexis Academy V0.4 - Gate B, Lote 03: fontes oficiais abertas

Data da consulta externa: 2026-10-11. Origem: leitura direta das paginas institucionais pelo ChatGPT (nao somente resultados de busca). Destino: pesquisa/staging; **nenhum item autorizado para publicacao automaticamente**.

## Oito candidatos adicionais para Ensino Fundamental

Estes oito sao materiais diferentes dos dois itens da SME Goiania ja relatados em staging ("Letras e palavras, 2o ano" e "Leitura em Foco, 5o ano"). Juntos formam **um conjunto editorial possivel de dez**, a validar quanto a cobertura, duplicidades e acesso final.

| ID sugerido | Recurso (nome observado) | URL oficial aberta | Formato sugerido | `schoolYears` | `subject` sugerido | Evidencia de conteudo | Pontos pendentes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ef-sme-alfabeto-1 | Lingua Portuguesa - Nosso Alfabeto | https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/lingua-portuguesa-nosso-alfabeto/ | lesson | [1] | portugues | O corpo da pagina declara 1o ano e explica o alfabeto; links para slides, atividades e texto | Download das pecas vinculadas nao testado; cadastro e certificado nao declarados |
| ef-sme-vegetacao-3 | Ciencias da Natureza - Vegetacao e a Preservacao do Solo | https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/ciencias-da-natureza-vegetacao-e-a-preservacao-do-solo/ | lesson | [3] | null | Pagina declara 3o ano e traz texto, questoes, experimento e links de materiais | A materia escolar e "Ciencias da Natureza", nao existe como SubjectId atual; evitar rotulo falso; downloads nao testados |
| ef-sme-municipio-4 | Geografia - Municipio, Estado e Pais | https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/geografia-municipio-estado-e-pais/ | lesson | [4] | geografia | Pagina declara 4o ano, define municipio/estado/pais e apresenta atividades | Links dos downloads nao testados; cadastro/certificado nao declarados |
| ef-sme-vestigios-5 | Historia - Vestigios do Passado | https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/historia-vestigios-do-passado/ | lesson | [5] | historia | Pagina declara 5o ano e aborda fontes e registros historicos | Material complementar nao testado; cadastro/certificado nao declarados |
| ef-obmep-fracoes-6 | Fracoes, o Primeiro Contato | https://portaldaobmep.impa.br/index.php/modulo/ver?modulo=28 | lessons | [6] | matematica | Catalogo oficial coloca modulo no 6o ano; pagina do modulo lista videos, exercicios, caderno e textos | Testes da plataforma exigem login; distinguir conteudo livre de teste com conta, certificado nao declarado |
| ef-sme-tecnologia-vida-7 | Ciencias da Natureza - Tecnologia e Vida Humana | https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/ciencias-da-natureza-tecnologia-e-vida-humana/ | lesson | [7] | null | Pagina declara 7o ano e traz texto e perguntas sobre ciencia, tecnologia, sociedade e ambiente | Nao classificar automaticamente como trilha de Tecnologia; downloads nao testados |
| ef-obmep-potenciacao-8 | Potenciacao | https://portaldaobmep.impa.br/index.php/modulo/ver?modulo=1059 | lessons | [8] | matematica | O indice oficial da OBMEP enquadra o modulo no 8o ano; pagina propria abriu e apresenta o modulo | Rever se partes necessitam login; declarar cadastro/certificado como unconfirmed ate prova |
| ef-sme-funcoes-9 | Matematica - Funcao de 1o e de 2o grau | https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/matematica-funcao-de-1o-e-de-2o-grau/ | lesson | [9] | matematica | Pagina declara 9o ano e oferece explicacao, exemplos, atividades e video | Links de materiais extras nao testados; cadastro/certificado nao declarados |

Conferencias de acesso por corpo de pagina: as paginas indicadas retornaram titulo e conteudo legivel da fonte institucional, sem solicitar pagamento para ler o texto exibido. Nao extrapolar para downloads ou atividades que nao foram abertas. `registration` e `certificate` devem usar `unconfirmed` quando a fonte nao comprovar os fatos, nos termos de P4. Se a equipe exigir gratuidade e disponibilidade de todos os downloads para o formato representado, isso continua pendente por item. `schoolYears` deve estar fundamentado no texto ou indice da fonte.

## Tres outros acervos institucionais de Pre-Militar

| ID sugerido | Recurso | URL oficial aberta | Formato | Estado de verificacao | Evidencia e pendencia |
| --- | --- | --- | --- | --- | --- |
| pm-cn-provas | Colegio Naval - Provas e Gabaritos | https://www.marinha.mil.br/sspm/colegionaval/colegio_princ | past-exam | PAGE_CONFIRMED_ATTACHMENT_PENDING | O SSPM da Marinha lista provas de 2021 a 2026 e gabaritos. Os anexos nao foram baixados ou abertos nessa verificacao. |
| pm-en-provas | Escola Naval - Provas e Gabaritos | https://www.marinha.mil.br/sspm/node/95 | past-exam | PAGE_CONFIRMED_ATTACHMENT_PENDING | SSPM lista anexos de provas de 2020 a 2026. Os arquivos anexos nao foram baixados ou abertos. |
| pm-eear-provas | EEAR - Provas Anteriores | https://ingresso.eear.fab.mil.br/SOO/home/provas_anteriores.php?sigla_conc=%25 | past-exam | PAGE_CONFIRMED_ATTACHMENT_PENDING | Portal oficial de ingresso lista itens de concurso CFS e gabaritos de varias edicoes. Falta confirmar diretamente os PDFs das provas, e nao somente os gabaritos. |

### Itens ainda pendentes de leitura direta completa

- ITA (ja consta como item verificado no lote anterior): https://www.vestibular.ita.br/provas.htm . Conferi novamente a pagina oficial com provas e gabaritos de 2008 a 2026. Reutilizar o item em staging, sem duplicar.
- IME: a fonte localizada em https://www.ime.eb.mil.br/vestibular-e-concursos/cfg-ensino-medio/provas-anteriores-cfg devolveu erro 502 nesta leitura. Resultado de busca nao basta para homologar.
- AFA e EPCAR: https://www.fab.mil.br/ingresso/provas.html devolveu 403. Resultado de busca nao basta para homologar.
- ESA e EsPCEx: nao consegui abrir acervo proprio oficial de provas completas e gabaritos. Mantenha PENDING_RECHECK ou substitua apenas com outra fonte realmente aberta.
- Khan Academy: resultados do proprio dominio exibiam series por ano, mas a abertura direta do conteudo nesse acesso retornou pagina vazia. Nao promover esses itens com base no indice de busca.

## Procedimento sugerido ao Claude

1. Manter este arquivo em `docs/superpowers/research/` como complemento do Lote 02.
2. Converter os oito itens do Fundamental em registros de staging, com IDs unicos e `subject: null` nos dois materiais interdisciplinares de Ciencias; evitar usar `subject: tecnologia` para Ciencias.
3. Conferir P4 e `resourceProblems`; usar `unconfirmed` para cadastro e certificado nao demonstrados. Registrar notas honestas sobre links extras nao abertos.
4. Para os tres acervos militares, registrar como verificacao **parcial**, sem homologacao final enquanto nao houver evidencia suficiente sobre anexos de provas.
5. Revisar duplicidades contra staging e catalogo; preservar todos os registros publicados.
6. Testar staging e criar commits pequenos. Se todos os gates tecnicos passarem, fazer push normal na branch do PR #33 existente, sem merge/deploy; nao ativar `FEATURED_RELEASE` nem `PATH_STATUS`.
7. Entregar tabela de cobertura efetiva e distinguir explicitamente: fonte aberta, evidencia completa, homologado, publicado. As quatro grandezas nao sao sinonimos.

## Estado de publicacao

Gate B oficial continua 0/60 ate decisao editorial e registro de homologacao. Nao alterar a `main`, nao fazer merge, nao executar deploy.
