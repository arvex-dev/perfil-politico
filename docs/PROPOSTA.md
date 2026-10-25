# Proposta: teste político calibrado para o Brasil e a América do Sul (Fase 5)

Base: inventário ([pesquisa/01](pesquisa/01-inventario.md)), extração e simulação de 12axes, 8values, 9Axes e
SapplyValues ([pesquisa/02](pesquisa/02-extracao-simulacao.md)), diagnóstico de viés ([pesquisa/03](pesquisa/03-diagnostico-vies.md))
e fontes acadêmicas ([pesquisa/04](pesquisa/04-base-academica.md)). Tabelas completas, geradas dos JSON:
[TABELAS.md](TABELAS.md). Escolhas e motivos: [../DECISOES.md](../DECISOES.md).

## O que a pesquisa mostrou e como a proposta responde

| Problema encontrado | Onde | Resposta aqui |
|---|---|---|
| Temas brasileiros ausentes (corrupção, segurança, Petrobras, Bolsa Família, STF, EUA/China, Mercosul) | 8values, 9Axes, Sapply quase sem nada; 12axes cobre a maioria, mas não corrupção nem Mercosul | 12 eixos com itens sobre todos esses temas; corrupção entra pelo eixo Instituições ("sistema corrompido", STF, imprensa, urnas) |
| Afinidade que dá ~90% para todo mundo | 12axes: 87–99% para as 6 personas, mediana de 83% com respostas aleatórias | Afinidade = 100 − RMS; teste automatizado garante 0 de 200 perfis aleatórios acima de 90% |
| Viés de concordância | 9Axes: concordar com tudo dá 60 em todos os eixos; 8values: 37,5 em Civil | 3 itens em cada sentido por eixo; concordar com tudo dá 0 (teste automatizado) |
| Normalização que satura e rotula mal | 8values: conservador religioso cai em "Capitalist Fascism" | Score linear simples, sem pesos assimétricos; catálogo com conservadorismo religioso, democracia cristã, centrismo e social-democracia |
| Centro mal representado | 12axes: top 10 do centro liberal = 7 libertários | Centrismo, tecnocracia liberal, social-liberalismo, democracia cristã; 10 figuras de centro |
| Referências sem América Latina | 8values/9Axes/Sapply: 0 ideologias, países ou figuras latino-americanos | 48 de 61 figuras e 13 de 30 países da América Latina; correntes locais (nacional-desenvolvimentismo, trabalhismo, bolivarianismo, ruralismo, esquerda cristã) |

## 1. Eixos (12)

Polo A = −100, polo B = +100. A ordem não significa esquerda/direita: em Liberdades e Instituições o polo B atrai
radicais dos dois lados. Justificativa de cada eixo em `data/axes.json` (campo `why`) e na página /sobre.

| Eixo | Polo A | Polo B | Por que no Brasil |
|---|---|---|---|
| Economia | Estado | Mercado | Petrobras, BNDES, teto de gastos |
| Distribuição | Redistribuição | Responsabilidade individual | desigualdade, Bolsa Família, IR e dividendos |
| Trabalho | Proteção ao trabalhador | Flexibilização | reforma de 2017, 6x1, aplicativos, Previdência |
| Costumes | Progressista | Conservador | aborto, casamento igualitário, gênero nas escolas |
| Religião e política | Laicidade | Religião na vida pública | bancada religiosa, voto evangélico |
| Segurança pública | Prevenção e garantias | Rigor penal | maioridade penal, armas, câmeras corporais |
| Liberdades | Liberdade individual | Autoridade | drogas, moderação de redes, vigilância |
| Ambiente | Preservação | Produção | Amazônia, agrotóxicos, Margem Equatorial, licenciamento |
| Modelo de desenvolvimento | Nacional-desenvolvimentismo | Abertura econômica | tarifas, conteúdo local, Mercosul, terras |
| Política externa | Sul Global / multipolar | Alinhamento ao Ocidente | BRICS, EUA × China, Venezuela |
| Instituições | Confiança institucional | Antissistema | STF, urnas, imprensa, BC autônomo, corrupção |
| Diversidade | Ações afirmativas | Critérios universais | cotas, racismo estrutural, demarcação |

## 2. Banco de perguntas (72)

6 por eixo, 3 em cada sentido, peso 1 (pesos diferentes só depois do piloto, com as cargas fatoriais). Cada item tem
fonte de inspiração (LAPOP, ESEB, BLS, PELA, Latinobarómetro, leis e PECs). Modo rápido: 24 itens, 1 de cada sentido
por eixo. Lista completa em [TABELAS.md](TABELAS.md#perguntas-72).

Regras de redação seguidas: uma ideia por item; sem palavras carregadas ("bandido", "golpe", "privilégio"); itens que
pessoas de esquerda e de direita endossam em quantidade parecida; temas atuais nomeados com termos neutros (PEC 6x1,
marco temporal, Margem Equatorial).

## 3. Pontuação

- Resposta r ∈ {−2, −1, 0, +1, +2}, "não sei" = ausente. Item com sentido d ∈ {−1, +1} e peso w.
- Score do eixo: `S = 100 · Σ(r·d·w) / Σ(2·w)` sobre os itens respondidos do eixo; sem itens respondidos → null.
- Afinidade com uma referência (ideologia, figura, país) com coordenadas c: `A = clamp(100 − √(média((S − c)²)), 0, 100)`
  sobre os eixos em que os dois têm valor, exigindo pelo menos 6 eixos em comum.
- Ranking: maior afinidade; empate → mais eixos em comum.
- Explicação: os 3 eixos mais marcados (|S| ≥ 15), os eixos que coincidem com a ideologia (|S − c| ≤ 25) e o eixo de
  maior diferença (≥ 40).
- Implementação: `lib/scoring.ts`, testes em `lib/scoring.test.ts`.

### Regra para posicionar ideologias e figuras

1. Ideologias: coordenadas pela definição teórica de cada corrente (posição típica de seus programas). Os pares mais
   próximos hoje (RMS): nacional-desenvolvimentismo × trabalhismo 16, socialismo democrático × ecossocialismo 18,
   ecossocialismo × social-democracia 18; por isso o resultado mostra também as 2 correntes seguintes. Meta para a v2:
   nenhum par abaixo de 20, fundindo ou afastando correntes com base no piloto.
2. Figuras: âncora esquerda–direita pela nota do partido em Bolognesi, Ribeiro & Codato (2023) quando existe; posição
   por eixo a partir de votações nominais (Câmara/Senado), programas de governo e declarações públicas. Sem fonte
   direta → "estimado" (hoje, todas). `null` quando não há posição pública (ex.: geopolítica de figuras dos EUA/Europa).
3. Próximo passo: substituir as estimativas por posições derivadas de votações nominais (W-NOMINATE/IDEAL sobre a base
   da Câmara) e, para figuras estrangeiras, pelo CHES América Latina e V-Party, com dois codificadores independentes
   e concordância medida (Krippendorff α ≥ 0,7).

## 4. Figuras (61)

31 brasileiras, 17 sul-americanas e 13 globais; 24 de esquerda/centro-esquerda, 10 de centro, 26 de
direita/centro-direita, 1 histórica fora do eixo (Vargas). Coordenadas e base em [TABELAS.md](TABELAS.md).

## 5. Ideologias (21)

Marxismo-leninismo, Socialismo democrático, Anarquismo/socialismo libertário, Populismo de esquerda/bolivarianismo,
Nacional-desenvolvimentismo, Trabalhismo, Esquerda cristã, Ecossocialismo/socioambientalismo, Social-democracia,
Social-liberalismo, Liberalismo progressista, Centrismo, Tecnocracia liberal, Democracia cristã,
Liberal-conservadorismo, Liberalismo clássico, Libertarianismo/anarcocapitalismo, Conservadorismo religioso,
Agrarismo/ruralismo, Nacional-conservadorismo, Direita autoritária.

Resultado das 6 personas no protótipo (completo):

| Persona | Ideologia (afinidade) | Figuras mais próximas |
|---|---|---|
| Esquerda nacional-desenvolvimentista | Nacional-desenvolvimentismo 83 | Ciro Gomes, Brizola, Dilma |
| Social-democrata urbana | Social-democracia 88 | Bachelet, Orsi, Suplicy |
| Centro liberal | Liberalismo progressista 87 | Eduardo Leite, FHC, Macron |
| Centro-direita | Liberal-conservadorismo 83 | Lacalle Pou, Piñera, Temer |
| Direita conservadora religiosa | Conservadorismo religioso 82 | Michelle Bolsonaro, Damares, Jair Bolsonaro |
| Direita libertária | Libertarianismo 90 | Paulo Guedes, Milei, Kim Kataguiri |

## 6. Validação

1. **Revisão de conteúdo** (antes do piloto): 4–6 especialistas de orientações diferentes avaliam cada item (clareza,
   neutralidade, pertinência ao eixo; CVI ≥ 0,78). Entrevistas cognitivas com 10–15 pessoas de escolaridade variada.
2. **Piloto**: n ≈ 600–1.000 com cotas por região, idade, escolaridade, religião e voto em 2022 (painel online), com
   consentimento explícito e autodeclaração esquerda–direita (escala ESEB/LAPOP L1) e voto como critério externo.
3. **Análise**: AFC com 12 fatores (CFI ≥ 0,90, RMSEA ≤ 0,08); alfa de Cronbach e ômega por eixo (≥ 0,70; com 6 itens
   balanceados, 0,60 é aceitável no piloto); correlação item-total; DIF por religião e escolaridade; teste-reteste em
   2–4 semanas (r ≥ 0,7). Itens fracos são trocados; pesos passam a refletir as cargas.
4. **Validade de critério**: o score deve separar eleitores declarados de partidos diferentes e correlacionar com a
   autoposição; o modo rápido deve correlacionar ≥ 0,8 com o completo por eixo.
5. **Figuras**: comparar as estimativas com posições por votação nominal e com a pesquisa de especialistas.

## 7. Riscos

- **LGPD**: opinião política é dado sensível (art. 5º, II; art. 11). O protótipo não coleta nada: sem servidor de dados,
  sem analytics, link só com scores. O piloto precisa de consentimento específico, finalidade de pesquisa, anonimização
  e encarregado definido; nunca cruzar com identificadores.
- **TSE e período eleitoral**: o teste não é pesquisa eleitoral (não estima intenção de voto, não exige registro pela
  Res. TSE 23.600/2019), mas em ano eleitoral: não comparar com candidatos registrados sem tratar todos de forma
  isonômica, não publicar "rankings" de candidatos, evitar impulsionamento pago e qualquer aparência de propaganda.
  Avaliar com advogado eleitoral antes de incluir candidatos de 2026.
- **Figuras reais**: posições estimadas podem ser contestadas. Mitigação: marcar "estimado", mostrar a base, canal de
  correção, revisão por pares de orientações diferentes.
- **Comunicação das limitações**: aviso na home, no resultado e na imagem ("protótipo sem validação estatística · não é
  recomendação de voto").
- **Neutralidade percebida**: cores neutras, polos sem rótulo esquerda/direita, itens balanceados; abrir dados e código
  para auditoria.
