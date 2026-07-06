import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { categoryApi } from '../../api/categoryApi'

export default function ProductFilter({ filters, onChange }) {
  const [categories, setCategories] = useState([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    categoryApi.getAll().then(r => setCategories(r.data)).catch(() => {})
  }, [])

  const handleSearch = (e) => {
    onChange({ ...filters, search: e.target.value, page: 0 })
  }

  const handleCategory = (id) => {
    onChange({ ...filters, categoryId: filters.categoryId === id ? '' : id, page: 0 })
  }

  const handleSort = (e) => {
    onChange({ ...filters, sort: e.target.value, page: 0 })
  }

  const handleMinPrice = (e) => {
    onChange({ ...filters, minPrice: e.target.value, page: 0 })
  }

  const handleMaxPrice = (e) => {
    onChange({ ...filters, maxPrice: e.target.value, page: 0 })
  }

  const clearFilters = () => {
    onChange({ search: '', categoryId: '', sort: 'createdAt,desc', minPrice: '', maxPrice: '', page: 0 })
  }

  const hasActiveFilter = filters.categoryId || filters.minPrice || filters.maxPrice || filters.search

  return (
    <div className="mb-6">
      {}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={filters.search}
            onChange={handleSearch}
            className="input pl-9"
          />
        </div>
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
            open || hasActiveFilter
              ? 'border-primary-500 text-primary-600 bg-primary-50'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal size={15} />
          Lọc
          {hasActiveFilter && (
            <span className="bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">!</span>
          )}
        </button>
        {hasActiveFilter && (
          <button onClick={clearFilters} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      {}
      {open && (
        <div className="card p-4 space-y-4">
          {}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Sắp xếp</label>
            <select value={filters.sort} onChange={handleSort} className="input">
              <option value="createdAt,desc">Mới nhất</option>
              <option value="price,asc">Giá tăng dần</option>
              <option value="price,desc">Giá giảm dần</option>
              <option value="name,asc">Tên A-Z</option>
            </select>
          </div>

          {}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Danh mục</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    filters.categoryId === cat.id
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-gray-200 text-gray-600 hover:border-primary-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Khoảng giá (₫)</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Từ"
                value={filters.minPrice}
                onChange={handleMinPrice}
                className="input"
                min={0}
              />
              <span className="text-gray-400 flex-shrink-0">—</span>
              <input
                type="number"
                placeholder="Đến"
                value={filters.maxPrice}
                onChange={handleMaxPrice}
                className="input"
                min={0}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
