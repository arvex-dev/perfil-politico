# 02 – Extração e simulação de testes políticos (fase 2)

Escopo: 4 testes abertos extraídos e reimplementados, respondidos por 6 personas com perfil único de posições.
**PolitiScale não foi feito**: não há repositório público do código nem das 117 perguntas (site fora do ar / listado como descontinuado), então não dá para extrair de forma fiel. O "12 Axes" original de politicaltests.github.io (em inglês, derivado do 9Axes) ficou de fora; o 12axes simulado é o brasileiro da Vercel.

Reprodução: `node dados/scripts/extract.mjs <dir_src>` (parse, sem executar código baixado), `node dados/scripts/simulate.mjs`, `node dados/scripts/vieses.mjs`, `node dados/scripts/classificar.mjs`. Os repositórios foram clonados (`--depth 1`) em pasta temporária; nada foi executado deles.

## Fontes e arquivos

| Teste | Fonte (commit) | Dados extraídos |
|---|---|---|
| 12axes (PT-BR, Vercel) | github.com/RomanCypherpunk/12axes `d77c8f6f`; site 12axes.vercel.app (o HTML do site aponta para este repo) | `dados/12axes/` questions, axes, archetype-questions, ideologies (273), countries (309), personalities (645), source |
| 8values | github.com/8values/8values.github.io `3971ed8b` | `dados/8values/` questions (70), ideologies (52) |
| 9Axes | github.com/9axes/9axes.github.io `7704f107` | `dados/9axes/` questions (216 = 9 eixos × 8 níveis × 3), axes, ideologies (52, mesma lista do 8values) |
| SapplyValues | github.com/SapplyValues/SapplyValues.github.io `cf2554cb` | `dados/sapplyvalues/` questions (46) |

Os mapeamentos persona→resposta ficam em `dados/scripts/mapeamentos/*.json`; as personas em `dados/scripts/personas.json`. Resultados em `dados/resultados/<teste>-<persona>.json` (respostas + resultado completo) e `_resumo.json`, `_vieses.json`.

## Personas e método de resposta

Cada persona é um vetor de 17 posições em [-1, 1] (estatismo, redistribuição, protecionismo, nacionalismo, multilateralismo, militarismo, projeção externa, autoridade/ordem, democracia, federalismo, conservadorismo moral, religião pública, restrição à imigração, ambientalismo, tecno-otimismo, armas, liberalização de drogas). Cada pergunta recebe uma etiqueta (ex.: `est+,red+`, ou `fed-`; sufixo `~` = enunciado extremo). A atitude é a média das posições com sinal; a resposta (5 pontos) é `atitude − limiar` (limiar 0,1; 0,55 se extremo) quebrada em ≥0,45 CT, ≥0,15 C, >−0,15 N, >−0,45 D, senão DT. No 9Axes o limiar cresce com a "extremidade" do enunciado (nível do item). Atenção: os mapeamentos são julgamento do autor; mudar uma etiqueta muda o resultado.

Personas: P1 esquerda nacional-desenvolvimentista, P2 social-democrata/centro-esquerda urbana, P3 centro liberal (mercado + costumes progressistas), P4 centro-direita liberal na economia e moderada nos costumes, P5 direita conservadora religiosa, P6 direita libertária.

## 12axes (RomanCypherpunk)

- **Perguntas**: pool de 240 (20 por eixo, 10 por polo, peso 1) + 5 perguntas de "arquétipo" de múltipla escolha; formatos 36/60/240. Simulado o formato completo (240 + 5).
- **Escala**: CT 1,00; C 0,75; N 0,50; D 0,25; DT 0,00.
- **Eixos (polo esq. | polo dir.)**: Estrutura (Federal | Unitário), Representação (Democracia | Autocracia), Poder (Segurança | Liberdade), Imigração (Assimilação | Multicultura), Diplomacia (Militarista | Pacifista), Intervenção (Não intervencionista | Nacionalista), Economia (Público | Privado), Controle (Planejamento | Mercado), Comércio (Protecionismo | Globalismo), Religião (Irreligioso | Religioso), Moral (Progressista | Tradicionalista), Tecnologia (Tecnologia | Biologia).
- **Fórmula do eixo**: `t_i ∈ {1,.75,.5,.25,0}`; `s_i = t_i` se a pergunta tem `agreePole=LEFT`, senão `1 − t_i`. Arquétipo: cada efeito `(eixo, v)` entra como uma resposta extra com `s = v/100`. `L_a = 100 · Σ s_i w_i / Σ w_i` (0,5 se vazio), arredondado a 0,1. O vetor do usuário é `L_a` (polo esquerdo = 100). Intensidade: |L−50| <7,5 equilibrado; <22,5 inclinado; <37,5 forte; senão muito forte.
- **Compatibilidade com cada perfil** (12 eixos, `u` usuário, `t` perfil, centro 50): `C = 0,42·A + 0,33·D + 0,18·M + 0,07·O`, com
  - `A = (100/12) Σ max(0, 1−(|u−t|/50)²) · f` onde `f = 1 − 0,45·tanh(|u−50|/25)·tanh(|t−50|/25)` se u e t estão em lados opostos do centro, senão 1;
  - `D = 50 + 50·(u′·t′ + 768)/√((|u′|²+768)(|t′|²+768))`, com `u′=u−50`, `t′=t−50` (cosseno "aumentado", 768 = 12·8²);
  - `M = 100 − 2·| mean|u′| − mean|t′| |`;  `O = 100·max(0, 1 − (max|u−t|/100)^2,5)`.
  Cada catálogo é ranqueado separadamente (top 4 ideologias, 3 países, 8 personalidades) e mostra também um percentil dentro do catálogo.
- **Referências**: 273 ideologias, 309 países/regiões/regimes históricos, 645 personalidades, 203 partidos (não usados aqui), vetores de 12 valores auditados pelos autores.

## 8values

- **Perguntas**: 70, cada uma com efeito (−10..+10) em até 4 eixos. Escala: CT +1; C +0,5; N 0; D −0,5; DT −1.
- **Eixos**: Econômico (Igualdade | Mercado/riqueza), Diplomático (Paz/Globalismo | Nação/Poder), Civil (Liberdade | Autoridade), Social (Progresso | Tradição).
- **Fórmula**: `max_k = Σ_q |ef_{q,k}|`, `S_k = Σ_q m_q · ef_{q,k}`, `score_k = 100·(max_k + S_k)/(2·max_k)` (0..100; econ=igualdade, dipl=paz, govt=liberdade, scty=progresso). Rótulos por faixas (>90, >75, >60, ≥40, ≥25, ≥10, ≥0).
- **Ideologia**: 52 ideologias com 4 estatísticas; menor `d = |Δecon|² + |Δgovt|² + |Δdipl|^1,73856 + |Δscty|^1,73856`. Não há figuras nem países.

## 9Axes

- **Perguntas**: pool de 216 (9 eixos × 8 níveis de intensidade × 3 variantes). O quiz padrão (45) sorteia por eixo 5 níveis `[1,2,3,5,7]` (c=verdadeiro) ou `[7,6,5,3,1]`, uma variante ao acaso; `fullquiz` usa as 216. Escala: CT +2, C +1, N 0, D −1, DT −2.
- **Eixos (esq. | dir.)**: Federal | Unitário; Democrático | Autoritário; Globalista | Isolacionista; Militarista | Pacifista; Segurança | Liberdade; Igualdade | Mercados; Secular | Religioso; Progressista | Tradicional; Assimilacionista | Multiculturalista.
- **Fórmula**: `S_a = Σ m_q · sinal_q` (+1 níveis 0–3, −1 níveis 4–7; a intensidade não pondera); padrão: `score = 50 + 5·S_a`; full: `50 + S_a`. A ideologia usa as mesmas 52 do 8values, mas casa econ com o eixo Igualdade, govt com o eixo **Democrático**, dipl com **Globalista**, scty com **Progressista** (a mesma distância do 8values). Ou seja, o eixo "Liberdade/Segurança" nunca entra no match e o eixo democrático é lido como "liberdade".
- Simulado: full (216) e padrão nas duas versões de sorteio (c1 e c0, variante 0).

## SapplyValues

- **Perguntas**: 46, efeito ±1 em um único eixo (right 15, auth 15, prog 16). Escala como no 8values.
- **Eixos**: Esquerda | Direita, Libertário | Autoritário, Conservador | Progressista (sinal: right=+ é direita).
- **Fórmula**: `pct_k = 10 · Σ m_q e_{q,k} / Σ |e_{q,k}|` ∈ [−10, 10]. Sem ideologia, país ou figura, só a bússola 3D.

## Resultados (persona × teste)

### 12axes – vetor (polo esquerdo = 100; ordem: Estrutura, Representação, Poder, Imigração, Diplomacia, Intervenção, Economia, Controle, Comércio, Religião, Moral, Tecnologia)

| persona | Est | Rep | Pod | Imi | Dip | Int | Eco | Con | Com | Rel | Mor | Tec |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| P1 | 34,3 | 99 | 53,2 | 50,7 | 50,5 | 40 | 97,2 | 97,2 | 97,9 | 61,2 | 65,7 | 70,1 |
| P2 | 60,5 | 99 | 29,4 | 16,4 | 9,9 | 72,1 | 75 | 67,4 | 39,5 | 94 | 96,7 | 59,5 |
| P3 | 68,8 | 99 | 33 | 24,8 | 25,2 | 64,9 | 28 | 20,6 | 5,3 | 94 | 93,1 | 76 |
| P4 | 66,4 | 99 | 65,1 | 58,8 | 50,5 | 42,4 | 11,3 | 6,3 | 18,4 | 37,7 | 38,4 | 72,5 |
| P5 | 42,6 | 87 | 83 | 94,4 | 77,9 | 13,8 | 17,2 | 14,7 | 64,9 | 2,1 | 1,8 | 48,8 |
| P6 | 95 | 82,9 | 5,1 | 36,4 | 31,2 | 83,9 | 3 | 1,6 | 3 | 70,7 | 57,4 | 93,7 |

Nota de leitura: Imigração 94,4 de P5 = polo esquerdo (assimilação). Religião 2,1 de P5 = polo direito (religioso).

| persona | ideologia #1 (compat.) | país #1 | figura #1 | compat. ideologias min / mediana / máx |
|---|---|---|---|---|
| P1 | Populismo de Esquerda (91,4) | Segunda República Espanhola (90,6) | Jawaharlal Nehru (93,4); depois Marighella, Celso Furtado | 32,6 / 65 / 91,4 |
| P2 | Tecnoprogressismo (96,8) | País de Gales (94,4) | Bertrand Russell (97) | 27,8 / 59,8 / 96,8 |
| P3 | Liberalismo Clássico (94,5) | São Paulo (Brasil) (89,3) | Hal Finney (95,2) | 19,4 / 56,2 / 94,5 |
| P4 | Conservadorismo Reaganista (91,7) | Goiás (Brasil) (95,7) | Rupert Murdoch (94,8); Zema 93,4 | 34,3 / 59,9 / 91,7 |
| P5 | Nacionalismo de Direita (86,8) | Alabama (EUA) (90,7) | Flávio Bolsonaro (91,4) | 26,8 / 55,3 / 86,8 |
| P6 | Libertarianismo (98,7) | New Hampshire (EUA) (90,3) | Murray Rothbard (98,5) | 22,2 / 51,8 / 98,7 |

### 8values (valores 0–100: Igualdade, Paz, Liberdade, Progresso)

| persona | Econ | Dipl | Govt | Scty | Rótulos | Ideologia |
|---|---|---|---|---|---|---|
| P1 | 87,8 | 41,1 | 48,8 | 62,6 | Socialist / Balanced / Moderate / Progressive | Democratic Socialism |
| P2 | 77,6 | 85 | 82,4 | 94,3 | Socialist / Internationalist / Libertarian / Revolutionary | Libertarian Socialism |
| P3 | 38,5 | 81,7 | 82,4 | 86,1 | Market / Internationalist / Libertarian / Very Progressive | Libertarianism |
| P4 | 20,5 | 49,4 | 51,2 | 48,1 | Capitalist / Balanced / Moderate / Neutral | Neo-Liberalism |
| P5 | 14,7 | 12,2 | 21,9 | 5,6 | Capitalist / Nationalist / Authoritarian / Reactionary | Capitalist Fascism |
| P6 | 12,2 | 46,1 | 72,3 | 55,9 | Capitalist / Balanced / Liberal / Neutral | Libertarian Capitalism |

### 9Axes (polo esquerdo = 100; ordem: Fed, Dem, Glob, Mil, Seg, Igual, Secular, Prog, Assim)

| persona | full (216) | padrão c1 (45) | ideologia full / padrão c1 / padrão c0 |
|---|---|---|---|
| P1 | 35 86 17 50 50 95 65 71 50 | 35 90 15 55 55 100 65 75 55 | Anarcho-Communism / Anarcho-Communism / Anarcho-Communism |
| P2 | 65 95 74 18 26 74 89 86 26 | 65 100 80 20 20 80 95 90 25 | Libertarian Socialism / Anarcho-Syndicalism / Libertarian Socialism |
| P3 | 71 92 83 30 31 35 86 84 29 | 75 95 85 35 30 35 90 85 30 | Libertarianism / Libertarianism / Social Libertarianism |
| P4 | 71 89 65 55 69 26 44 63 56 | 75 95 65 55 70 25 45 60 60 | Libertarian Capitalism / Market Anarchism / Libertarianism |
| P5 | 50 74 17 69 92 26 5 19 86 | 55 80 15 65 95 25 5 20 90 | Moderate Conservatism / Objectivism / Anarcho-Egoism |
| P6 | 92 71 56 28 13 5 71 68 35 | 95 75 60 35 20 5 75 65 35 | Libertarian Capitalism ×3 |

### SapplyValues (−10 a +10)

| persona | Direita(+) | Autoritário(+) | Progressista(+) | Quadrante |
|---|---|---|---|---|
| P1 | −10 | 2,33 | 2,19 | Esquerda / Autoritário / Progressista |
| P2 | −7,67 | −4,33 | 9,38 | Esquerda / Libertário / Progressista |
| P3 | 2,33 | −4 | 8,75 | Direita / Libertário / Progressista |
| P4 | 7,33 | 2 | −1,87 | Direita / Autoritário / Conservador |
| P5 | 7,33 | 6,67 | −8,75 | Direita / Autoritário / Conservador |
| P6 | 10 | −9,67 | 3,44 | Direita / Libertário / Progressista |

## Observações da simulação

- Respostas e vetores completos estão nos JSON de `resultados/`. Os resultados dependem dos mapeamentos; a leitura confiável é qualitativa (padrões que se repetem entre personas), não o valor de cada casa.
- Dois detalhes confirmados lendo o código: (i) o 9Axes padrão tem 3 itens de um polo e 2 do outro por eixo (concordar com tudo dá 60 em todos os eixos); (ii) o 12axes é exatamente balanceado (concordar com tudo, discordar de tudo ou ficar neutro dá 50 em todos os eixos).
