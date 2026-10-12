# Gate B | Auditoria editorial das 60 posições, revisão 02

**Revisão:** 11/10/2026. **Escopo:** documentação e fontes, não publicação. **Base:** `40bf3e4d920720e066d4026f08aa7a0b16bca61c`. **PR #35:** pesquisa, sem alteração em `src/`.

## Resultado

**51/60 posições com fonte e escopo verificados diretamente**, **9 pendentes**. São **60 IDs distintos**, 10 em cada um dos seis caminhos. Nenhuma destas decisões é homologação final de todo o Gate B: **`FEATURED_RELEASE` permanece em staging, 0/60 destaques liberados e nenhum recurso novo publicado**.

A auditoria passou de 45 para 51 fontes aprovadas nesta revisão. Foram substituídos cinco links de questões da UERJ que falharam por **cinco apostilas integralmente abertas** em `canal.cecierj.edu.br`, com disciplinas diferentes. Isso **não apaga os cinco recursos legados da UERJ já publicados no catálogo**, apenas muda a proposta dos destaques. Um acervo da ESA sem fonte foi substituído pelo curso gratuito AprovaRJ. **Cecierj não é UERJ:** as novas apostilas são materiais didáticos gerais do Pré-Vestibular Social, rotulados como `reference`, nunca como questões oficiais da UERJ.

Os PDFs oficiais de Português (2021, 162 páginas), Matemática (2015, 118 páginas), História (2015, 128 páginas), Geografia (2015, 126 páginas) e Física (2021, 188 páginas) foram abertos diretamente e tiveram texto e sumário inspecionados. Material PDF livre não exige cadastro para leitura; certificado não confirmado. O AprovaRJ tem página oficial confirmando gratuidade, acesso contínuo mediante cadastro, videoaulas, exercícios, simulados e ausência de certificado. **Conteúdo interno atrás do login do AprovaRJ não foi aberto**, o que deve ser informado ao publicar ou submeter o item à homologação final.

## Cobertura por caminho

| Caminho | Fonte/escopo aprovado | Pendente | Posições |
|---|---:|---:|---:|
| Ensino Fundamental | 10 | 0 | 10 |
| Ensino Médio | 10 | 0 | 10 |
| Vestibular | 9 | 1 | 10 |
| Pré-Militar | 2 | 8 | 10 |
| Ensino Superior | 10 | 0 | 10 |
| Tecnologia | 10 | 0 | 10 |
| **Total** | **51** | **9** | **60** |

## Substituições desta revisão

| ID anterior, sem nova verificação | Novo recurso | Formato correto | Fonte institucional |
|---|---|---|---|
| `uerj-portuguese-practice` | `cecierj-pvs-portugues-v1` | reference | [Fonte](https://canal.cecierj.edu.br/042022/a205887b2635b3f593ce443d1603fa7d.pdf) |
| `uerj-math-practice` | `cecierj-pvs-matematica-mod1` | reference | [Fonte](https://canal.cecierj.edu.br/122016/efcafab1e59a9c49c5244cbbdc982539.pdf) |
| `uerj-history-practice` | `cecierj-pvs-historia-mod2` | reference | [Fonte](https://canal.cecierj.edu.br/122016/d0522fa0af463530f6629b02000952d5.pdf) |
| `uerj-geography-practice` | `cecierj-pvs-geografia-mod1` | reference | [Fonte](https://canal.cecierj.edu.br/122016/91e80944820052a74356bfa1fc1b6489.pdf) |
| `uerj-physics-practice` | `cecierj-pvs-fisica-v1` | reference | [Fonte](https://canal.cecierj.edu.br/042022/cad642065613839097b51486f3ec3eec.pdf) |
| `pm-esa-provas` | `cecierj-aprovarj` | course | [Fonte](https://extensao.cecierj.edu.br/cursos/aprovarj/) |

Os novos IDs não estão em `src/lib/staging.ts` nem em `src/lib/learning-resources.ts`; o JSON é apenas documentação. Exigem tipagem, `resourceProblems`, evidência P4, roteamento e testes antes de qualquer promoção. Não declarar `registration` ou `certificate` dos PDFs além do que é verificável.

## 9 pendências ainda bloqueadas

- **Vestibular #3: `inep-enem-provas-gabaritos`**. Índice do INEP abre, mas em 11/10 a prova e o gabarito de 2025 (caderno azul) falharam ao abrir em download.inep.gov.br com erro 502. Necessário ao menos um PDF de prova confirmado; não homologar agora. [Página oficial](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos).
- **Pré-Militar #2: `pm-cn-provas`**. Índice Colégio Naval abre e lista ZIPs de provas; o anexo de prova não abriu neste acesso. [Página oficial](https://www.marinha.mil.br/sspm/colegionaval/colegio_princ).
- **Pré-Militar #3: `pm-en-provas`**. Índice Escola Naval abre e lista ZIPs de provas; o anexo de prova não abriu neste acesso. [Página oficial](https://www.marinha.mil.br/sspm/node/95).
- **Pré-Militar #4: `pm-eear-provas`**. Índice EEAR lista provas/gabaritos, mas PDFs das provas não foram confirmados; gabarito sozinho não basta. [Página oficial](https://ingresso.eear.fab.mil.br/SOO/home/provas_anteriores.php?sigla_conc=%25).
- **Pré-Militar #5: `pm-eam-provas`**. Página oficial das Escolas de Aprendizes-Marinheiros lista arquivos; anexo de prova não foi inspecionado. [Página oficial](https://www.marinha.mil.br/sspm/escola-aprendizes/a-eam-provag).
- **Pré-Militar #6: `pm-afa-provas`**. Índice oficial da FAB foi localizado, mas acesso direto devolveu 403. É vedado usar trecho de buscador como fonte. [Página oficial](https://www.fab.mil.br/ingresso/anteriores.html).
- **Pré-Militar #7: `pm-epcar-provas`**. Índice oficial EPCAR/FAB foi localizado, mas acesso direto devolveu 403. Não homologar. [Página oficial](https://www.fab.mil.br/ingresso/anteriores.html).
- **Pré-Militar #9: `pm-espcex-provas`**. Nenhum acervo específico e verificável de provas da EsPCEx foi aberto em fonte oficial. Sem URL verificada.
- **Pré-Militar #10: `pm-ime-provas`**. Página de provas anteriores do IME CFG (ensino médio) foi localizada, mas a abertura direta retornou 502. [Página oficial](https://www.ime.eb.mil.br/index.php).

**Atenção:** o índice de provas ENEM do INEP está acessível, mas os anexos tentados retornaram erro 502; ainda não é prova de acesso ao caderno de questões. Na Marinha, abrir o índice não equivale a abrir o ZIP da prova. No IME, conteúdo visto em resultado de busca não equivale a conseguir abrir a página nem seus PDFs. A aprovação do AprovaRJ não habilita reclassificar os oito acervos militares ainda indisponíveis.

## Inventário editorial completo

| Caminho | Posição | ID | Estado | URL | Evidência e ressalva |
|---|---:|---|---|---|---|
| Ensino Fundamental | 1 | `ef-sme-alfabeto-1` | Fonte aprovada | [Oficial](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/lingua-portuguesa-nosso-alfabeto/) | Página da SME informa 1º ano e explica o alfabeto; slides vinculados não foram baixados. |
| Ensino Fundamental | 2 | `sme-goiania-letras-e-palavras` | Fonte aprovada | [Oficial](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/lingua-portuguesa-letras-e-palavras/) | Página da SME indica 2º ano, texto e atividade de letras/palavras; aula isolada. |
| Ensino Fundamental | 3 | `ef-sme-vegetacao-3` | Fonte aprovada | [Oficial](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/ciencias-da-natureza-vegetacao-e-a-preservacao-do-solo/) | Página da SME indica 3º ano e contém texto e questões sobre vegetação/solo; Ciências não deve ser rotulada Tecnologia. |
| Ensino Fundamental | 4 | `ef-sme-municipio-4` | Fonte aprovada | [Oficial](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/geografia-municipio-estado-e-pais/) | Página da SME indica 4º ano, texto sobre município, estado e país e atividades visíveis. |
| Ensino Fundamental | 5 | `ef-sme-vestigios-5` | Fonte aprovada | [Oficial](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/historia-vestigios-do-passado/) | Página da SME indica 5º ano, conteúdo e questões de fontes históricas. |
| Ensino Fundamental | 6 | `sme-goiania-leitura-em-foco` | Fonte aprovada | [Oficial](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/lingua-portuguesa-leitura-em-foco/) | Página da SME indica 5º ano e apresenta atividade de leitura; aula isolada. |
| Ensino Fundamental | 7 | `ef-obmep-fracoes-6` | Fonte aprovada | [Oficial](https://portaldaobmep.impa.br/index.php/modulo/ver?modulo=28) | Módulo Frações listado para 6º ano e vídeos/textos/exercícios no Portal OBMEP; testes com login não inspecionados. |
| Ensino Fundamental | 8 | `ef-sme-tecnologia-vida-7` | Fonte aprovada | [Oficial](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/ciencias-da-natureza-tecnologia-e-vida-humana/) | Página da SME indica 7º ano; aula de Ciências sobre tecnologia na vida humana, não trilha de TI. |
| Ensino Fundamental | 9 | `ef-obmep-potenciacao-8` | Fonte aprovada | [Oficial](https://portaldaobmep.impa.br/index.php/modulo/ver?modulo=1059) | Módulo Potenciação enquadrado no 8º ano pelo índice oficial; material livre visível, testes com login não inspecionados. |
| Ensino Fundamental | 10 | `ef-sme-funcoes-9` | Fonte aprovada | [Oficial](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/matematica-funcao-de-1o-e-de-2o-grau/) | Página da SME indica 9º ano e contém explicações e atividades sobre funções de 1º/2º grau. |
| Ensino Médio | 1 | `kultivi-math-enem` | Fonte aprovada | [Oficial](https://kultivi.com/curso/matematica) | Página oficial da Kultivi, curso de Matemática voltado ao ENEM, gratuito; exige conta para matrícula e informa certificado gratuito. |
| Ensino Médio | 2 | `kultivi-portuguese-enem` | Fonte aprovada | [Oficial](https://kultivi.com/curso/portugues) | Página oficial da Kultivi, curso de Português voltado ao ENEM, gratuito; exige conta para matrícula e informa certificado gratuito. |
| Ensino Médio | 3 | `kultivi-physics-enem` | Fonte aprovada | [Oficial](https://kultivi.com/curso/fisica) | Página oficial da Kultivi, curso de Física voltado ao ENEM, gratuito; exige conta para matrícula e informa certificado gratuito. |
| Ensino Médio | 4 | `kultivi-chemistry-enem` | Fonte aprovada | [Oficial](https://kultivi.com/curso/quimica) | Página oficial da Kultivi, curso de Química voltado ao ENEM, gratuito; exige conta para matrícula e informa certificado gratuito. |
| Ensino Médio | 5 | `kultivi-biology-enem` | Fonte aprovada | [Oficial](https://kultivi.com/curso/biologia) | Página oficial da Kultivi, curso de Biologia voltado ao ENEM, gratuito; exige conta para matrícula e informa certificado gratuito. |
| Ensino Médio | 6 | `kultivi-history-enem` | Fonte aprovada | [Oficial](https://kultivi.com/curso/historia-2) | Página oficial da Kultivi, curso de História voltado ao ENEM, gratuito; exige conta para matrícula e informa certificado gratuito. |
| Ensino Médio | 7 | `kultivi-geography-enem` | Fonte aprovada | [Oficial](https://kultivi.com/curso/geografia) | Página oficial da Kultivi, curso de Geografia voltado ao ENEM, gratuito; exige conta para matrícula e informa certificado gratuito. |
| Ensino Médio | 8 | `kultivi-philosophy-enem` | Fonte aprovada | [Oficial](https://kultivi.com/curso/filosofia) | Página oficial da Kultivi, curso de Filosofia voltado ao ENEM, gratuito; exige conta para matrícula e informa certificado gratuito. |
| Ensino Médio | 9 | `kultivi-sociology-enem` | Fonte aprovada | [Oficial](https://kultivi.com/curso/sociologia) | Página oficial da Kultivi, curso de Sociologia voltado ao ENEM, gratuito; exige conta para matrícula e informa certificado gratuito. |
| Ensino Médio | 10 | `kultivi-english-enem` | Fonte aprovada | [Oficial](https://kultivi.com/curso/ingles-para-enem) | Página oficial da Kultivi, curso de Inglês voltado ao ENEM, gratuito; exige conta para matrícula e informa certificado gratuito. |
| Vestibular | 1 | `kultivi-enem-completo` | Fonte aprovada | [Oficial](https://kultivi.com/curso/enem-completo) | Página própria de ENEM Completo confirma curso multidisciplinar gratuito, matrícula com conta e certificado gratuito. |
| Vestibular | 2 | `kultivi-writing-enem` | Fonte aprovada | [Oficial](https://kultivi.com/curso/redacao-para-enem) | Página própria de Redação para ENEM confirma curso gratuito e certificado; ID legado preservado. |
| Vestibular | 3 | `inep-enem-provas-gabaritos` | Pendente | [Oficial](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos) | Índice do INEP abre, mas em 11/10 a prova e o gabarito de 2025 (caderno azul) falharam ao abrir em download.inep.gov.br com erro 502. Necessário ao menos um PDF de prova confirmado; não homologar agora. |
| Vestibular | 4 | `fuvest-acervo-2026` | Fonte aprovada | [Oficial](https://www.fuvest.br/acervo-vestibular-2026/) | Índice oficial da Fuvest 2026 aberto; gabarito PDF e simulado PDF foram inspecionados. Não afirmar que todos os cadernos de prova abriram. |
| Vestibular | 5 | `inep-writing-2026` | Fonte aprovada | [Oficial](https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/a-redacao-do-enem-2026-cartilha-do-a-participante) | Cartilha oficial da Redação ENEM 2026, material de referência/prática, não curso. |
| Vestibular | 6 | `cecierj-pvs-portugues-v1` | Fonte aprovada | [Oficial](https://canal.cecierj.edu.br/042022/a205887b2635b3f593ce443d1603fa7d.pdf) | PDF institucional integral aberto em 11/10/2026; 162 páginas, material didático de Língua Portuguesa publicado pela Fundação Cecierj em 2021. Texto, leitura, coesão e exercícios; referência de estudo, não banco de questões da UERJ nem curso completo. |
| Vestibular | 7 | `cecierj-pvs-matematica-mod1` | Fonte aprovada | [Oficial](https://canal.cecierj.edu.br/122016/efcafab1e59a9c49c5244cbbdc982539.pdf) | PDF integral de 118 páginas aberto em 11/10/2026; módulo de 2015 da Fundação Cecierj com números, funções, combinatória, probabilidade e exercícios. Material de referência, não prova da UERJ. |
| Vestibular | 8 | `cecierj-pvs-historia-mod2` | Fonte aprovada | [Oficial](https://canal.cecierj.edu.br/122016/d0522fa0af463530f6629b02000952d5.pdf) | PDF institucional de 128 páginas aberto em 11/10/2026; apostila de 2015 sobre Guerras Mundiais, Guerra Fria e Américas, com conteúdo integral. Material de referência, não questões comentadas da UERJ. |
| Vestibular | 9 | `cecierj-pvs-geografia-mod1` | Fonte aprovada | [Oficial](https://canal.cecierj.edu.br/122016/91e80944820052a74356bfa1fc1b6489.pdf) | PDF integral de 126 páginas aberto em 11/10/2026; apostila de 2015 da Fundação Cecierj com industrialização, urbanização, globalização e exercícios do Enem. Material de referência, não banco de questões da UERJ. |
| Vestibular | 10 | `cecierj-pvs-fisica-v1` | Fonte aprovada | [Oficial](https://canal.cecierj.edu.br/042022/cad642065613839097b51486f3ec3eec.pdf) | PDF integral de 188 páginas aberto em 11/10/2026; volume de Física de 2021 da Fundação Cecierj, com cinemática, movimentos e exercícios. Material de referência, não simulador/questões da UERJ. |
| Pré-Militar | 1 | `ita-provas-anteriores` | Fonte aprovada | [Oficial](https://vestibular.ita.br/provas.htm) | Índice oficial do ITA reaberto; PDF da prova de 2025 e respectivo gabarito inspecionados diretamente. |
| Pré-Militar | 2 | `pm-cn-provas` | Pendente | [Oficial](https://www.marinha.mil.br/sspm/colegionaval/colegio_princ) | Índice Colégio Naval abre e lista ZIPs de provas; o anexo de prova não abriu neste acesso. |
| Pré-Militar | 3 | `pm-en-provas` | Pendente | [Oficial](https://www.marinha.mil.br/sspm/node/95) | Índice Escola Naval abre e lista ZIPs de provas; o anexo de prova não abriu neste acesso. |
| Pré-Militar | 4 | `pm-eear-provas` | Pendente | [Oficial](https://ingresso.eear.fab.mil.br/SOO/home/provas_anteriores.php?sigla_conc=%25) | Índice EEAR lista provas/gabaritos, mas PDFs das provas não foram confirmados; gabarito sozinho não basta. |
| Pré-Militar | 5 | `pm-eam-provas` | Pendente | [Oficial](https://www.marinha.mil.br/sspm/escola-aprendizes/a-eam-provag) | Página oficial das Escolas de Aprendizes-Marinheiros lista arquivos; anexo de prova não foi inspecionado. |
| Pré-Militar | 6 | `pm-afa-provas` | Pendente | [Oficial](https://www.fab.mil.br/ingresso/anteriores.html) | Índice oficial da FAB foi localizado, mas acesso direto devolveu 403. É vedado usar trecho de buscador como fonte. |
| Pré-Militar | 7 | `pm-epcar-provas` | Pendente | [Oficial](https://www.fab.mil.br/ingresso/anteriores.html) | Índice oficial EPCAR/FAB foi localizado, mas acesso direto devolveu 403. Não homologar. |
| Pré-Militar | 8 | `cecierj-aprovarj` | Fonte aprovada | [Oficial](https://extensao.cecierj.edu.br/cursos/aprovarj/) | Página oficial da Fundação Cecierj aberta em 11/10/2026: programa online gratuito, inscrições contínuas, videoaulas, exercícios e simulados; inclui ESA, EsPCEx, EPCAR, AFA, ITA, IME, Marinha e EEAR. Cadastro gratuito obrigatório; sem certificado. Área autenticada não foi acessada. É curso preparatório geral, não provas anteriores da ESA. |
| Pré-Militar | 9 | `pm-espcex-provas` | Pendente | Não localizada | Nenhum acervo específico e verificável de provas da EsPCEx foi aberto em fonte oficial. |
| Pré-Militar | 10 | `pm-ime-provas` | Pendente | [Oficial](https://www.ime.eb.mil.br/index.php) | Página de provas anteriores do IME CFG (ensino médio) foi localizada, mas a abertura direta retornou 502. |
| Ensino Superior | 1 | `mit-1801sc` | Fonte aprovada | [Oficial](https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/) | MIT OCW, Single Variable Calculus: vídeos, exercícios e notas de cálculo, sem diploma/certificado. |
| Ensino Superior | 2 | `mit-801sc` | Fonte aprovada | [Oficial](https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/) | MIT OCW, Classical Mechanics: aulas e exercícios oficiais de mecânica, sem diploma/certificado. |
| Ensino Superior | 3 | `mit-7012` | Fonte aprovada | [Oficial](https://ocw.mit.edu/courses/7-012-introduction-to-biology-fall-2004/) | MIT OCW, Introduction to Biology: aulas e atividades gratuitas de biologia. |
| Ensino Superior | 4 | `yale-psyc-110` | Fonte aprovada | [Oficial](https://oyc.yale.edu/introduction-psychology/psyc-110) | Open Yale Courses, Introduction to Psychology: aulas gravadas oficiais acessíveis; sem créditos/certificado. |
| Ensino Superior | 5 | `yale-econ-252` | Fonte aprovada | [Oficial](https://oyc.yale.edu/economics/econ-252) | Open Yale Courses, Financial Markets (2011): aulas oficiais gratuitas; leituras suplementares pagas não fazem parte do item. |
| Ensino Superior | 6 | `ou-environment-treading-lightly` | Fonte aprovada | [Oficial](https://www.open.edu/openlearn/nature-environment/environmental-studies/environment-treading-lightly-on-the-earth/content-section-0) | OpenLearn da Open University: curso ambiental gratuito, conta opcional para progresso e statement. |
| Ensino Superior | 7 | `mit-6100l` | Fonte aprovada | [Oficial](https://ocw.mit.edu/courses/6-100l-introduction-to-cs-and-programming-using-python-fall-2022/) | MIT OCW, Introduction to CS and Programming Using Python, edição Fall 2022, conteúdo gratuito. |
| Ensino Superior | 8 | `mit-60002` | Fonte aprovada | [Oficial](https://ocw.mit.edu/courses/6-0002-introduction-to-computational-thinking-and-data-science-fall-2016/) | MIT OCW, Introduction to Computational Thinking and Data Science, conteúdo gratuito. |
| Ensino Superior | 9 | `mit-6006` | Fonte aprovada | [Oficial](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/) | MIT OCW, Introduction to Algorithms, conteúdo gratuito. |
| Ensino Superior | 10 | `mit-6042j` | Fonte aprovada | [Oficial](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/) | MIT OCW, Mathematics for Computer Science, conteúdo gratuito. |
| Tecnologia | 1 | `cs50x` | Fonte aprovada | [Oficial](https://cs50.harvard.edu/x/) | Harvard CS50x: acesso gratuito às aulas; certificado verificado da edX é modalidade separada. |
| Tecnologia | 2 | `cs50p` | Fonte aprovada | [Oficial](https://cs50.harvard.edu/python/) | Harvard CS50 Python: aulas gratuitas; conta pode ser necessária para envio de problemas; certificado edX separado. |
| Tecnologia | 3 | `odin-foundations` | Fonte aprovada | [Oficial](https://www.theodinproject.com/paths/foundations/courses/foundations) | The Odin Project Foundations: trilha gratuita de HTML, CSS, JavaScript e projetos. |
| Tecnologia | 4 | `google-mlcc` | Fonte aprovada | [Oficial](https://developers.google.com/machine-learning/crash-course/) | Google Machine Learning Crash Course: aulas, vídeos e exercícios públicos gratuitos. |
| Tecnologia | 5 | `ms-learn-cloud-concepts` | Fonte aprovada | [Oficial](https://learn.microsoft.com/pt-br/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/) | Microsoft Learn cloud concepts em pt-BR: unidades gratuitas; certificação AZ-900 separada; exige posição de trilha de nuvem correta. |
| Tecnologia | 6 | `fb-python` | Fonte aprovada | [Oficial](https://www.ev.org.br/cursos/linguagem-de-programacao-python-basico) | Escola Virtual Fundação Bradesco: curso Python Básico em página oficial gratuita. |
| Tecnologia | 7 | `fb-web` | Fonte aprovada | [Oficial](https://www.ev.org.br/cursos/crie-um-site-simples-usando-html-css-e-javascript) | Escola Virtual Fundação Bradesco: curso de HTML/CSS/JavaScript em página oficial gratuita. |
| Tecnologia | 8 | `cs50w` | Fonte aprovada | [Oficial](https://cs50.harvard.edu/web/) | Harvard CS50 Web: curso livre sobre desenvolvimento web com Python e JavaScript. |
| Tecnologia | 9 | `cs50ai` | Fonte aprovada | [Oficial](https://cs50.harvard.edu/ai/) | Harvard CS50 AI: curso livre sobre IA com Python. |
| Tecnologia | 10 | `cs50sql` | Fonte aprovada | [Oficial](https://cs50.harvard.edu/sql/) | Harvard CS50 SQL: curso gratuito de banco de dados; atividades podem exigir conta edX; certificado verificado é separado. Substitui Cisco apenas na shortlist. |

## Próximas condições

Para promover um registro novo, preparar metadados e testes com o validador P4, manter formato fiel à fonte, verificar URL direta, definir destino canônico e evidenciar cadastro/certificado. A seleção só pode ser publicada com dez recursos distintos válidos por caminho, CI aprovado e revisão externa concluída **antes** de merge/deploy. Nenhuma dispensa temporária de segurança do Gate B.

**Não alterados nesta revisão:** os 37 registros do catálogo publicado, o staging técnico, os caminhos, `FEATURED_RESOURCE_IDS_BY_PATH`, `FEATURED_RELEASE`, `PATH_STATUS` e o site.
