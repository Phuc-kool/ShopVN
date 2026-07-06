import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-red-50">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>

        <p className="text-sm text-gray-500 mb-6 leading-relaxed">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 btn-secondary"
          >
            Huỷ
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 btn-danger"
          >
            {loading ? 'Đang xoá...' : 'Xác nhận xoá'}
          </button>
        </div>
      </div>
    </div>
  )
}
