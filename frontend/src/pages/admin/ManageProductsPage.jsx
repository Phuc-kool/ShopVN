import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productApi } from '../../api/productApi'
import AdminLayout from '../../components/admin/AdminLayout'
import DataTable from '../../components/admin/DataTable'
import Modal from '../../components/admin/Modal'
import ProductForm from '../../components/admin/ProductForm'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { formatPrice } from '../../utils/formatPrice'
import {
  Plus, Search, Pencil, Trash2, Eye, EyeOff, X
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ManageProductsPage() {
  const queryClient = useQueryClient()

  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(0)
  const [modal, setModal]           = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search, page],
    queryFn: () => productApi.adminGetAll({
      page, size: 15,
      sort: 'createdAt,desc',
      ...(search && { search }),
    }).then(r => r.data),
    keepPreviousData: true,
  })

  const invalidate = () => {
    queryClient.invalidateQueries(['admin-products'])
    queryClient.invalidateQueries(['admin-stats'])
  }

  const createMutation = useMutation({
    mutationFn: (formData) => productApi.adminCreate(formData),
    onSuccess: () => {
      toast.success('Tạo sản phẩm thành công')
      invalidate()
      setModal(null)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi tạo sản phẩm'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }) => productApi.adminUpdate(id, formData),
    onSuccess: () => {
      toast.success('Cập nhật thành công')
      invalidate()
      setModal(null)
      setEditTarget(null)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi cập nhật'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => productApi.adminDelete(id),
    onSuccess: () => {
      toast.success('Đã xoá sản phẩm')
      invalidate()
      setDeleteTarget(null)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể xoá sản phẩm'),
  })

  const toggleMutation = useMutation({
    mutationFn: (id) => productApi.adminToggle(id),
    onSuccess: (res) => {
      const enabled = res.data.enabled
      toast.success(enabled ? 'Đã bật hiển thị' : 'Đã ẩn sản phẩm')
      invalidate()
    },
    onError: () => toast.error('Không thể thay đổi trạng thái'),
  })

  const handleEdit = (product) => {
    setEditTarget(product)
    setModal('edit')
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setPage(0)
  }

  const clearSearch = () => { setSearch(''); setPage(0) }

  const columns = [
    {
      key: 'image', header: 'Ảnh',
      render: (r) => (
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <img
            src={r.imageUrl || 'https://placehold.co/40x40?text=?'}
            alt={r.name}
            className="w-full h-full object-cover"
            onError={e => { e.target.src = 'https://placehold.co/40x40?text=?' }}
          />
        </div>
      ),
    },
    {
      key: 'name', header: 'Sản phẩm',
      render: (r) => (
        <div>
          <p className="font-medium text-gray-900 text-sm line-clamp-1">{r.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{r.categoryName}</p>
        </div>
      ),
    },
    {
      key: 'price', header: 'Giá',
      render: (r) => <span className="font-medium text-primary-600 text-sm whitespace-nowrap">{formatPrice(r.price)}</span>,
    },
    {
      key: 'stock', header: 'Tồn kho',
      render: (r) => (
        <span className={`text-sm font-medium ${
          r.stock === 0    ? 'text-red-500'
          : r.stock <= 5  ? 'text-orange-500'
          : 'text-gray-700'
        }`}>
          {r.stock}
        </span>
      ),
    },
    {
      key: 'enabled', header: 'Hiển thị',
      render: (r) => (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          r.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
        }`}>
          {r.enabled ? 'Đang bán' : 'Đã ẩn'}
        </span>
      ),
    },
    {
      key: 'actions', header: '',
      render: (r) => (
        <div className="flex items-center gap-1 justify-end">
          {}
          <button
            onClick={() => toggleMutation.mutate(r.id)}
            disabled={toggleMutation.isPending}
            title={r.enabled ? 'Ẩn sản phẩm' : 'Hiện sản phẩm'}
            className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
          >
            {r.enabled ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>

          {}
          <button
            onClick={() => handleEdit(r)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
          >
            <Pencil size={14} />
          </button>

          {}
          <button
            onClick={() => setDeleteTarget(r)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <AdminLayout title="Quản lý sản phẩm">
      {}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={handleSearch}
            placeholder="Tìm tên sản phẩm..."
            className="input pl-9 pr-8"
          />
          {search && (
            <button
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {}
        {data && (
          <p className="text-sm text-gray-400 whitespace-nowrap">
            {data.totalElements} sản phẩm
          </p>
        )}

        {}
        <button
          onClick={() => { setEditTarget(null); setModal('create') }}
          className="btn-primary flex items-center gap-1.5 text-sm whitespace-nowrap"
        >
          <Plus size={15} /> Thêm sản phẩm
        </button>
      </div>

      {}
      <DataTable
        columns={columns}
        data={data?.content}
        isLoading={isLoading}
        emptyText={search ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}
        pagination={data ? {
          page,
          totalPages: data.totalPages,
          onPageChange: setPage,
        } : undefined}
      />

      {}
      <Modal
        open={modal === 'create'}
        title="Thêm sản phẩm mới"
        onClose={() => setModal(null)}
        size="lg"
      >
        <ProductForm
          onSubmit={(formData) => createMutation.mutate(formData)}
          onCancel={() => setModal(null)}
          loading={isSubmitting}
        />
      </Modal>

      {}
      <Modal
        open={modal === 'edit'}
        title="Chỉnh sửa sản phẩm"
        onClose={() => { setModal(null); setEditTarget(null) }}
        size="lg"
      >
        <ProductForm
          initial={editTarget}
          onSubmit={(formData) => updateMutation.mutate({ id: editTarget.id, formData })}
          onCancel={() => { setModal(null); setEditTarget(null) }}
          loading={isSubmitting}
        />
      </Modal>

      {}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Xoá sản phẩm"
        message={`Bạn chắc chắn muốn xoá "${deleteTarget?.name}"? Thao tác này không thể hoàn tác.`}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </AdminLayout>
  )
}
