import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderApi } from '../../api/orderApi'
import AdminLayout from '../../components/admin/AdminLayout'
import DataTable from '../../components/admin/DataTable'
import Modal from '../../components/admin/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatPrice, formatDate, STATUS_LABEL, STATUS_CLASS } from '../../utils/formatPrice'
import { Eye, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

const NEXT_STATUS = {
  PENDING:   ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED',   'CANCELLED'],
  SHIPPED:   ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

const STATUS_COLORS = {
  PENDING:   'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  SHIPPED:   'bg-purple-100 text-purple-800 border-purple-200',
  DELIVERED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
}

export default function ManageOrdersPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage]                 = useState(0)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetail, setShowDetail]     = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter, page],
    queryFn: () => orderApi.adminGetAll({
      page, size: 15,
      sort: 'createdAt,desc',
      ...(statusFilter && { status: statusFilter }),
    }).then(r => r.data),
    keepPreviousData: true,
  })

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['admin-order-detail', selectedOrder?.id],
    queryFn: () => orderApi.adminGetById(selectedOrder.id).then(r => r.data),
    enabled: !!selectedOrder && showDetail,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => orderApi.adminUpdateStatus(id, { status }),
    onSuccess: (_, { status }) => {
      toast.success(`Đã chuyển sang: ${STATUS_LABEL[status]}`)
      queryClient.invalidateQueries(['admin-orders'])
      queryClient.invalidateQueries(['admin-order-detail', selectedOrder?.id])
      queryClient.invalidateQueries(['admin-stats'])
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể đổi trạng thái'),
  })

  const handleViewDetail = (order) => {
    setSelectedOrder(order)
    setShowDetail(true)
  }

  const handleStatusChange = (orderId, newStatus) => {
    statusMutation.mutate({ id: orderId, status: newStatus })
  }

  const allStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

  const columns = [
    {
      key: 'id', header: 'Mã đơn',
      render: r => <span className="font-mono text-xs font-semibold text-gray-700">#{r.id}</span>,
    },
    {
      key: 'status', header: 'Trạng thái',
      render: r => (
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[r.status]}`}>
          {STATUS_LABEL[r.status]}
        </span>
      ),
    },
    {
      key: 'totalAmount', header: 'Tổng tiền',
      render: r => <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">{formatPrice(r.totalAmount)}</span>,
    },
    {
      key: 'shippingAddress', header: 'Địa chỉ',
      render: r => <span className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">{r.shippingAddress}</span>,
    },
    {
      key: 'createdAt', header: 'Ngày đặt',
      render: r => <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(r.createdAt)}</span>,
    },
    {
      key: 'actions', header: '',
      render: r => (
        <div className="flex items-center gap-1 justify-end">
          {}
          {NEXT_STATUS[r.status]?.map(next => (
            <button
              key={next}
              onClick={() => handleStatusChange(r.id, next)}
              disabled={statusMutation.isPending}
              className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors disabled:opacity-50 whitespace-nowrap ${STATUS_COLORS[next]} hover:opacity-80`}
            >
              → {STATUS_LABEL[next]}
            </button>
          ))}

          {}
          <button
            onClick={() => handleViewDetail(r)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors ml-1"
          >
            <Eye size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <AdminLayout title="Quản lý đơn hàng">
      {}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button
          onClick={() => { setStatusFilter(''); setPage(0) }}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            !statusFilter
              ? 'bg-gray-900 text-white border-gray-900'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Tất cả
        </button>
        {allStatuses.map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(0) }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              statusFilter === s
                ? `${STATUS_COLORS[s]} border-current`
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}

        {data && (
          <span className="ml-auto text-sm text-gray-400">{data.totalElements} đơn</span>
        )}
      </div>

      {}
      <DataTable
        columns={columns}
        data={data?.content}
        isLoading={isLoading}
        emptyText="Không có đơn hàng nào"
        pagination={data ? {
          page,
          totalPages: data.totalPages,
          onPageChange: setPage,
        } : undefined}
      />

      {}
      <Modal
        open={showDetail}
        title={`Chi tiết đơn #${selectedOrder?.id}`}
        onClose={() => { setShowDetail(false); setSelectedOrder(null) }}
        size="md"
      >
        {detailLoading ? (
          <LoadingSpinner className="py-10" />
        ) : detail ? (
          <div className="space-y-4">
            {}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm font-medium px-3 py-1 rounded-full border ${STATUS_COLORS[detail.status]}`}>
                {STATUS_LABEL[detail.status]}
              </span>
              {NEXT_STATUS[detail.status]?.map(next => (
                <button
                  key={next}
                  onClick={() => handleStatusChange(detail.id, next)}
                  disabled={statusMutation.isPending}
                  className={`flex items-center gap-1 text-sm px-3 py-1 rounded-full border font-medium transition-colors disabled:opacity-50 ${STATUS_COLORS[next]} hover:opacity-80`}
                >
                  <ChevronRight size={14} /> {STATUS_LABEL[next]}
                </button>
              ))}
            </div>

            {}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-gray-400 w-24 flex-shrink-0">Ngày đặt:</span>
                <span className="text-gray-700">{formatDate(detail.createdAt)}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400 w-24 flex-shrink-0">Địa chỉ:</span>
                <span className="text-gray-700">{detail.shippingAddress}</span>
              </div>
              {detail.note && (
                <div className="flex gap-2">
                  <span className="text-gray-400 w-24 flex-shrink-0">Ghi chú:</span>
                  <span className="text-gray-700">{detail.note}</span>
                </div>
              )}
            </div>

            {}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Sản phẩm</h4>
              <div className="space-y-2">
                {detail.items?.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                      <img
                        src={item.productImage || 'https://placehold.co/48x48?text=?'}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.src = 'https://placehold.co/48x48?text=?' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.productName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatPrice(item.unitPrice)} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {}
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="font-semibold text-gray-900">Tổng cộng</span>
              <span className="text-lg font-bold text-primary-600">{formatPrice(detail.totalAmount)}</span>
            </div>
          </div>
        ) : null}
      </Modal>
    </AdminLayout>
  )
}
