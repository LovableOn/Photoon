import { useRef, useState, type DragEvent, type ReactNode } from 'react'
import { Spinner } from './ui'

export function Dropzone({
  onFiles,
  accept,
  busy,
  title,
  description,
  icon,
  compact,
}: {
  onFiles: (files: File[]) => void
  accept: string
  busy?: boolean
  title: string
  description: string
  icon: ReactNode
  compact?: boolean
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragging, setDragging] = useState(false)

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    const files = Array.from(event.dataTransfer.files)
    if (files.length) onFiles(files)
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !busy && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click()
      }}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed text-center transition ${
        compact ? 'px-6 py-8' : 'px-6 py-14'
      } ${
        dragging
          ? 'border-primary bg-primary-soft/50'
          : 'border-line bg-surface hover:border-primary/40 hover:bg-subtle'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          if (files.length) onFiles(files)
          event.target.value = ''
        }}
      />

      <span
        className={`flex items-center justify-center rounded-2xl text-primary ${
          compact ? 'size-10' : 'size-14'
        } ${dragging ? 'bg-primary text-white' : 'bg-primary-soft'}`}
      >
        {busy ? <Spinner className="size-5" /> : icon}
      </span>

      <p className={`font-semibold text-ink ${compact ? 'mt-3 text-sm' : 'mt-4 text-base'}`}>
        {busy ? 'Processando arquivos...' : title}
      </p>
      <p className="mt-1 max-w-sm text-[13px] text-ink-soft">{description}</p>
    </div>
  )
}
