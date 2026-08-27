import { Link } from 'react-router-dom'
import { Icon } from './icons'

/**
 * Próximos passos, na ordem recomendada.
 *
 * A numeração aqui não é enfeite: é uma sequência de verdade, em que cada
 * passo depende do anterior. Por isso o passo concluído fica marcado, o
 * atual fica em destaque com o link, e os seguintes ficam apagados — a
 * ordem carrega informação que o leitor precisa.
 */

export interface Step {
  label: string
  detail: string
  to: string
  done: boolean
}

export function NextSteps({ steps }: { steps: Step[] }) {
  const atual = steps.findIndex((step) => !step.done)

  return (
    <ol>
      {steps.map((step, index) => {
        const ativo = index === atual
        const futuro = atual !== -1 && index > atual
        const isLast = index === steps.length - 1

        const conteudo = (
          <>
            <span className="relative flex shrink-0 flex-col items-center self-stretch">
              <span
                className={`z-10 flex size-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ring-4 ring-surface ${
                  step.done
                    ? 'bg-success text-white'
                    : ativo
                      ? 'bg-brand text-white'
                      : 'bg-subtle text-ink-faint'
                }`}
              >
                {step.done ? <Icon.Check className="size-3.5" /> : index + 1}
              </span>
              {/* Traço conectando ao próximo passo — é o que faz a lista ler
                  como um caminho, não como uma pilha solta de itens. */}
              {!isLast && (
                <span
                  className={`-mt-px w-px flex-1 ${
                    step.done ? 'bg-success/40' : 'bg-line'
                  }`}
                />
              )}
            </span>

            <span className="min-w-0 flex-1 pb-5">
              <span
                className={`block truncate text-[13px] font-semibold ${
                  futuro ? 'text-ink-faint' : 'text-ink'
                }`}
              >
                {step.label}
              </span>
              <span className="block truncate text-[11px] text-ink-faint">
                {step.detail}
              </span>
            </span>

            {ativo && (
              <Icon.ArrowUpRight className="mt-1 size-4 shrink-0 text-primary" />
            )}
          </>
        )

        // Só o passo da vez leva a algum lugar: o resto é leitura.
        return (
          <li key={step.label}>
            {ativo ? (
              <Link
                to={step.to}
                className="-mx-2 flex items-start gap-3 rounded-xl px-2 pt-0.5 transition hover:bg-primary-soft/40"
              >
                {conteudo}
              </Link>
            ) : (
              <div className="flex items-start gap-3 pt-0.5">{conteudo}</div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
