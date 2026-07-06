import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '../../api/productApi'
import { cartApi } from '../../api/cartApi'
import { useCart } from '../../context/CartContext'
import Navbar from '../../components/common/Navbar'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatPrice } from '../../utils/formatPrice'
import { ShoppingCart, ArrowLeft, Minus, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { refreshCount } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getById(id).then(r => r.data),
  })

  const handleAddToCart = async () => {
    setAdding(true)
    try {
      await cartApi.addItem({ productId: product.id, quantity })
      await refreshCount()
      toast.success('Đã thêm vào giỏ hàng!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể thêm vào giỏ')
    } finally {
      setAdding(false)
    }
  }

  const handleBuyNow = async () => {
    setAdding(true)
    try {
      await cartApi.addItem({ productId: product.id, quantity })
      await refreshCount()
      navigate('/cart')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể thêm vào giỏ')
      setAdding(false)
    }
  }

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <LoadingSpinner className="py-32" size="lg" />
    </div>
  )

  if (isError || !product) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-32 text-gray-400">
        <p className="text-5xl mb-4">😕</p>
        <p className="text-lg">Sản phẩm không tồn tại</p>
        <Link to="/" className="btn-primary mt-4 inline-block">Về trang chủ</Link>
      </div>
    </div>
  )

  const imageUrl = product.imageUrl || 'https://placehold.co/600x600?text=No+Image'
  const isOutOfStock = product.stock === 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div className="card overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {}
            <div className="aspect-square bg-gray-100">
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://placehold.co/600x600?text=No+Image' }}
              />
            </div>

            {}
            <div className="p-6 md:p-8 flex flex-col">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                {product.categoryName}
              </p>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug mb-4">
                {product.name}
              </h1>

              <div className="text-2xl font-bold text-primary-600 mb-4">
                {formatPrice(product.price)}
              </div>

              {}
              <div className="mb-4">
                {isOutOfStock ? (
                  <span className="text-sm text-red-500 font-medium">Hết hàng</span>
                ) : product.stock <= 10 ? (
                  <span className="text-sm text-orange-500">Còn {product.stock} sản phẩm</span>
                ) : (
                  <span className="text-sm text-green-600">Còn hàng</span>
                )}
              </div>

              {}
              {product.description && (
                <p className="text-sm text-gray-600 leading-relaxed mb-6 flex-1">
                  {product.description}
                </p>
              )}

              {}
              {!isOutOfStock && (
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-sm font-medium text-gray-700">Số lượng:</span>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-3 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-4 py-2 text-sm font-medium min-w-[40px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      className="px-3 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}

              {}
              <div className="flex gap-3 mt-auto">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || adding}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-primary-600 text-primary-600 font-semibold hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ShoppingCart size={18} />
                  Thêm vào giỏ
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock || adding}
                  className="flex-1 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {adding ? 'Đang xử lý...' : 'Mua ngay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
