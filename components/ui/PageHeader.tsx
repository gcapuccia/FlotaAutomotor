import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  back?: { href: string; label: string }
}

export default function PageHeader({ title, subtitle, action, back }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {back && (
        <Link href={back.href} className="page-back-link">
          <ArrowLeft size={20} />
          {back.label}
        </Link>
      )}
      <div className={action ? 'flex flex-wrap items-center justify-between gap-4' : ''}>
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  )
}
