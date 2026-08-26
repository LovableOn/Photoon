# Trocar a galeria de exemplo por fotos reais

A galeria que aparece no primeiro acesso é **gerada no navegador**, não baixada.
O ambiente onde este projeto foi montado bloqueia bancos de imagem (Unsplash,
Pexels, Pixabay e Wikimedia retornam 403 no proxy), então cada foto é desenhada
num canvas a partir de uma paleta e de uma semente — silhuetas em contraluz que
imitam a luz de uma cobertura de casamento.

Elas cumprem o papel de marcador de lugar: viram Blobs de verdade em
IndexedDB, com dimensão, orientação, miniatura e assinatura perceptual, então
todo o resto do sistema (DPI, recorte, busca por semelhança, capa do álbum)
funciona exatamente como funcionaria com fotos reais.

## Opção 1 — subir as fotos pela própria interface

O caminho mais rápido, sem tocar em código: entre no app, vá em **Fotos** e
use **Enviar minhas fotos**. Elas entram como origem `propria`.

## Opção 2 — servir as fotos como galeria da loja

Para que as fotos apareçam como **liberadas pela loja** (que é o fluxo real do
produto, onde o lojista cadastra e o cliente só escolhe):

1. Coloque os arquivos em `public/galeria/` — por exemplo
   `public/galeria/IMG_0104.jpg`.

2. Em `src/lib/seedGallery.ts`, troque a lista `SEED_GALLERY` pelos seus
   arquivos, mantendo o momento de cada um:

   ```ts
   export const SEED_GALLERY = [
     { name: 'IMG_0104', moment: 'Making of', file: '/galeria/IMG_0104.jpg' },
     { name: 'IMG_0211', moment: 'Cerimônia', file: '/galeria/IMG_0211.jpg' },
     // ...
   ]
   ```

3. No mesmo arquivo, troque o corpo de `renderSeedPhoto` por uma busca:

   ```ts
   export async function renderSeedPhoto(spec: SeedSpec): Promise<Blob> {
     const resposta = await fetch(spec.file)
     if (!resposta.ok) throw new Error(`Não achei ${spec.file}`)
     return resposta.blob()
   }
   ```

   As dimensões e a orientação passam a sair do arquivo real: quem mede é
   `processImage`, em `src/lib/images.ts`, e nada mais precisa mudar.

Atenção ao publicar como página única (`--fragment`): arquivos em `public/`
não são embutidos no HTML. Nesse caso, converta as fotos para data URI ou
sirva a pasta junto com a página.

## Quando existir back-end

O ponto de troca é `src/lib/db.ts`, consumido só por `src/lib/store.tsx`. A
semeadura fica em `seedStoreGallery`, dentro do `StoreProvider` — é ali que
entra a chamada que busca a galeria que o lojista liberou para aquele cliente.
