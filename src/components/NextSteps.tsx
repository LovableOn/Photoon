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
    <ol className="space-y-1">
      {steps.map((step, index) => {
        const ativo = index === atual
        const futuro = atual !== -1 && index > atual

        const conteudo = (
          <>
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                step.done
                  ? 'bg-success-soft text-success'
                  : ativo
                    ? 'bg-brand text-white'
                    : 'bg-subtle text-ink-faint'
              }`}
            >
              {step.done ? <Icon.Check className="size-3.5" /> : index + 1}
            </span>

            <span className="min-w-0 flex-1">
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

            {ativo && <Icon.ArrowUpRight className="size-4 shrink-0 text-primary" />}
          </>
        )

        // Só o passo da vez leva a algum lugar: o resto é leitura.
        return (
          <li key={step.label}>
            {ativo ? (
              <Link
                to={step.to}
                className="flex items-center gap-3 rounded-xl border border-primary/25 bg-primary-soft/40 px-3 py-2.5 transition hover:border-primary/50"
              >
                {conteudo}
              </Link>
            ) : (
              <div className="flex items-center gap-3 px-3 py-2.5">{conteudo}</div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
