import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Package, Tag, ShoppingBag, LogOut, Store
} from 'lucide-react'

const navItems = [
  { to: '/admin',            icon: LayoutDashboard, label: 'Dashboard',   end: true },
  { to: '/admin/products',   icon: Package,         label: 'Sản phẩm'              },
  { to: '/admin/categories', icon: Tag,             label: 'Danh mục'              },
  { to: '/admin/orders',     icon: ShoppingBag,     label: 'Đơn hàng'              },
]

export default function AdminSidebar() {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-100 flex flex-col fixed top-0 left-0 z-30">
      {}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Store size={20} className="text-primary-600" />
          <span className="font-bold text-gray-900">ShopVN Admin</span>
        </div>
      </div>

      {}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={17} />
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
