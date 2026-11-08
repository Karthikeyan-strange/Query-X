import { Route } from 'lucide-react'

export default function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`product-brand${compact ? ' product-brand-compact' : ''}`}>
      <span className="product-mark" aria-hidden="true"><Route size={21} strokeWidth={1.8} /></span>
      <span className="product-name">Regional AI <strong>Logistics Intelligence Platform</strong></span>
    </div>
  )
}
