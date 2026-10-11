# Official brands for "Aprenda com fontes oficiais" (V0.2)

Date: 2026-10-11. Scope: the Home section that names institutions whose free material the Academy points to.

## Rule

An organisation appears on the Home only when it has at least one resource that is

1. free to study (no trial, no paywall, no affiliate link),
2. verified on the provider's own page, with the date recorded (the promise made on `/sobre/`), and
3. published in the catalogue (`src/lib/learning-resources.ts`), so the name links to real content.

The Home never calls an organisation a partner, sponsor or supporter, and never suggests endorsement.
`scripts/verify-dist.mjs` fails the build if the Home's main content uses those words.
Logos are the supplied artwork in `src/assets/providers`, shown whole and unmodified (`ProviderMark`).
No logo is redrawn or fetched from an external API.

## Status

| Organisation | Status | Evidence | Shown as |
| --- | --- | --- | --- |
| Microsoft | Verified | *FluêncIA em Inteligência Artificial*, published by Fundação Bradesco with Microsoft; official page checked on 2026-10-11 (catalogue id `fluencia`). | "Fundação Bradesco + Microsoft", the catalogue's own name for the joint provider. Microsoft Learn entries (`ms-explore-genai`, `ms-azure-ai`) stay held back: no current pt-BR page with those titles was confirmed. |
| OpenAI | Pending | Candidate: OpenAI Academy (academy.openai.com). Found through a search index only. | Not shown. |
| Anthropic | Pending | Candidate: Anthropic Academy on Skilljar (anthropic.skilljar.com), e.g. *AI Fluency*. Found through a search index only. | Not shown. |
| Google | Pending | Candidate: Machine Learning Crash Course (developers.google.com/machine-learning/crash-course). Found through a search index only. | Not shown. |
| NVIDIA | Pending | Candidate: free self-paced courses from the Deep Learning Institute (nvidia.com/en-us/learn/training). Found through a search index only. | Not shown. |
| AWS | Pending | Candidate: AWS Skill Builder free tier, e.g. *Cloud Practitioner Essentials*. Found through a search index only. | Not shown. |
| IBM | Pending | Candidate: IBM SkillsBuild, e.g. *AI Fundamentals*. Found through a search index only. | Not shown. |

### Why the six are pending

From the environment this work was done in, every one of these official sites was unreachable
(proxy 403 / DNS failure). A search-index result is a lead, not verification: it does not show
the following on the provider's page today.

- whether the content is free;
- whether it is in a language a Brazilian student can use;
- whether a paid tier gates the lessons.

The secondary sources that surfaced the candidates were aihub.msstate.edu, the-decoder.com,
i-programmer.info, openculture.com, nvidia.com (training support), the AWS blog and zdnet.com.au.
None of them is the provider's own page.

### To publish one

1. Open the provider's page and confirm the four conditions above. Record the date.
2. Add the resource to the catalogue, with its subject, goals and a `verified` of method `official-page`.
3. Add the organisation's official logo as supplied, with permission or within its published brand
   guidelines, to `src/assets/providers`. Then map it in `src/lib/providers.ts`.
4. Add the provider name to the Home's list in `src/components/OfficialSources.astro`.

`institutions()` drops any name with no published resource, so step 2 is what makes it appear.
