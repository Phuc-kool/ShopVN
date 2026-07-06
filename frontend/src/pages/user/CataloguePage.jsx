import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '../../api/productApi'
import { cartApi } from '../../api/cartApi'
import { useCart } from '../../context/CartContext'
import Navbar from '../../components/common/Navbar'
import ProductCard from '../../components/product/ProductCard'
import ProductFilter from '../../components/product/ProductFilter'
import Pagination from '../../components/common/Pagination'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

export default function CataloguePage() {
  const { refreshCount } = useCart()
  const [filters, setFilters] = useState({
    search: '', categoryId: '', sort: 'createdAt,desc',
    minPrice: '', maxPrice: '', page: 0, size: 12,
  })

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productApi.getAll({
      page: filters.page,
      size: filters.size,
      sort: filters.sort,
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.search    && { search: filters.search }),
      ...(filters.minPrice  && { minPrice: filters.minPrice }),
      ...(filters.maxPrice  && { maxPrice: filters.maxPrice }),
    }).then(r => r.data),
    keepPreviousData: true,
  })

  const handleAddToCart = async (product) => {
    try {
      await cartApi.addItem({ productId: product.id, quantity: 1 })
      await refreshCount()
      toast.success(`Đã thêm "${product.name}" vào giỏ`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể thêm vào giỏ')
    }
  }

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
            {data && (
              <p className="text-sm text-gray-400 mt-0.5">
                {data.totalElements} sản phẩm
              </p>
            )}
          </div>
        </div>

        {}
        <ProductFilter filters={filters} onChange={setFilters} />

        {}
        {isLoading ? (
          <LoadingSpinner className="py-24" size="lg" />
        ) : isError ? (
          <div className="text-center py-24 text-red-400">
            Không thể tải sản phẩm. Vui lòng thử lại.
          </div>
        ) : data?.content?.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p>Không tìm thấy sản phẩm phù hợp</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {data?.content?.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            <Pagination
              page={filters.page}
              totalPages={data?.totalPages || 0}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  )
}
