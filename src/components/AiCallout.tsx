import { LinkButton } from './ui'
import { Icon } from './icons'

/**
 * Chamada da criação assistida.
 *
 * A Photoon monta as lâminas sozinha a partir das fotos liberadas, e essa é a
 * porta de entrada mais rápida para quem nunca diagramou — por isso ela ganha
 * um bloco próprio na home em vez de um botão escondido.
 *
 * O texto não promete modelo de IA: o que roda são regras de diagramação
 * (orientação da foto, quadros livres, espaçamento), como diz o painel de
 * assistência dentro do editor.
 */

const PASSOS = [
  { titulo: 'Escolhe as fotos', descricao: 'Usa as que a loja liberou e ainda não entraram.' },
  { titulo: 'Monta as lâminas', descricao: 'Layout conforme a orientação de cada foto.' },
  { titulo: 'Você ajusta', descricao: 'Tudo fica editável depois, lâmina por lâmina.' },
]

export function AiCallout({ unusedCount }: { unusedCount: number }) {
  return (
    <section className="relative overflow-hidden rounded-[26px] bg-navy-deep">
      <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.5)_1px,transparent_0)] [background-size:26px_26px]" />
      <div className="absolute -top-20 -left-10 size-72 rounded-full bg-primary/40 blur-3xl" />
      <div className="absolute -right-16 -bottom-24 size-80 rounded-full bg-secondary/30 blur-3xl" />

      <div className="relative grid gap-8 p-7 sm:p-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:p-10">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            <Icon.Sparkle className="size-3.5" />
            Criação assistida
          </span>

          <h2 className="mt-4 text-[26px] leading-tight font-bold tracking-tight text-white sm:text-[30px]">
            Deixe a Photoon montar
            <br />o primeiro rascunho.
          </h2>

          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/70">
            {unusedCount > 0 ? (
              <>
                Você tem{' '}
                <strong className="font-semibold text-white">
                  {unusedCount} fotos
                </strong>{' '}
                ainda fora de qualquer álbum. A Photoon distribui elas nas lâminas
                e você ajusta o que quiser depois.
              </>
            ) : (
              <>
                Escolha um produto e um formato: a Photoon distribui as fotos nas
                lâminas e você ajusta o que quiser depois.
              </>
            )}
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <LinkButton to="/app/albuns/novo" variant="white">
              <Icon.Sparkle className="size-4" />
              Criar com IA
            </LinkButton>
            <LinkButton
              to="/app/fotos"
              variant="dark"
              className="border border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
            >
              Escolher as fotos antes
            </LinkButton>
          </div>
        </div>

        <ol className="space-y-2.5">
          {PASSOS.map((passo, index) => (
            <li
              key={passo.titulo}
              className="flex items-start gap-3.5 rounded-2xl border border-white/12 bg-white/8 p-4 backdrop-blur-sm"
            >
              <span className="numeric flex size-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-[12px] font-bold text-white">
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold text-white">
                  {passo.titulo}
                </span>
                <span className="mt-0.5 block text-[12px] leading-relaxed text-white/60">
                  {passo.descricao}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
