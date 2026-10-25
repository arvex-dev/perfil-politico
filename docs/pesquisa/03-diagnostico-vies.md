# 03 – Diagnóstico de viés dos testes (fase 3)

Dados: `dados/classificacao-perguntas.json` (cada pergunta com categoria, motivo e regra; auditável), `dados/resultados/_resumo.json`, `_vieses.json`. Scripts: `classificar.mjs`, `vieses.mjs`. A classificação é por regras de texto + exceções manuais (campo `rule`). Ela só detecta referências **explícitas**: o enquadramento anglo-saxão implícito (vocabulário, exemplos, o que conta como "centro") entra como "universal" e não é medido.

## 1. Origem geográfica das perguntas

| Teste | Perguntas | Europa/Am. Norte | Am. Latina/Brasil | Universal |
|---|---|---|---|---|
| 8values | 70 | 7 (10,0%) | 0 | 63 (90,0%) |
| 9Axes (pool) | 216 | 12 (5,6%) | 0 | 204 (94,4%) |
| SapplyValues | 46 | 4 (8,7%) | 0 | 42 (91,3%) |
| 12axes | 240 | 0 (não medido por regra; leitura manual não achou) | 43 (17,9%) | 197 (82,1%) |

Itens EUNA típicos: União Europeia/"regional unions" (8values 18, 9Axes 2.2.0), single-payer (8values 62, 9Axes 5.2.0), saúde por capacidade de pagamento (8v 13), armas como direito (8v 61), imposto sobre igrejas (8v 48), antiterrorismo/vigilância pós-11/9 (8v 34; 9Axes 4.x), eutanásia (8v 33), proibição de véu (9Axes 6.1.0), nulificação do júri (Sapply 25), RG obrigatório (Sapply 20). Os três testes anglófonos não têm nenhuma pergunta com referência brasileira ou latino-americana; "universal" neles significa "sem marca geográfica", não "neutro": quase toda a economia é framed como comunismo × capitalismo/laissez-faire e os costumes giram em torno de casamento gay, aborto, eutanásia e religião no sentido cristão ocidental.

O 12axes é o único calibrado: 17,9% das perguntas citam instituições ou debates brasileiros (STF, Banco Central, Bolsa Família, quilombolas, venezuelanos e haitianos, Amazônia, reforma agrária, facções, cotas raciais, estabilidade de servidores, bancos públicos). O resto é universal ou traduzido do modelo original de 12 eixos.

## 2. Temas brasileiros ausentes

Contagem por palavras-chave (`cobertura` em `classificacao-perguntas.json`, com ids) e checagem manual. "—" = nenhuma pergunta; números = perguntas que tocam o tema, nem sempre de forma direta.

| Tema | 12axes | 8values | 9Axes | Sapply |
|---|---|---|---|---|
| Segurança pública | presente (poder_01 facções, 03, 05, 15, 19; ≈9) | 1 (Q31 "law and order") | 4 (4.1.x polícia e ordem) | 3 (S28, S41, S42) |
| Armas | 2 civis (poder_09, 10) + militares | 1 (Q61) | — | — |
| Drogas | 3 (poder_02, 06, 08) | 1 (Q55) | 3 (4.4.0, 4.6.0, 4.6.1) | 1 (S40) |
| Agro × ambiente | presente (agrotóxicos, transgênicos, mineração na Amazônia, reforma agrária) | — (só clima/regulação ambiental genérica, Q43, 49) | — (só clima e regulação, 7.3.x) | — |
| Estatais/Petrobras | parcial (economia_03, 19, 17; sem Petrobras nominal) | 2 genéricas (Q11, Q15) | 2 (5.1.2, 5.5.2) | 1 (S12) |
| Tributação e desigualdade | presente (≈8) | 3 (Q9, 10, 62) | 4 | 3 (S6, 14) |
| Corrupção | — | — | — | — |
| STF e instituições | 6 (representacao_05 cita o STF; Banco Central; Congresso) | — (só democracia abstrata) | — | — |
| Religião na política | 20 (eixo inteiro) | 4 (Q29, 45, 47, 48) | 24 (eixo inteiro) | 2 (S32, S43) |
| Transferência de renda | 2 (economia_11 renda básica, 14 Bolsa Família) | indireto (Q4, 8, 62) | indireto (5.2.2, 5.5.0, 5.6.x) | indireto (S1, 9, 10) |
| EUA e China | 1 (comercio_15, carros chineses) | — | — | — |
| Mercosul/integração regional | 5, todas sobre liderança sobre vizinhos/América do Sul; nenhuma cita Mercosul ou comércio regional | 1 (UE) | 1 (UE) | — |

Resumo: corrupção está ausente em **todos**; EUA/China e Mercosul praticamente ausentes mesmo no 12axes (que cobre quase todo o resto). Nos testes anglófonos faltam também segurança pública no sentido brasileiro (facções, letalidade policial, encarceramento), agro×ambiente, estatais e instituições judiciais. O 12axes não tem pergunta sobre voto obrigatório, sistema eleitoral, fundo partidário, imunidade parlamentar, privatização de empresa nominal (Petrobras/Correios) ou política externa Brasil–EUA/China/BRICS.

## 3. Os resultados das personas são plausíveis? Há puxão para um lado?

Fonte: `_resumo.json` e `_vieses.json` (resposta determinística das 6 personas; população sintética de 300 perfis com posições uniformes e semente fixa).

**12axes**: o único em que centro e direita recebem resultados plausíveis, com a figura e o país brasileiros aparecendo (P3 São Paulo, P4 Goiás/Zema, P5 Flávio Bolsonaro, P1 Marighella/Furtado). Problemas:
- **Eixo Representação satura**: 99 (teto) para P1–P4 e 83–87 para P5/P6. Quase todo mundo é "democrata muito forte"; o eixo não discrimina porque os enunciados autocráticos são extremos.
- **Compatibilidade sempre alta**: o melhor match de cada persona tem 86,8 a 98,7%; na população sintética a mediana do melhor match é 83,1% (mín. 72,2%; máx. 95%). Quase todo usuário vê "mais de 80% compatível" com alguma ideologia, o que dá sensação de acerto mas não informa.
- **Centro não aparece**: P3 (centro liberal) tem top 10 com 7 libertários, 2 de direita, 1 de centro. P2 (social-democrata) tem top 10 = 7 de esquerda + 3 anarquistas (Tecnoprogressismo, **Comunismo de Conselhos 96,3%**, Socialismo Internacionalista, Internacionalismo...), sem "Social-Democracia" no topo. Na população sintética as famílias do top 1 são: Direita 31%, Esquerda 19%, Centro 13%, Esq. Radical 12%, Libertário 8%, Extrema direita 7%, Terceira Posição 7%, Anarquismo 3%, ou seja, o catálogo tem ligeiro peso à direita e quase nada ao centro (o catálogo tem 38 de 273 ideologias de Centro, 14%).
- Sem o pior caso de acquiescence: concordar com tudo dá 50 em todos os eixos (balanceado 10/10).

**8values**: puxão para extremos e para a "ideologia exótica". P2 (social-democrata) vira "Libertarian Socialism" com Social = 94,3 ("Revolutionary"); P3 (centro liberal) vira "Libertarianism" com 86,1 "Very Progressive"; P5 (conservadora religiosa, não autoritária no sentido nazista) cai em "Capitalist Fascism" (Econ 14,7 / Civil 21,9 / Social 5,6). A normalização `(max+S)/(2 max)` com `max = Σ|efeito|` faz quem concorda moderadamente (resposta ±0,5) com itens fortes ficar longe do centro; um perfil moderado com respostas coerentes chega a 80–95. Viés de desenho: o eixo Civil tem 24 itens "autoridade" contra 13 "liberdade" (soma dos pesos −200 × +120), então concordar com tudo dá Govt 37,5 (viés autoritário de 12,5 pontos) e econ 59. Só P4 (centro-direita) cai em uma ideologia próxima do esperado (Neo-Liberalism).

**9Axes**: o pior em consistência. (i) Bug de casamento: econ é comparado com o eixo Igualdade, govt com o eixo **Democrático**, dipl com Globalista, scty com Progressista; o eixo Segurança/Liberdade nunca é usado. P1 (nacional-desenvolvimentista, Democrático 86) cai em **Anarcho-Communism** nas três variantes. (ii) O sorteio do questionário muda a ideologia: P4 recebe Libertarian Capitalism / Market Anarchism / Libertarianism; P5 recebe Moderate Conservatism / Objectivism / Anarcho-Egoism, em três execuções do mesmo persona. (iii) O polo "Libertarian/Anarquista" domina: 4 de 6 personas, inclusive P3 e P4, terminam em "Libertarian-X". (iv) Concordar com tudo dá 60 em todos os eixos (3 itens de um polo × 2 do outro).

**SapplyValues**: sem ideologia, só 3 números. Funciona como bússola, mas P3 e P6 caem no mesmo quadrante (Direita/Libertário/Progressista), e P1 fica em −10 (saturado) no eixo econômico: com 15 itens e normalização por `Σ|efeito|`, qualquer perfil econômico coerente chega perto do teto. O eixo "progressista" mistura drogas, pena de morte, religião e multiculturalismo, então um conservador religioso e um conservador secular ficam indistinguíveis. Balanceamento 8×7 por eixo é bom (concordar com tudo dá 0,67).

Em síntese: nenhum teste puxa todo mundo para um único lado, mas **todos os anglófonos puxam centro e centro-direita para rótulos libertários ou extremos**, e o 12axes puxa o centro para ideologias de família "Direita" ou "Libertário" (centro liberal) e a social-democracia para "esquerda/anarquismo", porque o catálogo é denso nas pontas e a fórmula recompensa direção, não posição moderada.

## 4. Representação latino-americana nas referências

| Teste | Ideologias | Países/regimes | Figuras |
|---|---|---|---|
| 8values | 52, 0 latino-americanas (sem Peronismo, Varguismo, Bolivarianismo) | — | — |
| 9Axes | mesma lista de 52 | — | — |
| SapplyValues | — | — | — |
| 12axes | 273: 7 estritamente latino-americanas/brasileiras (Integralismo Brasileiro, Socialismo Bolivariano, Zapatismo, Nacionalismo Peronista, Nacionalismo Varguista, Social-Democracia Brasileira, Indigenismo) = 2,6%; com a família desenvolvimentista/trabalhista +7 (Desenvolvimentismo, Nacional-/Liberal-/Social-/de Estado, Trabalhismo, Trabalhismo Cristão) = 5,1% | 309 entradas: 39 latino-americanas (12,6%), das quais 10 são estados brasileiros e 13 são regimes históricos (Era Vargas, Allende, Pinochet, Chávez, Cuba de Fidel, Argentina Peronista etc.) | 645: ≈59 por heurística de nacionalidade (9,1%; Lula, Bolsonaro, Vargas, Brizola, Milei, Boric, Mujica, Allende, Chávez, Perón, Paulo Freire, Mariátegui, Prebisch...), revisão manual necessária |

Em 12axes o repertório brasileiro é grande para um teste, mas ainda abaixo do peso da região; e os países mais próximos de personas brasileiras tendem a ser estados (São Paulo, Goiás) ou lugares não latino-americanos (Gales, Alabama, New Hampshire), porque só o Brasil e uns poucos países têm vetores latino-americanos.

## 5. Lições para um teste calibrado para o Brasil

1. **Normalização**: evite o `(max+S)/(2 max)` do 8values/Sapply, em que `max` soma pesos de todos os itens; um moderado coerente satura em 85–95. Prefira média ponderada de itens balanceados (como o 12axes) e mostre intensidade separadamente.
2. **Balanceie polos por eixo** (mesmo nº de itens para cada lado, de preferência 10/10): concordar com tudo precisa dar 50 (12axes), não 60 (9Axes) nem 37,5 (8values Civil). Sorteie sempre pares espelhados.
3. **Evite compatibilidade que dá ~90% para todo mundo**: no 12axes o melhor match fica entre 83% (mediana) e 99%. Mostre rank e distância ao 2º colocado, ou use percentis, e inclua um "centro" explícito no catálogo para a social-democracia e o centro liberal não virarem Comunismo de Conselhos ou Libertarianismo.
4. **Valide o casamento eixo→perfil por teste de regressão** (o 9Axes casa o eixo errado; o 12axes tem `ScorerBenchmarkTest`): cada persona deve achar o perfil de que foi derivada e ficar estável entre sorteios de perguntas.
5. **Cubra os temas que dividem o Brasil e hoje faltam**: corrupção, segurança pública (letalidade, encarceramento), armas, agro × ambiente, estatais nominais (Petrobras), Bolsa Família e renda, STF e voto obrigatório, relação com EUA/China/BRICS, Mercosul. Evite eixos que saturam (Representação), usando itens de freios e contrapesos concretos (STF, foro privilegiado) em vez de "autocracia".
