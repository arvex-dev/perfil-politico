# Posições estimadas x votações nominais

Compara as coordenadas "estimadas" de `data/figures.json` com votos nominais reais de parlamentares-figura (nenhum arquivo de `data/` foi alterado).

## Arquivos
- `votacoes.json`: 31 votações nominais (20 Câmara, 11 Senado), 2015-2026: id, data, proposição, ementa curta, descrição oficial, URL oficial (ficha da proposição / matéria) e URL da API, eixo, `voto_sim_equivale_polo` (A ou B), totais Sim/Não, `consenso`, `ambigua`.
- `votos.json`: figura -> votação -> Sim / Não / Abstenção / Obstrução / Presidente / Ausente / Sem mandato.
- `posicoes.json`: `{figura: {eixo: {score, n}}}` só para figuras com 3 ou mais votos Sim/Não úteis.
- `propostas.json`: `{figura: {eixo: {atual, por_votos, n, sugerido, obs}}}`.
- `resumo_cobertura.json`: nº de votos Sim/Não usados por figura. `scripts/`: coleta e cálculo (Node 24, cache local, 1 req/s).

## Método
1. Votações escolhidas à mão, cada uma mapeada a um eixo e a um polo (Sim = polo A ou B). "Nominal" verificado pela existência da lista individual de votos (Câmara: `/votacoes/{id}/votos`, >=100 registros; Senado: `/votacao`, >=30 Sim+Não, não secreta).
2. Score por voto: +100 se votou rumo ao polo B, -100 rumo ao polo A. Abstenção, obstrução, ausência e voto do presidente não entram. Score do eixo = média; `n` = nº de votos.
3. Proposta: se |por_votos - atual| > 30 e n >= 2, `sugerido` = (3*atual + n*por_votos)/(3+n) (encolhimento: poucos votos não substituem a estimativa). Com n = 1 a divergência é só indicativa e o valor atual é mantido. Eixos sem voto não aparecem (manter atual).

## Limitações
- Poucos votos por eixo (n de 1 a 5); o score satura em +-100, então "divergência" quase sempre significa "mais extremo que a estimativa", raramente inversão de sinal.
- Votos de bancada/governo refletem coalizão, não só ideologia (ex.: Lira e Pacheco votaram com o governo em reformas; Pacheco como presidente do Senado quase não votou).
- Excluídas do cálculo (mantidas em `votacoes.json`): votações quase unânimes (minoria < 10%: IR até 5 mil, 6x1 Câmara e Senado, saidinha no Senado) e `ambigua` (urgência do PL 2630: o sentido em "liberdades" é contestado).
- Mapeamentos discutíveis: Previdência e autonomia do BC em `economia` (não `trabalho`/`instituicoes`); PEC das Drogas, armas e maioridade em `seguranca`; Eletrobras em `economia`; anistia/dosimetria de 8 de janeiro em `instituicoes` (Sim = B). Marco temporal e mineração em terras indígenas em `ambiente`.
- Sem votações nominais utilizáveis: `costumes`, `religiao`, `geopolitica`, `liberdades` (PL 1904/2024 não teve votação nominal; Lei de Cotas 2023 e PL 2630 só tiveram votações procedimentais). Reforma tributária (EC 132) foi omitida por não discriminar ideologicamente. Teto de gastos no Senado (2016) e outras votações do Senado antes de 2017 não estão na API nova do Senado; Marina Silva e Flávio Dino não têm votos suficientes (Dino nenhum); Suplicy e Caiado só 1 voto cada; Bolsonaro 3 votos (n=1 por eixo).
- Registro de votos na API pode falhar por painel/justificativa; "Ausente" inclui isso. Derrubada de vetos (sessão do Congresso) não foi coletada.

## Aplicado no app

`propostas.json` é a proposta bruta desta pesquisa. O que entrou em `data/figures.json` é o de
`scripts/aplicar-votacoes.mjs` (resultado em `aplicado.json`), que além das regras acima exclui a MPV 1031/2021
(Eletrobras), porque parte dos deputados pró-mercado votou contra pelas térmicas e subsídios incluídos no texto, e não
contra a privatização.

## Parlamentares (mandato atual)

Dataset para "quais deputados/senadores votam como você": `parlamentares.json` (compacto: `rollcalls` + `members` com `axes: {eixo: {score, n}}` e `votos_total`) e `votos_parlamentares.json` (voto Sim/Não de cada membro em cada votação, para auditoria). Scripts: `scripts/sweepC.mjs`, `sweepS.mjs`, `sweepS_old.mjs` (varredura de votações nominais), `members.mjs`, `fetchvotes.mjs`, `buildparl.mjs`; respostas da API em `cache/` (Câmara, Senado; 1 req/s). Nenhum arquivo de `data/` foi alterado.

**Membros:** 594 = 513 deputados em exercício (`/deputados`, 57ª legislatura, inclui suplentes que assumiram) + 81 senadores (`senador/lista/atual`), com id, nome parlamentar, partido atual, UF, casa, foto e URL do perfil oficiais. Votos de antes de 2023 contam para quem já tinha mandato (mesmo id).

**Método:** igual ao acima: Sim/Não -> +100 (rumo ao polo B) ou -100 (rumo a A) conforme `voto_sim_equivale_polo`; média por eixo, `n` = nº de votos. Abstenção, obstrução, ausência, "Artigo 17"/presidente e licenças não contam. Sem votos no eixo, o eixo não aparece.

**Votações usadas: 34** (23 Câmara + 11 Senado): as 31 de `votacoes.json` menos 7 excluídas, mais 10 novas.
- Mantidas as exclusões anteriores: PL 2630 urgência (C:2310837-8, ambígua), MPV 1031 Eletrobras (C:2270789-73 e S:6377), quase unânimes (minoria < 10%): IR até 5 mil (C:2487436-169), 6x1 Câmara e Senado (C:2233802-424, S:7106), saidinha no Senado (S:6818).
- Novas (todas verificadas pela lista nominal na API): Câmara PDL 98/2023 saneamento (economia, Sim=B), PL 4173/2023 fundos exclusivos/offshore (distribuicao, Sim=A), PDL 214/2025 susta IOF (distribuicao, Sim=B), PL 5228/2019 primeiro emprego (trabalho, Sim=B), PL 5582/2025 antifacção (seguranca, Sim=B), PDL 3/2025 susta resolução do CONANDA sobre aborto legal de menores (costumes, Sim=B), PL 1958/2021 cotas em concursos, texto principal (diversidade, Sim=A); Senado PLP 19/2019 autonomia do BC (economia, Sim=B), PEC 48/2023 marco temporal (ambiente, Sim=B), PEC 8/2021 decisões monocráticas do STF (instituicoes, Sim=B, discutível). Justificativa de cada uma no campo `justificativa`.
- Avaliadas e excluídas (nominais, mas ambíguas): arcabouço fiscal PLP 93/2023 (Câmara 372x108, Senado 57x17; regra fiscal votada por governo, centrão e parte da oposição, sem sentido claro Estado x Mercado); PEC 3/2021 "da Blindagem" (bancadas de esquerda e direita se misturaram no 1º turno); PL 709/2023 (invasores de terra, sem eixo limpo); reforma tributária EC 132 e PLP 68/2024 (pacotes mistos); PL Antifacção no Senado (64x0, unânime); emendas/destaques, requerimentos e votos de urgência (procedimentais). PEC das Drogas não teve votação nominal na Câmara até aqui; PL 1904/2024 idem; PEC da Segurança Pública (PEC 18/2025) sem votação nominal encontrada.

**Votações por eixo** (Câmara / Senado): economia 4/3, distribuicao 2/0, trabalho 3/1, seguranca 3/2, ambiente 5/3, instituicoes 2/2, diversidade 2/0, costumes 1/0, soberania 1/0. Sem votação utilizável: religiao, liberdades, geopolitica (ninguém tem score nesses eixos).

**Cobertura:** mediana de 12 votos úteis por membro (Câmara 13, Senado 7); 96% com 3 ou mais eixos (Câmara 98%, Senado 85%); 12 membros sem nenhum voto (6 deputados, 6 senadores, suplentes/ministros recém-empossados, ex.: Marina Silva, Sônia Guajajara, Camilo Santana). Membros com 3+ votos no mesmo eixo: economia 259, ambiente 289, seguranca 87, trabalho 82; distribuicao, instituicoes, diversidade e costumes têm no máximo 2 votos por pessoa (n baixo, score tende a +-100/0).

**Limitações:** n pequeno e saturação em +-100; votos de coalizão do governo/centrão se misturam com ideologia; Senado tem poucas votações nominais úteis antes de 2017 (API) e só 10 no total; derrubada de vetos (sessões do Congresso) não coletada; partido é o atual, não o da época do voto. Em alguns eixos o mapeamento é discutível (PEC 8/2021, PDL 214/2025 como "menos tributação").
