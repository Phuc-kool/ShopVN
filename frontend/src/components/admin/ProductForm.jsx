import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { categoryApi } from '../../api/categoryApi'
import { X, Upload, ImagePlus } from 'lucide-react'

export default function ProductForm({ initial, onSubmit, onCancel, loading }) {
  const fileRef = useRef()
  const [form, setForm] = useState({
    name: '', description: '', price: '', stock: '',
    categoryId: '', enabled: true, imageUrl: '',
  })
  const [previewUrl, setPreviewUrl] = useState(null)
  const [imageFile, setImageFile]   = useState(null)

  useEffect(() => {
    if (initial) {
      setForm({
        name:        initial.name        || '',
        description: initial.description || '',
        price:       initial.price       || '',
        stock:       initial.stock       || '',
        categoryId:  initial.categoryId  || '',
        enabled:     initial.enabled     ?? true,
        imageUrl:    initial.imageUrl    || '',
      })
      if (initial.imageUrl) setPreviewUrl(initial.imageUrl)
    }
  }, [initial])

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll().then(r => r.data),
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Chỉ chấp nhận file ảnh'); return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ảnh tối đa 5MB'); return
    }
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    setPreviewUrl(null)
    setForm(prev => ({ ...prev, imageUrl: '' }))
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim())  { alert('Tên sản phẩm không được để trống'); return }
    if (!form.price)        { alert('Giá không được để trống'); return }
    if (!form.stock && form.stock !== 0) { alert('Tồn kho không được để trống'); return }
    if (!form.categoryId)   { alert('Vui lòng chọn danh mục'); return }

    const formData = new FormData()
    const productBlob = new Blob([JSON.stringify({
      name:        form.name,
      description: form.description,
      price:       parseFloat(form.price),
      stock:       parseInt(form.stock),
      categoryId:  parseInt(form.categoryId),
      enabled:     form.enabled,
      imageUrl:    form.imageUrl,
    })], { type: 'application/json' })

    formData.append('product', productBlob)
    if (imageFile) formData.append('image', imageFile)

    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        {}
        <div className="space-y-4">
          {}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="vd: iPhone 15 Pro Max 256GB"
              className="input"
              autoFocus
            />
          </div>

          {}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Mô tả chi tiết sản phẩm..."
              className="input resize-none"
            />
          </div>

          {}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá (₫) <span className="text-red-500">*</span>
              </label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                placeholder="0"
                min={0}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tồn kho <span className="text-red-500">*</span>
              </label>
              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                placeholder="0"
                min={0}
                className="input"
              />
            </div>
          </div>

          {}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="input"
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="enabled"
              name="enabled"
              checked={form.enabled}
              onChange={handleChange}
              className="w-4 h-4 accent-primary-600"
            />
            <label htmlFor="enabled" className="text-sm font-medium text-gray-700 cursor-pointer">
              Hiển thị sản phẩm (enabled)
            </label>
          </div>
        </div>

        {}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh sản phẩm</label>

          {previewUrl ? (

            <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-square">
              <img
                src={previewUrl}
                alt="preview"
                className="w-full h-full object-cover"
                onError={() => setPreviewUrl(null)}
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (

            <div
              onClick={() => fileRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-primary-600"
            >
              <ImagePlus size={36} />
              <div className="text-center">
                <p className="text-sm font-medium">Click để chọn ảnh</p>
                <p className="text-xs mt-0.5">JPG, PNG, GIF · Tối đa 5MB</p>
              </div>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="hidden"
          />

          {imageFile && (
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <Upload size={12} /> {imageFile.name}
            </p>
          )}
        </div>
      </div>

      {}
      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="btn-secondary flex-1"
        >
          Huỷ
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex-1"
        >
          {loading ? 'Đang lưu...' : initial ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
        </button>
      </div>
    </form>
  )
}
