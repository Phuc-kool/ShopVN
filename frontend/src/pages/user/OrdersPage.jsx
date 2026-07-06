import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { orderApi } from '../../api/orderApi'
import Navbar from '../../components/common/Navbar'
import Pagination from '../../components/common/Pagination'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatPrice, formatDate, STATUS_LABEL, STATUS_CLASS } from '../../utils/formatPrice'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'

export default function OrdersPage() {
  const [page, setPage]           = useState(0)
  const [expandedId, setExpandedId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders', page],
    queryFn: () => orderApi.getMyOrders({ page, size: 10 }).then(r => r.data),
    keepPreviousData: true,
  })

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['order-detail', expandedId],
    queryFn: () => orderApi.getMyOrderById(expandedId).then(r => r.data),
    enabled: !!expandedId,
  })

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Đơn hàng của tôi</h1>

        {isLoading ? (
          <LoadingSpinner className="py-24" size="lg" />
        ) : !data?.content?.length ? (
          <div className="card text-center py-20">
            <Package size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {data.content.map(order => (
                <div key={order.id} className="card overflow-hidden">
                  {}
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpand(order.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900">
                          Đơn #{order.id}
                        </span>
                        <span className={STATUS_CLASS[order.status]}>
                          {STATUS_LABEL[order.status]}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-gray-900 text-sm">
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>

                    <div className="text-gray-400 flex-shrink-0">
                      {expandedId === order.id
                        ? <ChevronUp size={18} />
                        : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {}
                  {expandedId === order.id && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      {detailLoading ? (
                        <LoadingSpinner className="py-4" size="sm" />
                      ) : detail ? (
                        <>
                          <p className="text-xs text-gray-500 mb-3">
                            <span className="font-medium">Địa chỉ:</span> {detail.shippingAddress}
                          </p>
                          {detail.note && (
                            <p className="text-xs text-gray-500 mb-3">
                              <span className="font-medium">Ghi chú:</span> {detail.note}
                            </p>
                          )}
                          <div className="space-y-2">
                            {detail.items?.map(item => (
                              <div key={item.id} className="flex gap-3 items-center">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-gray-100">
                                  <img
                                    src={item.productImage || 'https://placehold.co/40x40?text=?'}
                                    alt={item.productName}
                                    className="w-full h-full object-cover"
                                    onError={e => { e.target.src = 'https://placehold.co/40x40?text=?' }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-gray-800 line-clamp-1">{item.productName}</p>
                                  <p className="text-xs text-gray-400">
                                    {formatPrice(item.unitPrice)} × {item.quantity}
                                  </p>
                                </div>
                                <p className="text-xs font-semibold text-gray-900 flex-shrink-0">
                                  {formatPrice(item.subtotal)}
                                </p>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                            <span className="text-xs font-semibold text-gray-700">Tổng cộng</span>
                            <span className="text-sm font-bold text-primary-600">
                              {formatPrice(detail.totalAmount)}
                            </span>
                          </div>
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={data?.totalPages || 0}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  )
}
