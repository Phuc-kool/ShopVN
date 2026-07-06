import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cartApi } from '../../api/cartApi'
import { useCart } from '../../context/CartContext'
import Navbar from '../../components/common/Navbar'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatPrice } from '../../utils/formatPrice'
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CartPage() {
  const navigate = useNavigate()
  const { refreshCount } = useCart()
  const queryClient = useQueryClient()

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.getCart().then(r => r.data),
  })

  const removeMutation = useMutation({
    mutationFn: (itemId) => cartApi.removeItem(itemId),
    onSuccess: async () => {
      queryClient.invalidateQueries(['cart'])
      await refreshCount()
    },
    onError: () => toast.error('Không thể xoá sản phẩm'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }) =>
      cartApi.updateItem(itemId, { productId: 0, quantity }),
    onSuccess: () => queryClient.invalidateQueries(['cart']),
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể cập nhật'),
  })

  const handleQuantity = (item, delta) => {
    const newQty = item.quantity + delta
    if (newQty < 1) return
    updateMutation.mutate({ itemId: item.id, quantity: newQty })
  }

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <LoadingSpinner className="py-32" size="lg" />
    </div>
  )

  const isEmpty = !cart?.items?.length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Giỏ hàng {!isEmpty && <span className="text-gray-400 font-normal text-lg">({cart.totalItems} sản phẩm)</span>}
        </h1>

        {isEmpty ? (

          <div className="card text-center py-20">
            <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 mb-6">Giỏ hàng của bạn đang trống</p>
            <Link to="/" className="btn-primary">Tiếp tục mua sắm</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {}
            <div className="lg:col-span-2 space-y-3">
              {cart.items.map(item => (
                <div key={item.id} className="card p-4 flex gap-4">
                  {}
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={item.productImage || 'https://placehold.co/80x80?text=?'}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                      onError={e => { e.target.src = 'https://placehold.co/80x80?text=?' }}
                    />
                  </div>

                  {}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm line-clamp-2 leading-snug mb-1">
                      {item.productName}
                    </p>
                    <p className="text-primary-600 font-semibold text-sm">
                      {formatPrice(item.unitPrice)}
                    </p>
                  </div>

                  {}
                  <div className="flex flex-col items-end justify-between gap-2 flex-shrink-0">
                    {}
                    <p className="font-semibold text-gray-900 text-sm">
                      {formatPrice(item.subtotal)}
                    </p>

                    {}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuantity(item, -1)}
                        disabled={item.quantity <= 1 || updateMutation.isPending}
                        className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantity(item, 1)}
                        disabled={updateMutation.isPending}
                        className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
                      >
                        <Plus size={12} />
                      </button>

                      <button
                        onClick={() => removeMutation.mutate(item.id)}
                        disabled={removeMutation.isPending}
                        className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors ml-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {}
            <div className="lg:col-span-1">
              <div className="card p-5 sticky top-24">
                <h2 className="font-semibold text-gray-900 mb-4">Tổng đơn hàng</h2>

                <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                  {cart.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-600">
                      <span className="truncate max-w-[140px]">{item.productName} ×{item.quantity}</span>
                      <span className="flex-shrink-0 ml-2">{formatPrice(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mb-5">
                  <span className="font-semibold text-gray-900">Tổng cộng</span>
                  <span className="font-bold text-primary-600 text-lg">{formatPrice(cart.totalAmount)}</span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  Tiến hành đặt hàng <ArrowRight size={16} />
                </button>

                <Link to="/" className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-3">
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
