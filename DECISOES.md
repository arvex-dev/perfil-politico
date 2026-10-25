# Decisões

Registro das escolhas feitas sem consultar o dono, com o motivo. Data: 2026-10-25.

## Escopo e execução

- **Prompt truncado em "6. Modo".** O item 6 da Fase 6 chegou cortado. Interpretei como **modo rápido**: 24 afirmações
  (2 por eixo, uma em cada sentido) além do teste completo de 72. É o recurso mais comum nos testes do gênero e não muda
  a arquitetura. Se a intenção era outra (modo escuro, modo eleição, modo comparar com amigo), é um acréscimo isolado.
- **Pesquisa em paralelo.** Fases 1+4 e 2+3 rodaram em dois agentes (sonnet) enquanto o protótipo era construído; os
  textos estão em `docs/pesquisa/`. O que não foi acessível está marcado "não verificado" lá.

## Stack e deploy

- **VPS ARVEX em vez de Vercel.** O prompt pedia "pronto para deploy na Vercel"; o dono pediu na conversa o kit ARVEX e
  deploy no VPS. O app continua sem backend de dados e sem banco, e roda na Vercel sem mudanças (só `output:
  "standalone"` é irrelevante lá). No VPS: imagem Next standalone construída no laptop, `arvex ship-image`
  (`@arvex-dev/deploy`), atrás do Caddy do arvex-edge, domínio **perfil.arvex.dev**.
- **Por que um servidor e não site estático:** a imagem de compartilhamento (`next/og`) é gerada por resultado, e as
  meta tags `og:image` precisam do código na URL no momento da requisição. Um export estático perderia a prévia no
  WhatsApp.
- **Rodapé ARVEX** via `@arvex-dev/brand` (`footerHtml`), como nos outros apps.
- **`cacheComponents` desligado.** O template do Next 16.4 liga por padrão; o app não tem dados remotos e as rotas
  dinâmicas dependem só do parâmetro da URL, então o modo clássico é mais simples.
- **Repositório privado em `arvex-dev/perfil-politico`**, como os outros projetos da org. Para um teste político, abrir o
  código e os dados (com licença) ajudaria na credibilidade de neutralidade: recomendo tornar público depois de uma
  revisão das estimativas.

## Modelo do teste

- **12 eixos**, cada um com 6 afirmações (3 em cada sentido). Equilíbrio exato por eixo garante que "concordo com tudo"
  dá 0 em todos os eixos (teste automatizado).
- **Escala de 5 pontos + "não sei"**; "não sei" é excluído do denominador do eixo; eixo sem respostas aparece "sem
  dados" e não entra nas comparações.
- **Afinidade = 100 − RMS das diferenças**, com mínimo de 6 eixos em comum. Escolhida para discriminar: o 8values e
  derivados usam distâncias normalizadas que deixam quase todo mundo acima de 80–90% com a ideologia do topo. Teste
  automatizado: com 200 respostas aleatórias, nenhuma figura passa de 90%.
- **Resultado na URL só com scores** (14 bytes em base64url), nunca as respostas: opinião política é dado sensível
  (LGPD art. 5º, II e art. 11). O código é versionado (byte 0) para permitir mudar eixos depois.
- **Polos A/B não são esquerda/direita.** Em vários eixos (liberdades, instituições) o polo B atrai tanto a esquerda
  radical quanto a direita radical; a tela nunca colore os polos com cores partidárias (um só tom neutro).
- **Ordem das perguntas intercalada por eixo** (não aleatória, para que o mesmo questionário seja comparável).
- **Figuras e países: todos marcados "estimado".** Nenhuma figura tem autoposicionamento publicado nesses 12 eixos.
  Quando o partido tem nota na pesquisa de especialistas de Bolognesi, Ribeiro & Codato (Dados, 2023), ela é citada
  como âncora do lado esquerda–direita. Países = regime de políticas em 2025, não a opinião da população.
- **Equilíbrio das figuras:** 24 de esquerda/centro-esquerda, 10 de centro, 26 de direita/centro-direita, 1 outro
  (Vargas); 48 da América do Sul (31 brasileiras) e 13 globais. Teste automatizado limita a diferença entre os lados a
  20%.
- **Geopolítica = null para figuras dos EUA e da Europa**: o eixo mede a postura do Brasil frente a EUA/China e não se
  aplica a elas.
- **Personas como teste de regressão:** as 6 personas da Fase 2 respondem o nosso teste a partir de uma posição alvo
  por eixo; o teste verifica que cada uma cai numa ideologia coerente nos dois modos e que as 6 caem em ideologias
  diferentes. É uma checagem de coerência do motor e das coordenadas, não validação empírica (é circular por
  construção).

## Pesquisa

- **Dump do 12axes fora do git.** O repositório do 12axes (github.com/RomanCypherpunk/12axes, commit d77c8f6f) é
  "All rights reserved"; 8values, 9Axes e SapplyValues são MIT. Os JSON extraídos do 12axes ficam só locais
  (`.gitignore`), e a classificação versionada guarda os ids sem o texto das perguntas. Os resultados das personas e
  as análises citam o 12axes por id e com trechos curtos. Nenhuma pergunta do nosso banco foi copiada de outro teste.
- **PolitiScale não extraído** (sem código público, site fora do ar). Questão Pública e iSideWith BR não verificados.

## Refinamento (2026-10-25, tarde)

- **Identidade própria na família ARVEX.** Base comum da família (Inter, JetBrains Mono, raios 6/12/20/pílula, toque
  ≥ 44 px, foco de 3 px, rodapé ARVEX); do produto: papel de jornal (#f2efe8), tinta (#15161b), Archivo Expanded 800 nos
  títulos e um único destaque verde-petróleo (#0b6e69). Evitadas as cores associadas a partidos (vermelho, azul,
  verde-amarelo, laranja) e o violeta, que é do ARVEX. A barra ARVEX de 40 px do canvas da família ainda não existe no
  `@arvex-dev/brand`; entra quando for publicada.
- **Alinhamento político** (esquerda … direita) a partir de 7 dos 12 eixos (ver /sobre), com rótulo próprio para perfis
  cruzados. Mapa 2D economia × costumes com 10 figuras fixas: 4 à esquerda (Boulos, Lula, Ciro, Haddad), 2 ao centro
  (Tebet, FHC), 4 à direita (Tarcísio, Zema, Bolsonaro, Milei).
- **Duas imagens**: 1080×1920 para stories/status (baixar ou compartilhar o arquivo pelo menu do celular) e 1200×630
  como prévia de link, porque WhatsApp e X cortam imagem vertical na prévia.
- **Fact-check** (docs/pesquisa/factcheck/): 30 itens corrigidos ou reescritos. Itens trocados: tra5 (fim da escala 6x1,
  aprovado no Congresso em 2026, virou salário mínimo com ganho real). Reescritos para tirar dupla pergunta: eco3,
  dis3, cos2, cos5, seg4, div6; para atualizar fatos: dis1, dis5 (dividendos tributados desde 2026), tra2, tra3, tra4,
  cos1, amb6, geo2, div4 e outros. Modo rápido: seg4 (armas) substitui seg1 (maioridade penal), que tem ~80% de
  apoio e quase não discrimina. Equilíbrio de 3 itens por sentido em cada eixo mantido.
- Fatos de 2026 vieram de buscas (o modelo não os conhecia); os que não foram abertos numa fonte estão marcados no
  fontes.json e não aparecem como fonte na tela.
