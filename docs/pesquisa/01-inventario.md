# 01 - Inventário de testes de orientação política

Verificação feita em 2026-10-25 com WebFetch/WebSearch (sem navegador). "No ar" = a página respondeu e exibe o teste; "não verificado" = domínio não resolveu, erro HTTP, ou só há evidência indireta. Campos não confirmados estão marcados "n/d" (não disponível) e não devem ser tratados como fato.

## Tabela-resumo

| Teste | URL | Autor | Idioma | Nº perguntas | Escala | Código aberto | Ano | Status |
|---|---|---|---|---|---|---|---|---|
| 8values | https://8values.github.io | "8values" (anônimo; origem em 2017, derivado do Political Compass/ideias de Sapply) | EN (+ traduções comunitárias) | 70 (conforme Politize 2022) | 5 opções, Concordo Totalmente a Discordo Totalmente | Sim, MIT: https://github.com/8values/8values.github.io (1,1k estrelas) | ~2017 | No ar |
| 9Axes | https://9axes.github.io | comunidade (derivado do 8values) | EN | versão completa 216 (24/eixo); curta 45 (5/eixo) | n/d (concordo/discordo) | Sim, MIT (informado por wiki; repo: https://github.com/9axes/9axes.github.io, a confirmar) | ~2020 | Não verificado (só fontes secundárias) |
| 12axes | https://politicaltests.github.io/12axes (o domínio 12axes.vercel.app responde com título "12 Axes - Teste Político Grátis e Quiz de Ideologia em 12 Eixos", em PT-BR) | projeto "Political Tests" | EN; vercel em PT | completa 216 (24/eixo); curta 45 (5/eixo) | n/d | Sim: https://github.com/politicaltests/politicaltests.github.io/tree/main/12axes | ~2021-2025 | No ar (ambas as URLs responderam) |
| SapplyValues | https://sapplyvalues.github.io | Sapply (comunidade) | EN | n/d | Strongly Agree a Strongly Disagree | Sim: https://github.com/SapplyValues/SapplyValues.github.io | ~2019 | No ar |
| PolitiScale | politiscale.net (não resolveu) | iniciativa francesa "Radicalisé·e·s sur Internet" (segundo alternativeto) | FR (+EN) | n/d | n/d | n/d | n/d | Não verificado (DNS falhou em politiscale.net; domínio correto a confirmar) |
| Political Compass | https://www.politicalcompass.org/test | Political Compass (Wyn Jones, Reino Unido) | EN (+ traduções) | 62 (Politize) | 4 opções (Strongly Agree a Strongly Disagree) | Não | 2001 | No ar (página responde; detalhes do teste não extraídos) |
| iSideWith (Brasil) | https://www.isidewith.com/pt-br retornou 404 | iSideWith (privado, EUA) | EN/ES; PT não confirmado | 32 (Politize, versão geral) | Mais/menos importante + posição | Não | 2012 | Versão brasileira não verificada (404). Existe versão Argentina/Chile segundo lista da Univ. Düsseldorf: https://www.sozwiss.hhu.de/institut/abteilungen/politikwissenschaft/politik-ii/prof-dr-stefan-marschall/forschungsprojekte/wahl-o-mat-forschung/links |
| Politize "bússola política" | https://www.politize.com.br/bussola-politica/ | Politize! (Patrick Bragança Botelho, 4/11/2022) | PT-BR | Não é teste próprio: artigo que lista outros testes | - | Não | 2022 | No ar (artigo) |
| Questão Pública | domínio questaopublica.com.br não resolveu | Consórcio de ONGs e universidades (Marzuca, Serdült, Welp; artigo ePart 2011) | PT-BR | n/d | n/d | n/d | 2010 (eleições para o Senado) | Fora do ar / não verificado. Registro acadêmico: https://dl.ifip.org/IFIP-LNCS/hal-01589392v1 |
| Meu Voto 2010 e Senado 2010 (PIT Solutions) | meuvoto2010.org, senado.edemocracycentre.ch | PIT Solutions (Suíça) | PT-BR | n/d | n/d | n/d (Symfony) | 2010 | Provavelmente fora do ar (não testado). https://www.pitsolutions.ch/blog/pit-solutions-builds-brazil-election-compasses |
| Election Compass Brasil / Kieskompas | - | Kieskompas (VU Amsterdam) | - | Kieskompas padrão: 30 proposições | 5 pontos | - | - | Não encontrei versão brasileira do Kieskompas. A busca só trouxe PIT Solutions 2010. Não verificado |
| Calculadora de Afinidade Eleitoral (Congresso em Foco) | https://congressoemfoco.com.br/noticia/27284/calculadora-online-mede-afinidade-eleitoral-com-nove-presidenciaveis | Congresso em Foco | PT-BR | 23 | n/d | Não | 2018 | Edição 2018 (fora de atividade); nada encontrado para 2026 |
| Estadão / Folha / G1 / Aos Fatos (afinidade 2026) | - | - | PT-BR | - | - | - | - | Não verificado: nenhuma calculadora de 2026 localizada nas buscas |
| Bom Partido (VAA para partidos) | n/d | projeto de mestrado ULisboa | PT-BR | n/d | n/d | n/d | 2022 | Estudo de design, não confirmado no ar. https://repositorio.ulisboa.pt/handle/10451/56779 |
| Teste UFSCar de alinhamento político | Sem teste online. Escala em monografia: https://repositorio.ufscar.br/items/7740e4b7-be11-4e6d-b2a3-46ea3fe16ece | Rafaela C. Crisostomo; orient. Fabiano K. Miguel (UFSCar) | PT-BR | n/d (ver PDF Monografia_Rafaela.pdf) | n/d | Não | 2025 (18/02/2025) | Sem aplicação online. Artigo: "Esquerda ou direita: relações entre alinhamento político e características de personalidade", Rev. Psicologia Aplicada 2025 |
| Revista Época (4 perguntas) e O Globo (15 perguntas) | n/d | jornais | PT-BR | 4 e 15 | sim/não; 5 opções + "depende" | Não | ~2018-2022 | Citados no Politize; não verificados |
| IDRlabs Political Coordinates | n/d | IDRlabs | EN/PT | 36 | concordo/discordo | Não | n/d | Citado no Politize |
| Publimetro Colômbia (match 2026) | https://www.publimetro.co/comercial/2026/04/21/tu-match-presidencial-podria-no-ser-el-que-imaginas-haz-el-test-de-publimetro-para-descubrir-quien-es-tu-candidato-ideal/ | Publimetro | ES | n/d | n/d | Não | 2026 | Existia em abril/2026; não testado agora |
| CandiDater (Colômbia) | n/d | 34 instituições | ES | 27 | n/d | n/d | 2018 | Citado em https://impactotic.co/tests-en-linea-para-elegir-a-su-candidato-presidencial/ ; não verificado |
| Perú Escoge | n/d | IEP + Zurique + Delaware | ES | 30 | n/d | n/d | 2011 | Histórico (IEP) |

## Eixos e polos (testes de código aberto)

- **8values** (https://8values.github.io): Economic Equality vs. Markets; Diplomatic Nation vs. Globe; Civil Liberty vs. Authority; Societal Tradition vs. Progress (4 eixos, 8 valores).
- **12axes** (https://politicaltests.github.io/12axes; informa "onze eixos" na página, 12 no título): Governamental: Federal vs. Unitário, Democrático vs. Autocrático, Segurança vs. Liberdade. Diplomático: Nacionalismo vs. Internacionalismo, Militarista vs. Pacifista, Assimilacionista vs. Multiculturalista. Econômico: Coletivizar vs. Privatizar, Planejado vs. Laissez-faire, Isolacionismo vs. Globalismo. Societal: Irreligioso vs. Religioso, Progressista vs. Tradicional, Aceleracionista vs. Bioconservador. (A lista tem 12 pares; a página afirma 11, discrepância não resolvida.) Resultado em porcentagem por valor.
- **9Axes** (fontes secundárias: https://thewiki.kr/w/9Axes): 9 eixos / 18 valores, incluindo descentralização vs. centralização, democracia vs. ditadura, segurança vs. liberdade. Base do 12axes.
- **SapplyValues**: bússola com eixo social progressista vs. conservador separado do econômico (https://lemmy.korz.dev/post/178036/377343). Polos exatos não extraídos da página.
- **Political Compass**: econômico esquerda-direita x social libertário-autoritário (descrição Politize).
- **Politize** descreve a bússola: econômico (mais intervenção estatal a esquerda, menos a direita) e social (autoritário vs. libertário), 4 quadrantes.

## Método de pontuação e categorias de resultado

- 8values/9axes/12axes: cada pergunta tem pesos por eixo; soma ponderada normalizada em porcentagem; resultado final com ideologia mais próxima (ideologies.js no 8values). Detalhe de código: outro agente extrai.
- Political Compass: dois eixos, 4 quadrantes; figuras de referência (políticos e países) plotadas.
- Kieskompas/VAAs (Questão Pública, Meu Voto): distância/congruência entre respostas do usuário e posições de candidatos; ranking.
- Figuras de referência: 8values, 9axes e 12axes mostram ideologias (e países/personalidades) mais próximas; não extraí a lista.
- Referência de distribuição do eleitorado (Politize): Ipec 2022 37% centro, 35% direita, 26% esquerda; Datafolha jun/2022 (espectro político) esquerda 49%, direita 34%, centro 17%.

## Observações para o projeto

- Os modelos mais reutilizáveis (licença MIT) são 8values e a família 9axes/12axes; ambos usam escala de 5 pontos e pesos por pergunta.
- Não há teste brasileiro ativo e aberto encontrado; o único com instrumento psicométrico nacional é o da UFSCar (monografia 2025, sem versão online).
- Lacunas para outra rodada: PolitiScale (URL real), iSideWith BR, Estadão/Folha/G1/Aos Fatos 2026, Vota Inteligente (Chile), "Voto Consciente".
