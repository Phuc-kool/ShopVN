import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { cartApi } from '../../api/cartApi'
import { orderApi } from '../../api/orderApi'
import { useCart } from '../../context/CartContext'
import Navbar from '../../components/common/Navbar'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatPrice } from '../../utils/formatPrice'
import { MapPin, FileText, ArrowLeft, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { refreshCount } = useCart()
  const [form, setForm]       = useState({ shippingAddress: '', note: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.getCart().then(r => r.data),
  })

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.shippingAddress.trim()) {
      toast.error('Vui lòng nhập địa chỉ giao hàng')
      return
    }
    if (!cart?.items?.length) {
      toast.error('Giỏ hàng trống')
      return
    }
    setLoading(true)
    try {
      const res = await orderApi.placeOrder(form)
      const { paymentUrl } = res.data

      if (paymentUrl) {

        window.location.href = paymentUrl
        return
      }

      await refreshCount()
      setSuccess(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đặt hàng thất bại')
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h2>
        <p className="text-gray-500 mb-8">Đơn hàng của bạn đã được tiếp nhận. Chúng tôi sẽ liên hệ xác nhận sớm nhất.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/orders" className="btn-primary">Xem đơn hàng</Link>
          <Link to="/" className="btn-secondary">Tiếp tục mua sắm</Link>
        </div>
      </div>
    </div>
  )

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50"><Navbar /><LoadingSpinner className="py-32" size="lg" /></div>
  )

  if (!cart?.items?.length) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-32">
        <p className="text-gray-500 mb-4">Giỏ hàng trống, không thể thanh toán</p>
        <Link to="/" className="btn-primary">Về trang chủ</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {}
        <button onClick={() => navigate('/cart')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft size={16} /> Quay lại giỏ hàng
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Thanh toán</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="card p-5">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin size={18} className="text-primary-500" /> Địa chỉ giao hàng
                </h2>
                <textarea
                  name="shippingAddress"
                  value={form.shippingAddress}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                  className="input resize-none"
                  required
                />
              </div>

              <div className="card p-5">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-primary-500" /> Ghi chú (tuỳ chọn)
                </h2>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Giao giờ hành chính, gọi trước khi giao..."
                  className="input resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base"
              >
                {loading ? 'Đang đặt hàng...' : `Đặt hàng • ${formatPrice(cart.totalAmount)}`}
              </button>
            </form>
          </div>

          {}
          <div className="card p-5 h-fit">
            <h2 className="font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>
            <div className="space-y-3 mb-4">
              {cart.items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={item.productImage || 'https://placehold.co/48x48?text=?'}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                      onError={e => { e.target.src = 'https://placehold.co/48x48?text=?' }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 line-clamp-2 leading-snug">{item.productName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">×{item.quantity}</p>
                  </div>
                  <p className="text-xs font-medium text-gray-900 flex-shrink-0">{formatPrice(item.subtotal)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="font-semibold text-gray-900">Tổng</span>
              <span className="font-bold text-primary-600">{formatPrice(cart.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
