// Gate B review 05, October 12, 2026: 14 typed resources not yet in the public catalogue.
// They complete the 60-slot *research selection* together with 23 existing STAGED_RESOURCES
// and 23 already-published legacy records. Do not duplicate any of those records here.
//
// The previous PARTIAL_VERIFICATIONS for Colégio Naval, Escola Naval and EEAR remain an
// immutable historical snapshot of the earlier attempt to access attachments. Their verified
// PDFs are represented *here* as distinct typed candidates, still unpublished.
//
// No production page/component/route imports this file. Publication requires independent
// editorial approval, placement, host allowlist updates, full QA and a separate release.
import type { LearningResource } from './learning-resources.ts';

export const GATEB_ADDITIONS_AUTHORIZE_PUBLICATION = false as const;

export const GATEB_NEW_RESOURCES: readonly LearningResource[] = [
  {
    "id": "cecierj-pvs-portugues-v1",
    "title": "Língua Portuguesa, Volume 1 (Pré-Vestibular Cecierj)",
    "provider": "Fundação Cecierj",
    "subject": "portugues",
    "format": "reference",
    "paths": [
      "vestibulares"
    ],
    "language": "pt",
    "level": "vestibular",
    "url": "https://canal.cecierj.edu.br/042022/a205887b2635b3f593ce443d1603fa7d.pdf",
    "registration": "unconfirmed",
    "certificate": "unconfirmed",
    "verified": {
      "on": "2026-10-11",
      "by": "official-page",
      "freeAccess": true,
      "evidence": {
        "url": "https://canal.cecierj.edu.br/042022/a205887b2635b3f593ce443d1603fa7d.pdf",
        "checked": [
          "free",
          "scope",
          "language",
          "format",
          "path"
        ],
        "note": "PDF institucional integral aberto em 11/10/2026; 162 páginas, material didático de Língua Portuguesa publicado pela Fundação Cecierj em 2021. Texto, leitura, coesão e exercícios; referência de estudo, não banco de questões da UERJ nem curso completo. O documento acessado sem autenticação comprova conteúdo gratuito; requisitos de cadastro e certificado não foram verificados individualmente."
      }
    }
  },
  {
    "id": "cecierj-pvs-matematica-mod1",
    "title": "Matemática, Módulo 1 (Pré-Vestibular Social)",
    "provider": "Fundação Cecierj",
    "subject": "matematica",
    "format": "reference",
    "paths": [
      "vestibulares"
    ],
    "language": "pt",
    "level": "vestibular",
    "url": "https://canal.cecierj.edu.br/122016/efcafab1e59a9c49c5244cbbdc982539.pdf",
    "registration": "unconfirmed",
    "certificate": "unconfirmed",
    "verified": {
      "on": "2026-10-11",
      "by": "official-page",
      "freeAccess": true,
      "evidence": {
        "url": "https://canal.cecierj.edu.br/122016/efcafab1e59a9c49c5244cbbdc982539.pdf",
        "checked": [
          "free",
          "scope",
          "language",
          "format",
          "path"
        ],
        "note": "PDF integral de 118 páginas aberto em 11/10/2026; módulo de 2015 da Fundação Cecierj com números, funções, combinatória, probabilidade e exercícios. Material de referência, não prova da UERJ. O documento acessado sem autenticação comprova conteúdo gratuito; requisitos de cadastro e certificado não foram verificados individualmente."
      }
    }
  },
  {
    "id": "cecierj-pvs-historia-mod2",
    "title": "História, Módulo 2 (Pré-Vestibular Social)",
    "provider": "Fundação Cecierj",
    "subject": "historia",
    "format": "reference",
    "paths": [
      "vestibulares"
    ],
    "language": "pt",
    "level": "vestibular",
    "url": "https://canal.cecierj.edu.br/122016/d0522fa0af463530f6629b02000952d5.pdf",
    "registration": "unconfirmed",
    "certificate": "unconfirmed",
    "verified": {
      "on": "2026-10-11",
      "by": "official-page",
      "freeAccess": true,
      "evidence": {
        "url": "https://canal.cecierj.edu.br/122016/d0522fa0af463530f6629b02000952d5.pdf",
        "checked": [
          "free",
          "scope",
          "language",
          "format",
          "path"
        ],
        "note": "PDF institucional de 128 páginas aberto em 11/10/2026; apostila de 2015 sobre Guerras Mundiais, Guerra Fria e Américas, com conteúdo integral. Material de referência, não questões comentadas da UERJ. O documento acessado sem autenticação comprova conteúdo gratuito; requisitos de cadastro e certificado não foram verificados individualmente."
      }
    }
  },
  {
    "id": "cecierj-pvs-geografia-mod1",
    "title": "Geografia, Módulo 1 (Pré-Vestibular Social)",
    "provider": "Fundação Cecierj",
    "subject": "geografia",
    "format": "reference",
    "paths": [
      "vestibulares"
    ],
    "language": "pt",
    "level": "vestibular",
    "url": "https://canal.cecierj.edu.br/122016/91e80944820052a74356bfa1fc1b6489.pdf",
    "registration": "unconfirmed",
    "certificate": "unconfirmed",
    "verified": {
      "on": "2026-10-11",
      "by": "official-page",
      "freeAccess": true,
      "evidence": {
        "url": "https://canal.cecierj.edu.br/122016/91e80944820052a74356bfa1fc1b6489.pdf",
        "checked": [
          "free",
          "scope",
          "language",
          "format",
          "path"
        ],
        "note": "PDF integral de 126 páginas aberto em 11/10/2026; apostila de 2015 da Fundação Cecierj com industrialização, urbanização, globalização e exercícios do Enem. Material de referência, não banco de questões da UERJ. O documento acessado sem autenticação comprova conteúdo gratuito; requisitos de cadastro e certificado não foram verificados individualmente."
      }
    }
  },
  {
    "id": "cecierj-pvs-fisica-v1",
    "title": "Física, Volume 1 (Pré-Vestibular Cecierj)",
    "provider": "Fundação Cecierj",
    "subject": "fisica",
    "format": "reference",
    "paths": [
      "vestibulares"
    ],
    "language": "pt",
    "level": "vestibular",
    "url": "https://canal.cecierj.edu.br/042022/cad642065613839097b51486f3ec3eec.pdf",
    "registration": "unconfirmed",
    "certificate": "unconfirmed",
    "verified": {
      "on": "2026-10-11",
      "by": "official-page",
      "freeAccess": true,
      "evidence": {
        "url": "https://canal.cecierj.edu.br/042022/cad642065613839097b51486f3ec3eec.pdf",
        "checked": [
          "free",
          "scope",
          "language",
          "format",
          "path"
        ],
        "note": "PDF integral de 188 páginas aberto em 11/10/2026; volume de Física de 2021 da Fundação Cecierj, com cinemática, movimentos e exercícios. Material de referência, não simulador/questões da UERJ. O documento acessado sem autenticação comprova conteúdo gratuito; requisitos de cadastro e certificado não foram verificados individualmente."
      }
    }
  },
  {
    "id": "pm-cn-provas",
    "title": "CPACN 2025: Matemática e Inglês, 1º dia",
    "provider": "Marinha do Brasil / SSPM",
    "subject": null,
    "format": "past-exam",
    "paths": [
      "pre-militar"
    ],
    "language": "pt",
    "level": "exam-prep",
    "url": "https://assets.marinha.mil.br/sspm/sites/www.marinha.mil.br.sspm/files/provas/CPACN%201DIA%20AMARELO.pdf",
    "registration": "not-required",
    "certificate": "unconfirmed",
    "verified": {
      "on": "2026-10-12",
      "by": "official-page",
      "freeAccess": true,
      "evidence": {
        "url": "https://assets.marinha.mil.br/sspm/sites/www.marinha.mil.br.sspm/files/provas/CPACN%201DIA%20AMARELO.pdf",
        "checked": [
          "free",
          "scope",
          "language",
          "format",
          "path",
          "registration"
        ],
        "note": "CPACN 2025: prova amarela do 1º dia de Matemática e Inglês; enunciados e alternativas abertos no PDF, não apenas índice. Caderno PDF institucional inspecionado em 12/10/2026 (5 página(s) amostrada(s) de 19). Acesso direto sem cadastro; oferta de certificado não comprovada."
      }
    }
  },
  {
    "id": "pm-en-provas",
    "title": "CPAEN 2025: Matemática e Inglês, 1º dia",
    "provider": "Marinha do Brasil / SSPM",
    "subject": null,
    "format": "past-exam",
    "paths": [
      "pre-militar"
    ],
    "language": "pt",
    "level": "exam-prep",
    "url": "https://www.inscricao.marinha.mil.br/marinha/CPAEN%20D1%20Amarela.pdf?id_file=8961",
    "registration": "not-required",
    "certificate": "unconfirmed",
    "verified": {
      "on": "2026-10-12",
      "by": "official-page",
      "freeAccess": true,
      "evidence": {
        "url": "https://www.inscricao.marinha.mil.br/marinha/CPAEN%20D1%20Amarela.pdf?id_file=8961",
        "checked": [
          "free",
          "scope",
          "language",
          "format",
          "path",
          "registration"
        ],
        "note": "CPAEN 2025: prova amarela do 1º dia de Matemática e Inglês; PDF independente no sistema oficial, sem afirmar que o ZIP foi aberto. Caderno PDF institucional inspecionado em 12/10/2026 (4 página(s) amostrada(s) de 19). Acesso direto sem cadastro; oferta de certificado não comprovada."
      }
    }
  },
  {
    "id": "pm-eear-provas",
    "title": "EEAR CFS 1/2024: prova, código 02",
    "provider": "Escola de Especialistas de Aeronáutica",
    "subject": null,
    "format": "past-exam",
    "paths": [
      "pre-militar"
    ],
    "language": "pt",
    "level": "exam-prep",
    "url": "https://ingresso.eear.fab.mil.br/SOO/escolaridade/CFS%201%202024/prova_cfs%201%202024_cod_02_03%2007%202023%2010%2013%2002.pdf",
    "registration": "not-required",
    "certificate": "unconfirmed",
    "verified": {
      "on": "2026-10-12",
      "by": "official-page",
      "freeAccess": true,
      "evidence": {
        "url": "https://ingresso.eear.fab.mil.br/SOO/escolaridade/CFS%201%202024/prova_cfs%201%202024_cod_02_03%2007%202023%2010%2013%2002.pdf",
        "checked": [
          "free",
          "scope",
          "language",
          "format",
          "path",
          "registration"
        ],
        "note": "EEAR CFS 1/2024, código 02: o PDF contém gabarito e questões de Português, Inglês, Matemática e Física, efetivamente inspecionadas. Caderno PDF institucional inspecionado em 12/10/2026 (3 página(s) amostrada(s) de 17). Acesso direto sem cadastro; oferta de certificado não comprovada."
      }
    }
  },
  {
    "id": "pm-eam-provas",
    "title": "CPAEAM 2023: prova amarela",
    "provider": "Marinha do Brasil / SSPM",
    "subject": null,
    "format": "past-exam",
    "paths": [
      "pre-militar"
    ],
    "language": "pt",
    "level": "exam-prep",
    "url": "https://assets.marinha.mil.br/sspm/sites/www.marinha.mil.br.sspm/files/provas/CPAEAM-2023-PROVA%20AMARELA.pdf",
    "registration": "not-required",
    "certificate": "unconfirmed",
    "verified": {
      "on": "2026-10-12",
      "by": "official-page",
      "freeAccess": true,
      "evidence": {
        "url": "https://assets.marinha.mil.br/sspm/sites/www.marinha.mil.br.sspm/files/provas/CPAEAM-2023-PROVA%20AMARELA.pdf",
        "checked": [
          "free",
          "scope",
          "language",
          "format",
          "path",
          "registration"
        ],
        "note": "CPAEAM 2023: prova amarela em PDF com questões de Matemática, Português, Ciências e Inglês; texto e perguntas verificados. Caderno PDF institucional inspecionado em 12/10/2026 (5 página(s) amostrada(s) de 15). Acesso direto sem cadastro; oferta de certificado não comprovada."
      }
    }
  },
  {
    "id": "pm-afa-provas",
    "title": "AFA 2025: prova versão A",
    "provider": "Força Aérea Brasileira",
    "subject": null,
    "format": "past-exam",
    "paths": [
      "pre-militar"
    ],
    "language": "pt",
    "level": "exam-prep",
    "url": "https://www.fab.mil.br/ingresso/arquivos/2024/afa/afa2025_prova_versao_a.pdf",
    "registration": "not-required",
    "certificate": "unconfirmed",
    "verified": {
      "on": "2026-10-12",
      "by": "official-page",
      "freeAccess": true,
      "evidence": {
        "url": "https://www.fab.mil.br/ingresso/arquivos/2024/afa/afa2025_prova_versao_a.pdf",
        "checked": [
          "free",
          "scope",
          "language",
          "format",
          "path",
          "registration"
        ],
        "note": "AFA 2025: prova versão A, 64 questões de Português, Matemática, Inglês e Física, mais Redação; documento oficial extraído. Caderno PDF institucional inspecionado em 12/10/2026 (3 página(s) amostrada(s) de 24). Acesso direto sem cadastro; oferta de certificado não comprovada."
      }
    }
  },
  {
    "id": "pm-epcar-provas",
    "title": "EPCAR 2026: prova versão A",
    "provider": "Força Aérea Brasileira / EPCAR",
    "subject": null,
    "format": "past-exam",
    "paths": [
      "pre-militar"
    ],
    "language": "pt",
    "level": "exam-prep",
    "url": "https://www.fab.mil.br/ingresso/arquivos/2025/cpcar/cpcar-2026-08-05-2025-P1-vers%C3%A3o-A.pdf",
    "registration": "not-required",
    "certificate": "unconfirmed",
    "verified": {
      "on": "2026-10-12",
      "by": "official-page",
      "freeAccess": true,
      "evidence": {
        "url": "https://www.fab.mil.br/ingresso/arquivos/2025/cpcar/cpcar-2026-08-05-2025-P1-vers%C3%A3o-A.pdf",
        "checked": [
          "free",
          "scope",
          "language",
          "format",
          "path",
          "registration"
        ],
        "note": "EPCAR 2026: prova versão A, 48 questões de Inglês, Matemática e Português, mais Redação; PDF oficial inspecionado. Caderno PDF institucional inspecionado em 12/10/2026 (3 página(s) amostrada(s) de 17). Acesso direto sem cadastro; oferta de certificado não comprovada."
      }
    }
  },
  {
    "id": "cecierj-aprovarj",
    "title": "AprovaRJ: preparação para concursos militares",
    "provider": "Fundação Cecierj",
    "subject": null,
    "format": "course",
    "paths": [
      "pre-militar"
    ],
    "language": "pt",
    "level": "exam-prep",
    "url": "https://extensao.cecierj.edu.br/cursos/aprovarj/",
    "registration": "required",
    "certificate": "none",
    "verified": {
      "on": "2026-10-12",
      "by": "official-page",
      "freeAccess": true,
      "evidence": {
        "url": "https://extensao.cecierj.edu.br/cursos/aprovarj/",
        "checked": [
          "free",
          "scope",
          "language",
          "format",
          "path",
          "registration",
          "certificate"
        ],
        "note": "Diretoria de Extensão Cecierj: a página institucional reaberta em 12/10/2026 declara curso online gratuito, cadastro obrigatório, preparação para concursos militares e ausência de certificado. O ambiente autenticado não foi inspecionado."
      }
    }
  },
  {
    "id": "pm-esa-provas-2026",
    "title": "ESA, concurso 2026: prova Geral, tipo A",
    "provider": "Escola de Sargentos das Armas / Exército Brasileiro",
    "subject": null,
    "format": "past-exam",
    "paths": [
      "pre-militar"
    ],
    "language": "pt",
    "level": "exam-prep",
    "url": "https://esa.eb.mil.br/images/SCA/Prova-Geral_2026.pdf",
    "registration": "not-required",
    "certificate": "unconfirmed",
    "verified": {
      "on": "2026-10-12",
      "by": "official-page",
      "freeAccess": true,
      "evidence": {
        "url": "https://esa.eb.mil.br/images/SCA/Prova-Geral_2026.pdf",
        "checked": [
          "free",
          "scope",
          "language",
          "format",
          "path",
          "registration"
        ],
        "note": "ESA 2026, Área Geral, tipo A: prova de 24 páginas, com enunciados de Matemática, Português e outras disciplinas. Substituição explícita da EsPCEx bloqueada, distinta do curso AprovaRJ. Caderno PDF institucional inspecionado em 12/10/2026 (3 página(s) amostrada(s) de 24). Acesso direto sem cadastro; oferta de certificado não comprovada."
      }
    }
  },
  {
    "id": "pm-ime-provas",
    "title": "IME CFG 2024/2025: prova objetiva",
    "provider": "Instituto Militar de Engenharia / Exército Brasileiro",
    "subject": null,
    "format": "past-exam",
    "paths": [
      "pre-militar"
    ],
    "language": "pt",
    "level": "exam-prep",
    "url": "https://www.ime.eb.mil.br/images/arquivos/admissao/cfg/provas-anteriores/2024-2025/CFG_Objetiva_24_25.pdf",
    "registration": "not-required",
    "certificate": "unconfirmed",
    "verified": {
      "on": "2026-10-12",
      "by": "official-page",
      "freeAccess": true,
      "evidence": {
        "url": "https://www.ime.eb.mil.br/images/arquivos/admissao/cfg/provas-anteriores/2024-2025/CFG_Objetiva_24_25.pdf",
        "checked": [
          "free",
          "scope",
          "language",
          "format",
          "path",
          "registration"
        ],
        "note": "IME CFG 2024/2025: caderno objetivo oficial de 24 páginas, 40 questões; PDF aberto apesar de falha na página HTML do índice. Caderno PDF institucional inspecionado em 12/10/2026 (5 página(s) amostrada(s) de 24). Acesso direto sem cadastro; oferta de certificado não comprovada."
      }
    }
  }
];
