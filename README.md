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

- A galeria vem da **loja**: no primeiro acesso, 42 fotos de um casamento são
  liberadas para o cliente, classificadas por momento (making of, cerimônia,
  retratos, hora dourada, hora azul, festa).
- O cliente também pode **enviar fotos próprias**, por botão ou arrastando
  sobre a grade. Só as próprias podem ser excluídas — arquivo da loja não se
  apaga por aqui.
- Três modos de visualização: miniaturas grandes, miniaturas pequenas e lista.
- Filtros por origem, momento, orientação, favoritas e uso; busca por nome;
  ordenação por data, nome, tamanho e resolução.
- **Busca por semelhança**: envie uma foto de referência e a galeria se
  reordena pelas mais parecidas, com a afinidade em cada miniatura.

**Elementos** (`/app/elementos`) — nível loja

- Biblioteca curada de 33 elementos vetoriais (formas, linhas, molduras,
  ícones, selos, etiquetas, data e localização), recoloríveis na hora.
- Envio de elementos próprios em SVG, PNG ou WebP, organizados por categoria.
- **Cadastrar elemento é trabalho do lojista**, não de quem monta o álbum: a
  rota exige papel `admin` ou `lojista` e não aparece no menu do cliente. O
  cliente usa os elementos dentro do editor, no painel próprio.

**Álbuns** (`/app/albuns`)

- Criação em três passos: produto e formato → seleção de fotos → nome.
- Detalhe do álbum com capa, progresso, adicionar e remover fotos, renomear,
  marcar como pronto, finalizar e excluir.

**Editor de álbum** (`/app/albuns/:id/editor`)

- Canvas com lâmina aberta, vinco, margem de corte e área segura.
- Arraste fotos da biblioteca para os quadros; arraste sobre a foto colocada
  para reposicionar o recorte; alças para mover e redimensionar.
- 14 layouts por quantidade de fotos, com o espaçamento em mm controlando o
  respiro entre os quadros.
- Texto com presets e **50 elementos decorativos** originais em nove
  categorias (corações, molduras, arabescos, florais, fitas, selos, formas,
  linhas, data e local), todos recoloríveis.
- **19 texturas de fundo** repetíveis (corações, matelassê, arabescos,
  geométricos, delicados), com cor do fundo e cor do desenho escolhidas à
  parte. O tamanho do padrão sai em porcentagem da lâmina, então miniatura,
  canvas e prévia mostram o mesmo desenho.
- **Seletor de cor completo** em todo lugar que pede cor: área de saturação
  para arrastar, faixa de matiz, campo hexadecimal e atalhos.
- O inspetor da direita recolhe numa faixa e volta sozinho quando você
  seleciona um objeto.
- Inspetor com enquadramento, zoom, rotação, brilho, contraste, saturação e
  preto e branco.
- Storyboard com miniaturas reais, badges de estado, reordenar, duplicar e
  excluir lâminas.
- Desfazer e refazer (`Ctrl/Cmd + Z`), autosave e prévia sem ferramentas.
- Revisão que bloqueia a finalização enquanto houver erro, com correção
  automática por item.

As verificações da revisão são calculadas de dados reais — dimensões do
arquivo, tamanho físico do produto e geometria dos quadros: resolução efetiva
de impressão em DPI, quadro sobre o vinco, foto repetida na lâmina, quadro sem
foto e texto fora da área segura. **Não há detecção de rosto nem chamada a um
modelo de IA nesta versão**; o painel de assistência aplica regras fixas de
diagramação.

**Painel** (`/app`)

- Widgets com dados reais da biblioteca: fotos por dia, evolução do acervo,
  composição por orientação e resumo geral.

## Níveis de acesso

O modelo tem três papéis (`src/lib/auth.tsx`):

| Papel | Quem é | O que faz |
|---|---|---|
| `admin` | dono da plataforma | administra tudo |
| `lojista` | estúdio ou loja que vende o álbum | cadastra fotos, elementos e clientes |
| `cliente` | quem recebe as fotos | escolhe as fotos e monta o álbum |

As telas entregues hoje são as do **cliente**. As áreas de admin e lojista
ainda não existem, mas o papel já está no modelo e as rotas já respeitam ele —
`/app/elementos` só abre para `admin` e `lojista`.

## Galeria de exemplo

No primeiro acesso, a loja "libera" 42 fotos de um casamento. Elas são
**geradas no navegador**, não fotografias reais: o ambiente onde o projeto foi
montado bloqueia bancos de imagem. Veja `scripts/seed-fotos.md` para trocar
por fotos de verdade.

## Busca por semelhança, e o que ela não é

A busca compara uma **assinatura perceptual** calculada no navegador
(`src/lib/similarity.ts`): a imagem reduzida a 12×12 em tons de cinza,
normalizada pela média, mais uma grade 4×4 de cor média. Acha fotos da mesma
cena, da mesma sequência, da mesma luz.

**Não é reconhecimento facial** — não identifica pessoas. Para "ache todas as
fotos desta pessoa" seria preciso um modelo de detecção e um vetor de rosto,
rodando no servidor. A interface diz isso ao usuário em vez de prometer o que
não entrega.

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
