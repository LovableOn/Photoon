import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import {
  cssFilter,
  type ElementItem,
  type Frame,
  type Spread,
  type TextBox,
} from '../../lib/editorTypes'
import { BUILTIN_ELEMENTS } from '../../lib/builtinElements'

const BUILTIN_BY_ID = new Map(BUILTIN_ELEMENTS.map((element) => [element.id, element]))

/**
 * Álbum com o efeito de papel e virada de página em 3D.
 *
 * As duas páginas (`.rb-paper`) e a virada (`.rb-turn`) reproduzem à risca a
 * textura, a curvatura e a animação do mockup de referência — isso é o que
 * faz o álbum "parecer de verdade". A única coisa que não vem fixa do
 * mockup é a posição das fotos: em vez de um recorte de 1+3 fotos gravado
 * numa imagem, cada quadro nasce do próprio layout da lâmina (`Spread`),
 * reaproveitado do canvas — por isso o álbum serve para qualquer arranjo,
 * não só o do exemplo.
 */

export interface RealisticBookHandle {
  next: () => void
  prev: () => void
}

interface Props {
  /** Lâminas internas (sem a capa) — a capa é uma página só e não folheia. */
  spreads: Spread[]
  index: number
  onIndexChange: (index: number) => void
  thumbUrls: Record<string, string>
  elementUrls: Record<string, string>
  gapFor: (spread: Spread) => { gapX: number; gapY: number }
  /** Proporção real da lâmina aberta (duas páginas), do formato do álbum. */
  aspect: number
  className?: string
}

/**
 * A moldura do livro (`.rb-paper` etc.) usa as mesmas proporções do
 * mockup de referência — mas a "cena" em volta dela precisa de uma
 * proporção diferente para cada formato de álbum, senão a página dentro
 * do livro fica achatada ou esticada. Como a página ocupa uma fração fixa
 * da largura (43,2%) e da altura (62,4%) da cena, a proporção da cena que
 * mantém a página exatamente correta é: aspecto-da-página × (altura/largura
 * da moldura) — resolvido uma vez aqui, não por lâmina.
 */
const PAPER_WIDTH_FRACTION = 0.432
const PAPER_HEIGHT_FRACTION = 0.624
const SCENE_ASPECT_FACTOR = PAPER_HEIGHT_FRACTION / PAPER_WIDTH_FRACTION / 2

type Side = 'left' | 'right'

/** Recorta o que pertence a uma metade da lâmina e reprojeta em 0–100
 * local àquela página — o mesmo espaço de coordenadas de sempre, só que
 * relativo à página, não à lâmina inteira. */
function sideFrames(frames: Frame[], side: Side): Frame[] {
  return frames
    .filter((frame) => {
      const center = frame.x + frame.w / 2
      return side === 'left' ? center < 50 : center >= 50
    })
    .map((frame) => ({
      ...frame,
      x: side === 'left' ? frame.x * 2 : (frame.x - 50) * 2,
      w: frame.w * 2,
    }))
}

function sideTexts(texts: TextBox[], side: Side): TextBox[] {
  return texts
    .filter((text) => {
      const center = text.x + text.w / 2
      return side === 'left' ? center < 50 : center >= 50
    })
    .map((text) => ({
      ...text,
      x: side === 'left' ? text.x * 2 : (text.x - 50) * 2,
      w: text.w * 2,
    }))
}

function sideElements(elements: ElementItem[], side: Side): ElementItem[] {
  return elements
    .filter((element) => {
      const center = element.x + element.w / 2
      return side === 'left' ? center < 50 : center >= 50
    })
    .map((element) => ({
      ...element,
      x: side === 'left' ? element.x * 2 : (element.x - 50) * 2,
      w: element.w * 2,
    }))
}

export const RealisticBook = forwardRef<RealisticBookHandle, Props>(function RealisticBook(
  { spreads, index, onIndexChange, thumbUrls, elementUrls, gapFor, aspect, className = '' },
  ref,
) {
  const [display, setDisplay] = useState(index)
  const [flip, setFlip] = useState<'next' | 'prev' | null>(null)
  const animating = useRef(false)
  const sceneRef = useRef<HTMLDivElement | null>(null)
  const [sceneHeight, setSceneHeight] = useState(0)

  useEffect(() => {
    const node = sceneRef.current
    if (!node) return
    const observer = new ResizeObserver((entries) => {
      setSceneHeight(entries[0].contentRect.height)
    })
    observer.observe(node)
    setSceneHeight(node.getBoundingClientRect().height)
    return () => observer.disconnect()
  }, [])

  // A página impressa ocupa 62,4% da altura da cena (o resto é a moldura do
  // livro) — o tamanho do texto é % da altura da LÂMINA, então escala contra
  // a altura da página, não da cena inteira.
  const scaleY = (sceneHeight * PAPER_HEIGHT_FRACTION) / 100

  const current = spreads[display]
  const target = flip === 'next' ? spreads[display + 1] : flip === 'prev' ? spreads[display - 1] : null

  function playPageSound() {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const duration = 0.55
      const bufferSize = Math.floor(ctx.sampleRate * duration)
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        const t = i / bufferSize
        data[i] = (Math.random() * 2 - 1) * (1 - t) * 0.22
      }
      const source = ctx.createBufferSource()
      source.buffer = buffer
      const lowpass = ctx.createBiquadFilter()
      lowpass.type = 'lowpass'
      lowpass.frequency.value = 1400
      const band = ctx.createBiquadFilter()
      band.type = 'bandpass'
      band.frequency.value = 720
      band.Q.value = 0.5
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.001, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      source.connect(lowpass)
      lowpass.connect(band)
      band.connect(gain)
      gain.connect(ctx.destination)
      source.start()
      source.stop(ctx.currentTime + duration + 0.02)
    } catch {
      // som é só um agrado — falhar em silêncio (Safari sem gesto, etc.)
    }
  }

  function next() {
    if (animating.current || display >= spreads.length - 1) return
    animating.current = true
    playPageSound()
    setFlip('next')
    window.setTimeout(() => {
      const nextIndex = display + 1
      setDisplay(nextIndex)
      setFlip(null)
      animating.current = false
      onIndexChange(nextIndex)
    }, 950)
  }

  function prev() {
    if (animating.current || display <= 0) return
    animating.current = true
    playPageSound()
    setFlip('prev')
    window.setTimeout(() => {
      const prevIndex = display - 1
      setDisplay(prevIndex)
      setFlip(null)
      animating.current = false
      onIndexChange(prevIndex)
    }, 950)
  }

  useImperativeHandle(ref, () => ({ next, prev }), [display, spreads.length])

  if (!current) return null
  const { gapX, gapY } = gapFor(current)
  const localGapX = gapX * 2

  return (
    <div
      ref={sceneRef}
      className={`rb-scene ${className}`}
      style={{ aspectRatio: aspect * SCENE_ASPECT_FACTOR }}
    >
      <div className="rb-base" />
      <div className="rb-gutter" />

      <div className="rb-paper rb-left">
        <div className="rb-page-inner">
          <PageFace
            frames={sideFrames(current.frames, 'left')}
            texts={sideTexts(current.texts, 'left')}
            elements={sideElements(current.elements, 'left')}
            gapX={localGapX}
            gapY={gapY}
            thumbUrls={thumbUrls}
            elementUrls={elementUrls}
            curve="left"
            scaleY={scaleY}
          />
        </div>
      </div>

      <div className="rb-paper rb-right">
        <div className="rb-page-inner">
          <PageFace
            frames={sideFrames(current.frames, 'right')}
            texts={sideTexts(current.texts, 'right')}
            elements={sideElements(current.elements, 'right')}
            gapX={localGapX}
            gapY={gapY}
            thumbUrls={thumbUrls}
            elementUrls={elementUrls}
            curve="right"
            scaleY={scaleY}
          />
        </div>
      </div>

      {/* virada de página — a face da frente é a página que está saindo, a
          de trás é a que vai aparecer, exatamente como uma folha de verdade
          tem conteúdo dos dois lados. */}
      <div className={`rb-turn rb-right ${flip === 'next' ? 'rb-active' : ''}`}>
        <div className="rb-face rb-face-front">
          {flip === 'next' && (
            <div className="rb-page-inner">
              <PageFace
                frames={sideFrames(current.frames, 'right')}
                texts={sideTexts(current.texts, 'right')}
                elements={sideElements(current.elements, 'right')}
                gapX={localGapX}
                gapY={gapY}
                thumbUrls={thumbUrls}
                elementUrls={elementUrls}
                curve="right"
                scaleY={scaleY}
              />
            </div>
          )}
        </div>
        <div className="rb-face rb-face-back">
          {flip === 'next' && target && (
            <div className="rb-page-inner">
              <PageFace
                frames={sideFrames(target.frames, 'left')}
                texts={sideTexts(target.texts, 'left')}
                elements={sideElements(target.elements, 'left')}
                gapX={gapFor(target).gapX * 2}
                gapY={gapFor(target).gapY}
                thumbUrls={thumbUrls}
                elementUrls={elementUrls}
                curve="left"
                scaleY={scaleY}
              />
            </div>
          )}
        </div>
      </div>

      <div className={`rb-turn rb-left ${flip === 'prev' ? 'rb-active' : ''}`}>
        <div className="rb-face rb-face-front">
          {flip === 'prev' && (
            <div className="rb-page-inner">
              <PageFace
                frames={sideFrames(current.frames, 'left')}
                texts={sideTexts(current.texts, 'left')}
                elements={sideElements(current.elements, 'left')}
                gapX={localGapX}
                gapY={gapY}
                thumbUrls={thumbUrls}
                elementUrls={elementUrls}
                curve="left"
                scaleY={scaleY}
              />
            </div>
          )}
        </div>
        <div className="rb-face rb-face-back">
          {flip === 'prev' && target && (
            <div className="rb-page-inner">
              <PageFace
                frames={sideFrames(target.frames, 'right')}
                texts={sideTexts(target.texts, 'right')}
                elements={sideElements(target.elements, 'right')}
                gapX={gapFor(target).gapX * 2}
                gapY={gapFor(target).gapY}
                thumbUrls={thumbUrls}
                elementUrls={elementUrls}
                curve="right"
                scaleY={scaleY}
              />
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        aria-label="Página anterior"
        className="rb-click-zone rb-prev"
        onClick={prev}
      />
      <button
        type="button"
        aria-label="Próxima página"
        className="rb-click-zone rb-next"
        onClick={next}
      />
    </div>
  )
})

/* ------------------------------------------------------------- uma página */

function PageFace({
  frames,
  texts,
  elements,
  gapX,
  gapY,
  thumbUrls,
  elementUrls,
  curve,
  scaleY,
}: {
  frames: Frame[]
  texts: TextBox[]
  elements: ElementItem[]
  gapX: number
  gapY: number
  thumbUrls: Record<string, string>
  elementUrls: Record<string, string>
  curve: Side
  scaleY: number
}) {
  return (
    <>
      {frames.map((frame) => (
        <div
          key={frame.id}
          className="absolute overflow-hidden"
          style={{
            left: `${frame.x + gapX / 2}%`,
            top: `${frame.y + gapY / 2}%`,
            width: `${Math.max(0, frame.w - gapX)}%`,
            height: `${Math.max(0, frame.h - gapY)}%`,
            transform: frame.rotation ? `rotate(${frame.rotation}deg)` : undefined,
          }}
        >
          {frame.photoId && thumbUrls[frame.photoId] ? (
            <div className="rb-media relative size-full">
              <img
                src={thumbUrls[frame.photoId]}
                alt=""
                className="size-full object-cover"
                style={{
                  // A leve inclinação em perspectiva acompanha a curvatura da
                  // página — a mesma foto "encaixada" que o mockup usa —,
                  // combinada com o zoom/recorte que a pessoa já escolheu.
                  transform: `perspective(1200px) rotateY(${curve === 'left' ? -1.3 : 1.3}deg) scale(${
                    1.04 * (frame.zoom / 100)
                  }) translate(${frame.offsetX}%, ${frame.offsetY}%)`,
                  filter: cssFilter(frame),
                }}
              />
            </div>
          ) : (
            <div className="size-full bg-[#eef1f5]" />
          )}
        </div>
      ))}

      {elements.map((element) => {
        const builtin = BUILTIN_BY_ID.get(element.elementId)
        return (
          <div
            key={element.id}
            className="absolute aspect-square"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              width: `${element.w}%`,
              transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
              opacity: element.opacity / 100,
              color: element.color,
            }}
          >
            {builtin ? (
              <svg
                viewBox="0 0 100 100"
                className="size-full"
                dangerouslySetInnerHTML={{ __html: builtin.svg }}
                aria-hidden="true"
              />
            ) : elementUrls[element.elementId] ? (
              <img src={elementUrls[element.elementId]} alt="" className="size-full object-contain" />
            ) : null}
          </div>
        )
      })}

      {texts.map((text) => (
        <p
          key={text.id}
          className="absolute m-0 break-words whitespace-pre-wrap"
          style={{
            left: `${text.x}%`,
            top: `${text.y}%`,
            width: `${text.w}%`,
            fontSize: `${Math.max(6, text.size * scaleY)}px`,
            fontWeight: text.weight,
            textAlign: text.align,
            color: text.color,
            textTransform: text.uppercase ? 'uppercase' : 'none',
            letterSpacing: `${text.letterSpacing}em`,
            lineHeight: text.lineHeight,
          }}
        >
          {text.text}
        </p>
      ))}
    </>
  )
}
