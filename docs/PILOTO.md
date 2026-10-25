# Piloto simulado (gerado por `pnpm piloto`, não editar à mão)

2000 respondentes sintéticos, semente 20261025. Cada pessoa tem uma posição latente em cada eixo (parte comum
esquerda–direita, parte própria do eixo), um viés de concordância (dp 0.35) e 5% de "não sei".
Cada item tem discriminação sorteada entre 0,6 e 1,4 e ruído (dp 0.75). **O que isto prova:** que as chaves (sentido
dos itens), o balanceamento, a pontuação e o catálogo funcionam como deveriam se as pessoas responderem de forma
coerente. **O que não prova:** que as perguntas reais medem o que pretendem; isso só o piloto com pessoas responde.

## Por eixo

| Eixo | α (6 itens) | α rápido (2) | recupera posição | recupera (rápido) | rápido × completo | r com viés de concordância | idem, só itens "a favor" |
|---|---:|---:|---:|---:|---:|---:|---:|
| Economia | 0.83 | 0.49 | 0.93 | 0.77 | 0.85 | 0.01 | 0.32 |
| Distribuição | 0.86 | 0.6 | 0.93 | 0.83 | 0.89 | -0.03 | 0.27 |
| Trabalho | 0.82 | 0.46 | 0.92 | 0.77 | 0.85 | 0 | 0.33 |
| Costumes | 0.85 | 0.51 | 0.93 | 0.78 | 0.86 | 0 | 0.33 |
| Religião e política | 0.88 | 0.68 | 0.94 | 0.85 | 0.91 | -0.02 | 0.27 |
| Segurança pública | 0.85 | 0.46 | 0.93 | 0.76 | 0.84 | -0.03 | 0.26 |
| Liberdades | 0.84 | 0.57 | 0.92 | 0.8 | 0.88 | 0 | 0.31 |
| Ambiente | 0.83 | 0.59 | 0.93 | 0.83 | 0.89 | -0.01 | 0.33 |
| Modelo de desenvolvimento | 0.82 | 0.49 | 0.92 | 0.8 | 0.87 | 0.04 | 0.36 |
| Política externa | 0.84 | 0.5 | 0.94 | 0.78 | 0.85 | -0.04 | 0.28 |
| Instituições | 0.9 | 0.7 | 0.95 | 0.87 | 0.92 | -0.01 | 0.25 |
| Diversidade | 0.79 | 0.39 | 0.91 | 0.72 | 0.82 | -0.02 | 0.36 |

- α ≥ 0,70 é a meta para o completo; o rápido, com 2 itens, fica naturalmente abaixo.
- "r com viés de concordância" perto de 0 mostra que o balanceamento (3 itens em cada sentido) neutraliza quem concorda
  com tudo; a última coluna é o mesmo eixo pontuado só com os 3 itens "a favor", como muitos testes fazem.

## Itens

Todo item deve correlacionar mais com o total do próprio eixo do que com qualquer outro eixo, e acima de 0,30.
**Todos os 72 itens passam** (nenhuma chave invertida, nenhum item mais alinhado a outro eixo).

## Estrutura

Análise paralela: **13 fatores** acima do acaso (autovalores 11.93, 5.35, 3.61, 3.33, 3.05, 2.75, 2.62, 2.54, 2.37, 2.27, 2.2, 2.09, 1.98 …;
aleatórios 1.38, 1.35, 1.33 …). O primeiro fator grande é o esquerda–direita comum; os demais
correspondem aos eixos.

## Resultados

- Lado correto (esquerda/direita verdadeira × sinal do alinhamento): **91%**.
- Alinhamento por grupo verdadeiro: centro: Centro 46%, Centro-direita 25%, Centro-esquerda 22%, Esquerda econômica, conservador nos costumes 2%, Esquerda 2%, Direita 2%, Liberal na economia e nos costumes 1% · esquerda: Centro-esquerda 55%, Esquerda 22%, Centro 19%, Centro-direita 2%, Esquerda econômica, conservador nos costumes 0%, Direita 0%, Liberal na economia e nos costumes 0% · direita: Centro-direita 51%, Direita 24%, Centro 22%, Centro-esquerda 2%, Liberal na economia e nos costumes 1%, Esquerda econômica, conservador nos costumes 0%.
- Correntes no topo: 21 de 21 aparecem; as mais frequentes: Centrismo 32%, Social-democracia 11%, Liberal-conservadorismo 10%, Democracia cristã 8%, Agrarismo / ruralismo 7%, Social-liberalismo 5%.
- Afinidade com a figura mais próxima: p10 48%, mediana 60%, p90 72%; acima de 90%: 0 de 2000.
