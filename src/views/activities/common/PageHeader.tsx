interface Props {
  title: string
  subtitle: string
}

export default function PageHeader({ title, subtitle }: Props) {
  return (
    <div className="mb-4 pb-2 border-bottom">
      <h3 className="fw-bold mb-2">{title}</h3>
      <p className="text-body-secondary mb-0">{subtitle}</p>
    </div>
  )
}