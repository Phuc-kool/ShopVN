import AdminSidebar from './AdminSidebar'

export default function AdminLayout({ children, title }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      {}
      <div className="flex-1 ml-56">
        {}
        <header className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-20">
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </header>

        {}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
