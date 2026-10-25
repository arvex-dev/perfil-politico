# Perfil Político

Teste político em 12 eixos feito para o Brasil e a América do Sul. **https://perfilpolitico.arvex.dev**

Em vez de traduzir um teste americano, as afirmações tratam de temas daqui: Petrobras, Bolsa Família, reforma
trabalhista, armas, Amazônia, STF, BRICS, cotas. No fim, a pessoa vê o alinhamento (esquerda, centro, direita ou perfil
cruzado), a posição em cada eixo, a corrente de pensamento mais próxima e as figuras políticas mais parecidas. Dá para
comparar o resultado com um amigo.

Sem cadastro e sem banco de dados: as respostas ficam no navegador e o link do resultado guarda só a posição em cada
eixo.

## Como funciona

- **12 eixos** com dois polos nomeados (Estado ↔ Mercado, Laicidade ↔ Religião na vida pública, Prevenção e garantias ↔
  Rigor penal, Sul Global ↔ Ocidente…). Definições em [`data/axes.json`](data/axes.json).
- **72 afirmações**, 6 por eixo, 3 em cada sentido: quem concorda com tudo cai no centro. Cada uma tem contexto neutro,
  o que significa concordar e discordar, e de 2 a 4 fontes verificadas ([`data/questions.json`](data/questions.json)).
  Versão rápida com 24 afirmações fixas. A ordem é sorteada a cada teste.
- **Pontuação**: score por eixo de −100 a +100; afinidade com correntes, figuras e países = 100 − média quadrática das
  diferenças ([`lib/scoring.ts`](lib/scoring.ts)), que não dá 90% para todo mundo.
- **Referências**: 21 correntes, 61 figuras (Brasil, América do Sul e globais) e 30 países. As posições das figuras são
  estimadas e, para parlamentares, ajustadas por votações nominais da Câmara e do Senado
  ([`docs/pesquisa/votacoes/`](docs/pesquisa/votacoes/)).

Metodologia completa na página [/sobre](https://perfilpolitico.arvex.dev/sobre) e em [`docs/PROPOSTA.md`](docs/PROPOSTA.md).

## Pesquisa e validação

- [`docs/pesquisa/`](docs/pesquisa/): inventário de testes existentes, extração e simulação de 8values, 9Axes,
  SapplyValues e 12axes, diagnóstico de viés, base acadêmica (ESEB, LAPOP, Latinobarómetro, PELA, BLS, Bolognesi et
  al.), checagem de fatos e votações nominais.
- [`docs/PILOTO.md`](docs/PILOTO.md): piloto simulado com 2.000 respondentes sintéticos (consistência por eixo, chaves dos
  itens, imunidade ao viés de concordância, estrutura fatorial). Verifica a mecânica; não substitui um piloto com
  pessoas.
- [`DECISOES.md`](DECISOES.md): registro das escolhas de desenho e por quê.

## Rodar localmente

Requer Node 24 e pnpm.

```sh
pnpm install
pnpm dev          # http://localhost:3000
pnpm test         # motor, equilíbrio dos eixos, fontes, sorteio, personas
pnpm typecheck
pnpm piloto       # refaz docs/PILOTO.md
```

O rodapé usa `@arvex-dev/brand`, um pacote privado do GitHub Packages da ARVEX. Sem acesso a ele, remova a dependência e
o rodapé em `app/layout.tsx`; o resto do app não depende dele.

Estrutura: `app/` (páginas e rotas de imagem com `next/og`), `components/`, `lib/` (motor de pontuação, sorteio,
alinhamento, comparação, imagens), `data/` (eixos, perguntas, correntes, figuras, países), `scripts/` (tabelas,
fontes, votações, piloto).

## Contribuir

Achou um fato errado, uma fonte melhor ou uma posição mal estimada? Abra uma issue com a fonte. Mudanças nas perguntas
precisam passar em `pnpm test` (cada eixo com 3 itens em cada sentido, ≥ 2 fontes por pergunta, personas coerentes) e
devem manter a redação neutra: os dois lados com argumentos de peso parecido.

## Licenças

Código: MIT ([LICENSE](LICENSE)). Perguntas, explicações, posições estimadas, pesquisa e textos (`data/`, `docs/`):
CC BY 4.0 ([LICENSE-DADOS.md](LICENSE-DADOS.md)), com as exceções listadas lá (dados de 8values, 9Axes e SapplyValues
sob MIT; resultados derivados do 12axes não cobertos; fontes sob SIL OFL).

Não é pesquisa eleitoral nem recomendação de voto.
