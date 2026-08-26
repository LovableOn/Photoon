# Photoon

Área do cliente da Photoon: cadastre suas fotos e elementos, monte álbuns e
acompanhe tudo num painel único.

## Rodando localmente

```bash
npm install
npm run dev
```

O app sobe em `http://localhost:5173`.

Outros comandos:

```bash
npm run build    # typecheck + build de produção
npm run lint     # oxlint
npm run preview  # serve o build
```

### Página única, para hospedar em qualquer lugar

Onde não dá para servir uma pasta de assets nem reescrever rotas no servidor,
gere um HTML com tudo embutido:

```bash
VITE_ROUTER=hash npm run build
node scripts/bundle-single-file.mjs dist/photoon.html
```

`VITE_ROUTER=hash` troca o roteador para hash (`#/app/fotos`), que é o que
sobrevive a um recarregamento sem suporte do servidor. O flag `--fragment` gera
a mesma coisa sem `<html>`, `<head>` e `<body>`, para hosts que fornecem o
invólucro.

## O que já funciona

**Acesso**

- Login em tela dividida, cadastro com medidor de força de senha, recuperação e
  redefinição de senha.
- Sessão persistida e rotas protegidas.

**Fotos** (`/app/fotos`)

- Envio por botão ou arrastando arquivos sobre a grade.
- Miniatura gerada no navegador, dimensões e orientação detectadas
  automaticamente (vertical, horizontal, quadrada, panorâmica).
- Filtros, busca, ordenação, favoritas, seleção múltipla, preview em tela cheia
  e exclusão em lote.

**Elementos** (`/app/elementos`)

- Biblioteca curada de 33 elementos vetoriais (formas, linhas, molduras,
  ícones, selos, etiquetas, data e localização), recoloríveis na hora.
- Envio de elementos próprios em SVG, PNG ou WebP, organizados por categoria.

**Álbuns** (`/app/albuns`)

- Criação em três passos: produto e formato → seleção de fotos → nome.
- Detalhe do álbum com capa, progresso, adicionar e remover fotos, renomear,
  marcar como pronto, finalizar e excluir.

**Painel** (`/app`)

- Widgets com dados reais da biblioteca: fotos por dia, evolução do acervo,
  composição por orientação e resumo geral.

## Armazenamento

Esta versão não tem back-end. Fotos e elementos (blobs inclusive) ficam no
**IndexedDB** do navegador, e a sessão no `localStorage` — os dados são por
dispositivo e por conta. Ao plugar uma API, o ponto de troca é `src/lib/db.ts`,
consumido apenas por `src/lib/store.tsx`.

Onde o navegador bloqueia armazenamento (janela anônima, iframe de terceiro), o
app cai para um espelho em memória: continua funcionando na sessão atual e só
perde os dados ao recarregar.

## Estrutura

```
src/
  components/   AppShell, AuthLayout, gráficos, primitivos de UI
  lib/          auth, store, db (IndexedDB), imagens, catálogo de elementos
  pages/        telas de acesso e do app
```

## Design

Paleta azul/ciano da Photoon (`#2563EB` → `#06B6D4`) sobre fundo `#F4F7FC`,
tipografia Plus Jakarta Sans. Os tokens ficam em `src/index.css`.

A escala categórica dos gráficos foi validada para daltonismo e contraste; onde
uma cor fica abaixo de 3:1 contra a superfície, o gráfico leva rótulo direto
visível.
