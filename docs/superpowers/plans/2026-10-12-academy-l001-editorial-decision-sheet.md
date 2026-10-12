# Pexis Academy | L001 | Ficha de decisão editorial e gates de ativação

**Estado:** pacote para revisão humana, **nenhuma aprovação atribuída**.  
**Referência:** 12/10/2026, staging `feat/academy-gateb-typed-staging-v01` no commit `dc64f2eaba3f4a76672120ce303769980fe91d7a`.  
**Fontes técnicas:** [auditoria dos dez](../qa/2026-10-12-academy-lote-01-browser-audit.md), [rodada dos dez seguintes](../qa/2026-10-12-academy-next10-preflight.md), [últimos dezessete](../qa/2026-10-12-academy-final17-preflight.md) e [guia de publicação incremental](../../academy/operacao-publicacao-incremental.md).

**Contrato:** a triagem automatizada não assina `verified`, `approved`, `held`, ativação de caminho ou `authorization`. Um humano deve conferir a fonte exata em navegador comum, aprovar **o registro completo e seu digest** e autorizar **o lote exato em ato separado**. Este documento não é manifesto, não deve ser importado por `lots.ts` e não se torna publicável sozinho.

## 1. O que falta decidir, em ordem

1. **Revisão por recurso:** um responsável humano abre a URL exata, confirma a utilidade pedagógica, a etapa/série e o formato realmente acessível, a gratuidade, o idioma e a regra de cadastro e certificado. Registra data, observações e aprova ou retém **cada ID**.
2. **Metadados finais antes da assinatura:** caso o registro `src/lib/staging*.ts` tenha alegação imprecisa, corrigi-lo em PR próprio e atualizar as evidências. Só então calcular `digest`/esqueleto com `node --experimental-strip-types tools/academy-release.ts entry <id>`. Não reaproveitar digest de um registro editado.
3. **Decisão de ativação:** autorizar, separadamente, se `ensino-fundamental` e `pre-militar` devem passar de `preparing` para `active`, mesmo **sem** dez destaques. A decisão é independente do lote editorial; sua **implementação deve ser atômica** com a publicação de recursos exclusivos dessas páginas (seção 3).
4. **Autorização do lote real:** após as decisões por ID, aprovar o conteúdo **exato** do manifesto `L001-*.json` (`authorization.by/on`), distinto de revisar e aprovar os recursos.
5. **Release e deploy:** integrar apenas o PR tecnicamente válido após CI, QA do `dist/` e autorização de merge/deploy. Publicação efetiva não pode ser presumida apenas de um manifesto aprovado.

## 2. Candidatos do piloto reduzido (até 9)

Estado editorial desta tabela: **PENDENTE DE REVISÃO HUMANA** para todos os registros. Links de sessão abaixo são evidência **automatizada**, não inspeção pessoal do responsável.

| ID | Etapa | Fonte oficial exata | Evidência | Conferir antes de decidir |
|---|---|---|---|---|
| `ef-sme-alfabeto-1` | Fundamental · 1º ano | [SME: Nosso Alfabeto](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/lingua-portuguesa-nosso-alfabeto/) | [Navegador](https://agent.tinyfish.ai/runs/a5e61cdd-973c-41a6-ab77-33cee1bfee3c) | Atividade utilizável por criança, Wordwall/Drive, acessibilidade e privacidade externa; `registration`/`certificate` permanecem `unconfirmed` no registro |
| `ef-sme-funcoes-9` | Fundamental · 9º ano | [SME: Funções](https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/matematica-funcao-de-1o-e-de-2o-grau/) | [Navegador](https://agent.tinyfish.ai/runs/a0f88cc6-aed0-4525-ac5a-f06e32499d59) | Quatro exercícios e autonomia sem vídeo; a automação recebeu bloqueio anti-bot do YouTube, não evidência de vídeo quebrado; anexos |
| `ita-provas-anteriores` | Pré-Militar | [ITA: provas anteriores](https://vestibular.ita.br/provas.htm) | [Navegador](https://agent.tinyfish.ai/runs/89408ed8-f789-42d4-9c87-93bad65515ce) | Abrir, no telefone e desktop, uma prova e gabarito do mesmo ano (2024 verificados por extrator); não afirmar que todo acervo foi testado |
| `inep-enem-provas-gabaritos` | Vestibular | [INEP: provas e gabaritos](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos) | [Navegador](https://agent.tinyfish.ai/runs/7cc3daa8-1cfb-45dc-8df8-7cbfecc324f4) | Abas JavaScript, PDF da prova e gabarito 2025, teclado/mobile; as amostras não comprovam o acervo inteiro |
| `fuvest-acervo-2026` | Vestibular | [Fuvest: acervo 2026](https://www.fuvest.br/acervo-vestibular-2026/) | [Navegador](https://agent.tinyfish.ai/runs/544f2b7d-48c8-46a0-8f96-54bd64588a38) | PDF de prova V1 e gabarito da primeira fase, legibilidade móvel, ano e edição corretos |
| `mit-1801sc` | Superior | [MIT OCW: Single Variable Calculus](https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/) | [Navegador](https://agent.tinyfish.ai/runs/cc0987cd-b6b8-41a3-b290-8b822e09a7ae) | Abrir aula, notas e exame; identificar conteúdo em inglês, edição 2010, sem matrícula/crédito/certificado do MIT |
| `yale-psyc-110` | Superior | [Yale: Introduction to Psychology](https://oyc.yale.edu/introduction-psychology/psyc-110) | [Navegador](https://agent.tinyfish.ai/runs/f5679cf1-c877-4064-ae79-220eefa25107) | Aula 1 e transcrição em inglês, gravação de 2007, eventuais informações desatualizadas, sem crédito universitário |
| `odin-foundations` | Tecnologia | [The Odin Project: Foundations](https://www.theodinproject.com/paths/foundations/courses/foundations) | [Navegador](https://agent.tinyfish.ai/runs/e8621ca0-98a1-4852-992d-6df7666631be) | Lições e projeto sem cadastro para leitura; progresso não confirmado. **Linkar, nunca espelhar o currículo sem licença** |
| `ms-learn-cloud-concepts` | Tecnologia | [Microsoft Learn: conceitos de nuvem](https://learn.microsoft.com/pt-br/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/) | [Navegador](https://agent.tinyfish.ai/runs/f1ce30e4-f26b-47cb-b5a2-e0a5e78abc0f) | Primeiro módulo acessível em pt-BR, avisos de tradução por IA, não prometer certificação AZ-900 como certificado da trilha |

**Fora do piloto por padrão:** `pm-cn-provas` (Colégio Naval). O PDF oficial de 19 páginas teve resposta HTTP 200 em extração amostral, mas a visualização móvel, a camada de texto e a acessibilidade ainda não foram confirmadas. Não atribuir `held` sem decisão humana; simplesmente não incluí-lo entre os nove candidatos propostos.

**Registros de evidência:** para a decisão definitiva, anotar sempre fonte exata, data, pessoa e observações verificáveis; o `version` do manifesto deve identificar o relatório de QA realmente usado. Não aceitar assinatura de IA, valores `PREENCHER` ou digest desatualizado.

## 3. Dependência crítica de publicação × ativação de caminho

`placementOf()` em `src/lib/placement.ts` só oferece página canônica a recursos exclusivos de `ensino-fundamental` e `pre-militar` quando o respectivo `PATH_STATUS` está `active`. Recursos aprovados mas aplicados enquanto o caminho permanece `preparing` não encontram destino e `placementProblems()` rejeita o build. O inverso também falha: `activationProblems()` rejeita ativar esses caminhos sem pelo menos um recurso **publicado na própria página do caminho**.

**Portanto:** as duas decisões humanas continuam separadas, mas os respectivos efeitos no código devem compor **um único estado final testado**. Não fazer deploy de uma etapa intermediária que contenha apenas a publicação desses três recursos ou apenas a ativação de suas páginas. Não liberar `FEATURED_RELEASE` prematuramente: dez destaques homologados continuam sendo uma decisão posterior e independente.

**Plano A: piloto completo, condicionado a duas autorizações.** Se todos os nove IDs forem aprovados e os dois caminhos receberem autorização de ativação, aplicar os nove no mesmo PR/commit que muda `PATH_STATUS` para `active`, com espelhos `verify-dist`, guardas e QA. Resultado condicional: **37 → 46 recursos públicos**, duas novas páginas ativas e nenhum destaque liberado. O número real pode ser menor conforme decisões por ID.

**Plano B: iniciar pelas páginas já ativas, sem decidir ativação agora.** Se houver decisão de aprovar e publicar apenas os seis IDs de Vestibular, Superior e Tecnologia, eles podem ser candidatos a um lote menor (**37 → até 43**). Antes de autorizar, rodar `placementProblems`, testes e build porque trilhas e grupos condicionais precisam de espelhos e guardas atualizadas. Fundamental/Pré-Militar continuam em `preparing`, com seus três candidatos aguardando o próximo lote e sua ativação conjunta.

**Direção recomendada:** preferir Plano A se a revisão humana sustentar os nove recursos e a ativação dos dois caminhos; caso a conferência de mobile e materiais de menores atrase essas decisões, usar Plano B sem forçar duas páginas vazias. Em qualquer opção, um manifesto ainda não aplicado não publica recursos por si só.

## 4. Registro humano de decisão (modelo, sem assinaturas pré-preenchidas)

Responder no PR editorial com uma decisão por ID, por exemplo:

```text
ID: <exatamente um dos IDs da seção 2>
URL aberta: <URL exata do registro>
Data da conferência: <AAAA-MM-DD>
Decisão: approved | held
Pessoa responsável: <nome verdadeiro>
Evidência observada: <conteúdo, gratuidade, formato, etapa/idioma, cadastro, certificado se comprovado>
Ressalvas: <incluindo acessibilidade, vídeos/arquivos, licenças, conteúdo desatualizado>
```

Assinar `approved` significa aprovar o **registro completo com seu digest final**, não apenas considerar a página interessante. Uma pessoa pode reter um recurso sem bloquear os demais. A decisão de ativar `ensino-fundamental` e `pre-militar` deve ser registrada à parte e ser explícita, assim como a autorização do manifesto exato de publicação e do deploy.

**Ainda não autorizado neste documento:** decisões dos nove, ativação de caminhos, registro de manifesto, aplicação em `release.json`, atualização de `ledger`/`inventory`, merge do PR #37 à `main` ou deploy.
