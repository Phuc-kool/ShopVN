import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoryApi } from '../../api/categoryApi'
import AdminLayout from '../../components/admin/AdminLayout'
import DataTable from '../../components/admin/DataTable'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ManageCategoriesPage() {
  const queryClient = useQueryClient()
  const [form, setForm]             = useState({ name: '', slug: '' })
  const [editId, setEditId]         = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showForm, setShowForm]     = useState(false)

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => categoryApi.adminGetAll().then(r => r.data),
  })

  const invalidate = () => queryClient.invalidateQueries(['admin-categories'])

  const createMutation = useMutation({
    mutationFn: (data) => categoryApi.adminCreate(data),
    onSuccess: () => { toast.success('Tạo danh mục thành công'); invalidate(); resetForm() },
    onError:   (err) => toast.error(err.response?.data?.message || 'Lỗi tạo danh mục'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => categoryApi.adminUpdate(id, data),
    onSuccess: () => { toast.success('Cập nhật thành công'); invalidate(); resetForm() },
    onError:   (err) => toast.error(err.response?.data?.message || 'Lỗi cập nhật'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => categoryApi.adminDelete(id),
    onSuccess: () => { toast.success('Đã xoá danh mục'); invalidate(); setDeleteTarget(null) },
    onError:   (err) => toast.error(err.response?.data?.message || 'Không thể xoá danh mục này'),
  })

  const resetForm = () => { setForm({ name: '', slug: '' }); setEditId(null); setShowForm(false) }

  const handleEdit = (cat) => {
    setForm({ name: cat.name, slug: cat.slug })
    setEditId(cat.id)
    setShowForm(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Tên danh mục không được để trống'); return }
    if (editId) {
      updateMutation.mutate({ id: editId, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const columns = [
    { key: 'id',           header: 'ID',           render: r => <span className="text-gray-400 text-xs">#{r.id}</span> },
    { key: 'name',         header: 'Tên danh mục', render: r => <span className="font-medium">{r.name}</span> },
    { key: 'slug',         header: 'Slug',         render: r => <span className="font-mono text-xs text-gray-400">{r.slug}</span> },
    { key: 'productCount', header: 'Sản phẩm',     render: r => <span className="text-gray-600">{r.productCount ?? 0}</span> },
    {
      key: 'actions', header: '',
      render: (r) => (
        <div className="flex items-center gap-1 justify-end">
          <button onClick={() => handleEdit(r)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={() => setDeleteTarget(r)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <AdminLayout title="Quản lý danh mục">
      {}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-400">{categories?.length ?? 0} danh mục</p>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="btn-primary flex items-center gap-1.5 text-sm"
        >
          <Plus size={15} /> Thêm danh mục
        </button>
      </div>

      {}
      {showForm && (
        <div className="card p-5 mb-4">
          <h3 className="font-semibold text-gray-900 mb-4">
            {editId ? 'Sửa danh mục' : 'Thêm danh mục mới'}
          </h3>
          <form onSubmit={handleSubmit} className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">Tên danh mục *</label>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="vd: Điện thoại"
                className="input"
                autoFocus
              />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Slug <span className="text-gray-400">(tự động nếu để trống)</span>
              </label>
              <input
                value={form.slug}
                onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                placeholder="vd: dien-thoai"
                className="input font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-1.5">
                <Check size={15} /> {editId ? 'Lưu' : 'Tạo'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary flex items-center gap-1">
                <X size={15} /> Huỷ
              </button>
            </div>
          </form>
        </div>
      )}

      {}
      <DataTable columns={columns} data={categories} isLoading={isLoading} emptyText="Chưa có danh mục nào" />

      {}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Xoá danh mục"
        message={`Bạn chắc chắn muốn xoá danh mục "${deleteTarget?.name}"? Không thể hoàn tác.`}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </AdminLayout>
  )
}
