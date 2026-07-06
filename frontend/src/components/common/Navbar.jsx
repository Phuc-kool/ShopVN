import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { ShoppingCart, LogOut, User, Settings } from 'lucide-react'

export default function Navbar() {
  const { user, logout, isAdmin, isLoggedIn } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {}
          <Link to="/" className="text-xl font-bold text-primary-600">
            ShopVN
          </Link>

          {}
          <div className="flex items-center gap-3">

            {isLoggedIn ? (
              <>
                {}
                {!isAdmin && (
                  <Link
                    to="/cart"
                    className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    <ShoppingCart size={22} />
                    {cartCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </Link>
                )}

                {}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary-50"
                  >
                    <Settings size={16} />
                    <span>Quản trị</span>
                  </Link>
                )}

                {}
                <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
                  <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600">
                    <User size={16} />
                    <span className="max-w-[120px] truncate">{user?.fullName}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors px-2 py-1.5 rounded-lg"
                  >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">Đăng xuất</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm py-1.5">Đăng nhập</Link>
                <Link to="/register" className="btn-primary text-sm py-1.5">Đăng ký</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
