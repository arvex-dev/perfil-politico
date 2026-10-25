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
