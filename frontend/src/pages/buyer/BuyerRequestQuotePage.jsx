import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import api from '../../lib/api'
import { useAuthStore } from '../../store/authStore'

export function BuyerRequestQuotePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    phone: '', address: '', notes: '', minOrderQty: '50'
  })
  const [unselectedIds, setUnselectedIds] = useState(new Set())

  const toggleSelection = (id) => {
    setUnselectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const [searchParams] = useSearchParams()
  const catalogId = searchParams.get('catalogId')
  const productId = searchParams.get('productId')

  const wishlistQ = useQuery({ queryKey: ['wishlist'], queryFn: () => api('/wishlist') })
  const wishlistItems = Array.isArray(wishlistQ.data) ? wishlistQ.data : []

  const catalogQ = useQuery({
    queryKey: ['catalogs', catalogId],
    queryFn: () => api(`/catalogs/${catalogId}`),
    enabled: !!catalogId
  })

  const productQ = useQuery({
    queryKey: ['products', productId],
    queryFn: () => api(`/products/${productId}`),
    enabled: !!productId
  })
  
  // Normalize catalog items to match wishlist item structure for the quote payload
  const catalogItems = catalogId && catalogQ.data?.items 
    ? catalogQ.data.items.map(item => ({
        id: `cat_item_${item.id}`,
        productId: item.id,
        product: { id: item.id, sku: item.sku, name: item.name, price: item.price || 0 }
      }))
    : []

  const singleProductItem = productId && productQ.data
    ? [{
        id: `single_item_${productQ.data.id}`,
        productId: productQ.data.id,
        product: productQ.data
      }]
    : []

  const requestItems = catalogId ? catalogItems : (productId ? singleProductItem : wishlistItems)
  const finalItemsToQuote = requestItems.filter(wi => !unselectedIds.has(wi.id))

  const submitM = useMutation({
    mutationFn: (data) => api('/quotes', {
      method: 'POST',
      body: JSON.stringify({
        buyerName: user?.name || '', buyerEmail: user?.email || '', buyerCompany: user?.company || '',
        buyerPhone: data.phone, buyerCountry: user?.country || '', buyerAddress: data.address, source: 'Buyer Portal',
        items: finalItemsToQuote.map(wi => {
          // Fake products from catalog builder have IDs like "p1", "p2", or "p_168...". 
          // Real Prisma UUIDs are hex, so they never start with 'p'.
          const isFakeId = wi.productId && wi.productId.startsWith('p')
          return {
            productId: isFakeId ? undefined : wi.productId,
            sku: wi.product?.sku || 'UNKNOWN',
            name: wi.product?.name || 'Catalog Item',
            qty: parseInt(data.minOrderQty) || 50, 
            unitPrice: parseFloat(String(wi.product?.price || '0').replace(/[^0-9.]/g, '')) || 0
          }
        }),
        internalNotes: data.notes
      })
    }),
    onSuccess: () => setSubmitted(true),
    onError: (e) => toast.error(e.message || 'Failed to submit quote request')
  })

  if (submitted) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="text-5xl">✅</div>
      <h1 className="text-2xl font-bold text-content-primary">Quote Request Submitted</h1>
      <p className="text-sm text-content-secondary max-w-sm">Thank you, {user?.name || 'there'}! Our team will review your request and respond shortly.</p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => navigate('/buyer/home')}>Go Home</Button>
        <Button onClick={() => navigate('/buyer/catalogs')}>Browse More</Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-content-primary">Request a Quote</h1>
        <p className="text-sm text-content-secondary mt-1">Fill in your details and we'll prepare a personalized wholesale quote.</p>
      </div>

      {requestItems.length > 0 && (
        <div className="p-4 rounded-xl border border-border-subtle bg-app-card-muted">
          <div className="text-sm font-medium text-content-primary mb-3">
            Items included in this quote request ({finalItemsToQuote.length} selected)
            {catalogId && <span className="ml-2 text-xs text-brand">(From Catalog)</span>}
          </div>
          <div className="space-y-2">
            {requestItems.map(wi => {
              const isSelected = !unselectedIds.has(wi.id)
              return (
                <div key={wi.id} className={`flex items-center justify-between p-2 rounded-lg transition-all ${isSelected ? 'bg-white border border-border-subtle shadow-sm' : 'opacity-50 grayscale border border-transparent'}`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleSelection(wi.id)}
                      className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer"
                    />
                    <span className={`text-sm ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-500 line-through'}`}>{wi.product?.name || 'Product'}</span>
                  </div>
                  <span className="text-gray-400 font-mono text-xs">{wi.product?.sku}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="text-sm font-medium text-content-primary">Phone Number</label><Input className="mt-1" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Optional contact number" /></div>
        <div><label className="text-sm font-medium text-content-primary">Min. Order Qty</label><Input className="mt-1" type="number" value={form.minOrderQty} onChange={e => setForm({ ...form, minOrderQty: e.target.value })} /></div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-content-primary">Shipping Address</label>
          <textarea className="mt-1 w-full rounded-xl border border-border-subtle px-3 py-2 text-sm min-h-[60px] outline-none focus:ring-2 focus:ring-brand resize-none" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Optional shipping address for more accurate quote..." />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-content-primary">Notes</label>
          <textarea className="mt-1 w-full rounded-xl border border-border-subtle px-3 py-2 text-sm min-h-[80px] outline-none focus:ring-2 focus:ring-brand resize-none" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any specific requirements, sizes, colours…" />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
        <Button onClick={() => submitM.mutate(form)} disabled={submitM.isPending}>
          {submitM.isPending ? 'Submitting…' : 'Submit Quote Request'}
        </Button>
      </div>
    </div>
  )
}
