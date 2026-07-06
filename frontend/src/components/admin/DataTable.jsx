import LoadingSpinner from '../common/LoadingSpinner'
import Pagination from '../common/Pagination'

export default function DataTable({
  columns,
  data,
  isLoading,
  pagination,
  emptyText = 'Không có dữ liệu',
}) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {columns.map(col => (
                <th
                  key={col.key}
                  className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-16">
                  <LoadingSpinner size="md" />
                </td>
              </tr>
            ) : !data?.length ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-16 text-gray-400"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-gray-700">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="px-4 py-3 border-t border-gray-100">
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  )
}
