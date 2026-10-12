# Pexis Academy V0.4 | Verificação externa complementar (Rodada 4)

**Data:** 12/10/2026  
**Origem:** PR #38 (branch `qa/v04-homologation`).  
**Fonte primária de auditoria:** [manifesto JSON da Rodada 4](2026-10-12-v04-external-qa-round4.json), com 37 entradas, URLs exatas, método e ressalvas.  
**Parecer:** **NO-GO**. Nenhum item novo foi publicado e nenhum merge/deploy foi autorizado.

## Resultado e interpretação correta

Esta rodada trouxe evidência de conteúdo e acesso para **todos os 37 registros**, mas não homologação integral de navegador para todos. Em especial, extração por browser-backed fetch ou parse de PDF **não equivale** a clicar, reproduzir vídeo ou cursar a oferta inteira.

- **28** conteúdos/URLs confirmados por extração ao vivo e conferência de tema e instituição. É confirmação de conteúdo público, **não aprovação final de todos os controles do navegador**.
- **7** verificações parciais por mídia não reproduzida, conta obrigatória, formato digitalizado ou outra limitação específica.
- **1** bloqueio de navegador: prova ESA 2026, com `ERR_CONNECTION_CLOSED` no Firecrawl e TinyFish. O Exa conseguiu extrair o PDF oficial, mas isso não substitui a abertura no navegador. Tentativa alternativa em `www.esa.eb.mil.br` não resolveu (DNS inválido).
- **1** verificação interativa anterior de Microsoft Learn: caminho pt-BR e primeira unidade pública acessível sem login.
- **3** evidências de navegação interativa efetivamente observadas: Microsoft Learn, Kultivi e visualizador PDF do Colégio Naval; as demais foram inspecionadas por extração de páginas/PDFs, não por clique interativo equivalente.
- **37/37** registros têm observações; **não há 37/37 homologados para release**.

| Caminho | Conteúdo acessado | Parcial | Browser bloqueado | Browser anterior |
|---|---:|---:|---:|---:|
| Ensino Fundamental | 8 | 2 | 0 | 0 |
| Vestibular | 7 | 1 | 0 | 0 |
| Pré-Militar | 7 | 2 | 1 | 0 |
| Ensino Superior | 4 | 2 | 0 | 0 |
| Tecnologia | 2 | 0 | 0 | 1 |
| **Total** | **28** | **7** | **1** | **1** |

## Achados com impacto na comunicação educacional

**Kultivi ENEM:** curso gratuito, mas **cadastro obrigatório para abrir as aulas**. O navegador abriu a primeira lista de lições e clicar na primeira abriu modal `Crie sua conta` (nome/e-mail ou Google). Não houve cadastro. [Registro da sessão](https://agent.tinyfish.ai/runs/003b4617-d755-4be7-9ccf-404630574c29). A necessidade de conta já consta no manifesto.

**AprovaRJ:** página institucional confirma gratuidade e cadastro/inscrição para entrar na sala de aula, com **nenhum certificado de conclusão oferecido**. Aula autenticada não foi inspecionada.

**Open University:** texto completo da introdução e da primeira seção em página pública, apesar de um leitor bloquear o acesso. Página oficial diferencia **declaração de participação** de certificado de conclusão; inscrição/conta é necessária para acompanhar e obter a declaração.

**Microsoft Learn:** três módulos, primeira unidade aberta sem login e sem pagamento. Há aviso de possível tradução automática/IA. Não inferir certificado. [Registro da sessão](https://agent.tinyfish.ai/runs/f1ce30e4-f26b-47cb-b5a2-e0a5e78abc0f).

**Colégio Naval e Aprendizes-Marinheiros:** cadernos PDF oficiais com HTTP 200 e páginas reconhecidas. O visualizador do Colégio Naval abriu, mas o texto nativo era vazio, compatível com arquivo digitalizado e limitações de acessibilidade; a extração alternativa identificou capa e questões. Aprendizes-Marinheiros exige inspeção visual adicional dos enunciados.

**ESA 2026:** continua **sem evidência de abertura do PDF em navegador**. Registro da falha: [sessão externa](https://agent.tinyfish.ai/runs/9dd66d95-99a6-4e7b-ac17-d9c241fbf73a). A extração documental pelo Exa confirmou caderno ESA 2026 Área Geral, mas a experiência de navegação não foi demonstrada. Não trocar silenciosamente a URL por espelho não oficial.

**Fuvest, INEP e ITA:** páginas institucionais e PDFs oficiais de prova foram acessados; PDFs de referência FUVEST 2026 primeira fase V1, ENEM 2024 primeiro dia azul e ITA 2026 primeira fase. Esses anos específicos são exemplos inspecionados, não promessa de que todo acervo foi lido.

**MIT e Yale:** as páginas das seis ofertas universitárias foram inspecionadas. MIT 18.01SC tem sessão com notas e problema; Yale PSYC 110 e ECON 252 têm transcrições de aula legíveis. Players de vídeo do MIT 8.01SC e 7.012 exibiram limitações no leitor automatizado, logo reprodução não foi homologada.

**Google e Odin Project:** páginas de aula reais sobre regressão linear e funcionamento da web acessadas publicamente. Dois módulos OBMEP também tiveram conteúdo e links de vídeo extraídos, mas não houve reprodução verificada.

## Registro individual da rodada

| ID | Caminho | Estado | Evidência principal |
|---|---|---|---|
| `ef-sme-alfabeto-1` | Ensino Fundamental | Acesso/conteúdo | Conteúdo da proposta de Língua Portuguesa e atividade do 1º ano visíveis publicamente no HTML. |
| `sme-goiania-letras-e-palavras` | Ensino Fundamental | Acesso/conteúdo | Atividade de letras e palavras do 2º ano legível sem login. |
| `ef-sme-vegetacao-3` | Ensino Fundamental | Acesso/conteúdo | Material de vegetação e solo do 3º ano identificado e legível. |
| `ef-sme-municipio-4` | Ensino Fundamental | Acesso/conteúdo | Aula de Geografia do 4º ano com município, estado e país. |
| `ef-sme-vestigios-5` | Ensino Fundamental | Acesso/conteúdo | Conteúdo de História do 5º ano com questões e contexto. |
| `sme-goiania-leitura-em-foco` | Ensino Fundamental | Acesso/conteúdo | Atividade do 5º ano, questões de leitura e videoaula opcional indicada; vídeo não reproduzido. |
| `ef-obmep-fracoes-6` | Ensino Fundamental | Parcial | Módulo Frações com tópicos, descrições de videoaulas e links; reprodução dos vídeos não testada. |
| `ef-sme-tecnologia-vida-7` | Ensino Fundamental | Acesso/conteúdo | Texto de Ciências do 7º ano sobre tecnologia e vida humana. |
| `ef-obmep-potenciacao-8` | Ensino Fundamental | Parcial | Módulo Potenciação com descrições e links de videoaulas; reprodução não testada. |
| `ef-sme-funcoes-9` | Ensino Fundamental | Acesso/conteúdo | Aula de funções de 1º e 2º grau para o 9º ano com atividade. |
| `kultivi-enem-completo` | Vestibular | Parcial | Curso publicamente descrito como gratuito. Navegador exibiu módulos; clique na primeira aula acionou modal 'Crie sua conta'. Conteúdo da aula inacessível anonimamente; cadastro obrigatório. |
| `inep-enem-provas-gabaritos` | Vestibular | Acesso/conteúdo | Acervo oficial lista anos de ENEM; PDF azul ENEM 2024 do 1º dia abriu HTTP 200 com questões e prova de redação. Extração do índice pode exibir abas carregando. |
| `fuvest-acervo-2026` | Vestibular | Acesso/conteúdo | Acervo oficial da Fuvest com provas e gabaritos. PDF oficial da 1ª fase 2026 V1 abriu HTTP 200 e apresentou instruções e questões. |
| `cecierj-pvs-portugues-v1` | Vestibular | Acesso/conteúdo | Apostila Pré-Vestibular Cecierj, Língua Portuguesa vol. 1, PDF 162 páginas, HTTP 200; NÃO é prova oficial UERJ. |
| `cecierj-pvs-matematica-mod1` | Vestibular | Acesso/conteúdo | Apostila Cecierj Matemática Módulo 1, PDF 118 páginas, HTTP 200; material preparatório. |
| `cecierj-pvs-historia-mod2` | Vestibular | Acesso/conteúdo | Apostila Cecierj História Módulo 2, PDF 128 páginas, HTTP 200. |
| `cecierj-pvs-geografia-mod1` | Vestibular | Acesso/conteúdo | Apostila Cecierj Geografia Módulo 1, PDF 126 páginas, HTTP 200. |
| `cecierj-pvs-fisica-v1` | Vestibular | Acesso/conteúdo | Apostila Cecierj Física vol. 1, PDF 188 páginas, HTTP 200. |
| `ita-provas-anteriores` | Pré-Militar | Acesso/conteúdo | Índice oficial ITA lista provas 2026 e anos anteriores; PDF da 1ª fase 2026 abriu HTTP 200, 32 páginas. |
| `pm-cn-provas` | Pré-Militar | Acesso/conteúdo | PDF institucional Colégio Naval CPACN 2025, 19 páginas, HTTP 200, questões de Matemática e Inglês extraídas; navegador abriu visualizador. Documento escaneado limita seleção/busca por texto. |
| `pm-en-provas` | Pré-Militar | Acesso/conteúdo | PDF institucional Escola Naval CPAEN 2025, 19 páginas, HTTP 200; enunciados e alternativas de Matemática e Inglês extraídos. |
| `pm-eear-provas` | Pré-Militar | Acesso/conteúdo | PDF institucional EEAR CFS 1/2024, 17 páginas, HTTP 200; gabarito e questões. |
| `pm-eam-provas` | Pré-Militar | Parcial | PDF institucional CPAEAM 2023, 15 páginas, HTTP 200; extração reconheceu capa e questões, mas corpo de enunciados ficou incompleto por digitalização. Conferência visual detalhada pendente. |
| `pm-afa-provas` | Pré-Militar | Acesso/conteúdo | PDF oficial AFA 2025 versão A, 24 páginas, HTTP 200; 64 questões, disciplinas e redação. |
| `pm-epcar-provas` | Pré-Militar | Acesso/conteúdo | PDF oficial EPCAR 2026 versão A, 17 páginas, HTTP 200; 48 questões e redação. |
| `cecierj-aprovarj` | Pré-Militar | Parcial | Página oficial confirma curso gratuito, online, inscrição/cadastro obrigatório e ausência de certificado. Aulas atrás da conta não foram inspecionadas. |
| `pm-esa-provas-2026` | Pré-Militar | Bloqueado | PDF oficial ESA Área Geral 2026 teve texto extraído via Exa com questões, mas os navegadores Firecrawl e TinyFish falharam com ERR_CONNECTION_CLOSED. Não comprovado acesso público pelo naveg |
| `pm-ime-provas` | Pré-Militar | Acesso/conteúdo | PDF oficial IME CFG 2024/2025, 24 páginas, HTTP 200, 40 questões objetivas. |
| `mit-1801sc` | Ensino Superior | Acesso/conteúdo | Página MIT 18.01SC e Sessão 23 Linear Approximation abertas; texto didático e material de problemas visíveis, vídeos não reproduzidos. |
| `mit-801sc` | Ensino Superior | Parcial | Página MIT 8.01SC e introdução Semana 1 abertas, mas vídeo indicou incompatibilidade com leitor automatizado; reprodução não comprovada. |
| `mit-7012` | Ensino Superior | Parcial | Página MIT 7.012 e Lecture 1 abertas, mas player de vídeo indicou incompatibilidade com leitor; link de download disponível, reprodução não comprovada. |
| `yale-psyc-110` | Ensino Superior | Acesso/conteúdo | Curso Yale PSYC 110 e Lecture 1 abertos; transcrição de Psicologia pública e legível. |
| `yale-econ-252` | Ensino Superior | Acesso/conteúdo | Curso Yale ECON 252 e Lecture 1 abertos; texto/transcrição de Financial Markets pública e legível. |
| `ou-environment-treading-lightly` | Ensino Superior | Acesso/conteúdo | Open University, curso gratuito; Introduction, Learning Outcomes e seção 1 publicamente legíveis via Firecrawl. Declaração de PARTICIPAÇÃO exige conta/inscrição; não é certificado de conclus |
| `odin-foundations` | Tecnologia | Acesso/conteúdo | Odin Foundations e aula How Does the Web Work? legíveis sem login; conta opcional para acompanhamento. |
| `google-mlcc` | Tecnologia | Acesso/conteúdo | Google ML Crash Course e unidade Linear Regression abertas; conteúdo técnico gratuito legível. |
| `ms-learn-cloud-concepts` | Tecnologia | Browser anterior | Evidência anterior no navegador TinyFish: rota pt-BR, três módulos e primeira unidade legível sem login; aviso de tradução por IA. Certificado não comprovado. |

## Condições para mudar de NO-GO

1. **Resolver ESA** com link institucional navegável e caderno real comprovado, ou solicitar revisão editorial explícita de substituição. Um resultado de extração isolada não basta.
2. **Fechar as sete verificações parciais:** acessar aulas autenticadas com credenciais voluntariamente fornecidas via contexto de navegador, quando necessário; confirmar reprodução dos vídeos MIT/OBMEP, e legibilidade dos cadernos escaneados.
3. **Homologação interativa restante** conforme contrato do Gate B/C: verificar no navegador (não apenas extração) as demais ofertas e testar os destinos, redirecionamentos, mobile, acessibilidade, permissões de acesso e estados de cadastro/certificado sem inventar campos.
4. Trazer o parecer e as correções locais do Claude ao PR #38; manter o PR #38 em draft, baseado no PR #37, e não lançar enquanto não houver GO independente.
5. Na próxima auditoria, atualizar estados somente com **nova evidência datada por item**. Não sobrescrever resultados históricos do proxy da rodada anterior.

Este documento complementa o histórico, não altera os 60 registros canônicos, `COURSE_HOSTS`, flags de publicação, catálogo, sitemap ou deploy.
