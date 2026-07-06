import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { formatPrice } from '../../utils/formatPrice'

export default function ProductCard({ product, onAddToCart }) {
  const imageUrl = product.imageUrl
    ? product.imageUrl
    : 'https://placehold.co/400x400?text=No+Image'

  return (
    <div className="card group overflow-hidden hover:shadow-md transition-shadow">
      {}
      <Link to={`/products/${product.id}`}>
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.src = 'https://placehold.co/400x400?text=No+Image' }}
          />
        </div>
      </Link>

      {}
      <div className="p-4">
        <p className="text-xs text-gray-400 mb-1">{product.categoryName}</p>
        <Link to={`/products/${product.id}`}>
          <h3 className="font-medium text-gray-900 text-sm leading-snug line-clamp-2 hover:text-primary-600 transition-colors mb-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-3">
          <span className="text-primary-600 font-semibold text-sm">
            {formatPrice(product.price)}
          </span>

          {}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="text-xs text-orange-500">Còn {product.stock}</span>
          )}
          {product.stock === 0 && (
            <span className="text-xs text-red-400">Hết hàng</span>
          )}
        </div>

        {}
        <button
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium
            bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white
            disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ShoppingCart size={15} />
          Thêm vào giỏ
        </button>
      </div>
    </div>
  )
}
