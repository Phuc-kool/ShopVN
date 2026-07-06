import { useQuery } from '@tanstack/react-query'
import { orderApi } from '../../api/orderApi'
import { productApi } from '../../api/productApi'
import AdminLayout from '../../components/admin/AdminLayout'
import StatCard from '../../components/admin/StatCard'
import DataTable from '../../components/admin/DataTable'
import { formatPrice, formatDate, STATUS_LABEL, STATUS_CLASS } from '../../utils/formatPrice'
import {
  ShoppingBag, Package, DollarSign, AlertTriangle
} from 'lucide-react'

export default function DashboardPage() {

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => orderApi.adminGetStats().then(r => r.data),
  })

  const { data: recentOrders, isLoading: loadingOrders } = useQuery({
    queryKey: ['admin-orders-recent'],
    queryFn: () => orderApi.adminGetAll({ page: 0, size: 8 }).then(r => r.data),
  })

  const { data: lowStock, isLoading: loadingStock } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => productApi.adminLowStock(5).then(r => r.data),
  })

  const orderColumns = [
    { key: 'id',     header: 'Mã đơn', render: r => <span className="font-mono text-xs">#{r.id}</span> },
    { key: 'status', header: 'Trạng thái', render: r => <span className={STATUS_CLASS[r.status]}>{STATUS_LABEL[r.status]}</span> },
    { key: 'total',  header: 'Tổng tiền',  render: r => <span className="font-medium">{formatPrice(r.totalAmount)}</span> },
    { key: 'date',   header: 'Ngày đặt',   render: r => <span className="text-gray-400 text-xs">{formatDate(r.createdAt)}</span> },
  ]

  const stockColumns = [
    { key: 'name',  header: 'Sản phẩm', render: r => <span className="font-medium text-sm line-clamp-1">{r.name}</span> },
    { key: 'stock', header: 'Tồn kho',  render: r => (
        <span className={`font-semibold ${r.stock === 0 ? 'text-red-500' : 'text-orange-500'}`}>
          {r.stock === 0 ? 'Hết hàng' : `Còn ${r.stock}`}
        </span>
      )
    },
    { key: 'price', header: 'Giá',      render: r => formatPrice(r.price) },
  ]

  return (
    <AdminLayout title="Dashboard">
      {}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Tổng đơn hàng"
          value={stats?.totalOrders ?? '—'}
          icon={ShoppingBag}
          color="blue"
        />
        <StatCard
          title="Doanh thu"
          value={stats ? formatPrice(stats.totalRevenue) : '—'}
          icon={DollarSign}
          color="green"
          sub="Đơn đã giao"
        />
        <StatCard
          title="Sản phẩm"
          value={stats?.totalProducts ?? '—'}
          icon={Package}
          color="purple"
        />
        <StatCard
          title="Sắp hết hàng"
          value={stats?.lowStockCount ?? '—'}
          icon={AlertTriangle}
          color={stats?.lowStockCount > 0 ? 'red' : 'green'}
          sub="Stock ≤ 5"
        />
      </div>

      {}
      <div className="grid lg:grid-cols-2 gap-6">
        {}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Đơn hàng gần đây</h2>
          <DataTable
            columns={orderColumns}
            data={recentOrders?.content}
            isLoading={loadingOrders}
            emptyText="Chưa có đơn hàng"
          />
        </div>

        {}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-orange-500" />
            Sản phẩm sắp hết hàng
          </h2>
          <DataTable
            columns={stockColumns}
            data={lowStock}
            isLoading={loadingStock}
            emptyText="Tất cả sản phẩm còn hàng"
          />
        </div>
      </div>
    </AdminLayout>
  )
}
