import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { orderApi } from '../../api/orderApi'
import Navbar from '../../components/common/Navbar'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { CheckCircle, AlertTriangle, Clock, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_PENDING_PAYMENT = 'PENDING_PAYMENT'
const STATUS_CONFIRMED = 'CONFIRMED'
const MAX_ATTEMPTS = 5
const POLL_INTERVAL_MS = 2000

export default function PaymentReturnPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const orderId = searchParams.get('orderId')

  const [order, setOrder] = useState(null)
  const [attempts, setAttempts] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchOrder = async () => {
    if (!orderId) return
    setLoading(true)
    setError('')
    try {
      const res = await orderApi.getMyOrderById(orderId)
      setOrder(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lấy thông tin đơn hàng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!orderId) return
    fetchOrder()
  }, [orderId])

  useEffect(() => {
    if (!orderId || !order) return
    if (order.status !== STATUS_PENDING_PAYMENT) return
    if (attempts >= MAX_ATTEMPTS) return

    const timer = setTimeout(async () => {
      try {
        const res = await orderApi.getMyOrderById(orderId)
        setOrder(res.data)
      } catch (err) {
        toast.error(err.response?.data?.message || 'Không thể xác nhận đơn hàng.')
      } finally {
        setAttempts(prev => prev + 1)
      }
    }, POLL_INTERVAL_MS)

    return () => clearTimeout(timer)
  }, [order, attempts, orderId])

  const renderLoading = () => (
    <div className="text-center py-16">
      <LoadingSpinner className="mx-auto mb-6" size="lg" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Đang xác nhận thanh toán</h2>
      <p className="text-gray-500">Vui lòng chờ trong giây lát. Nếu cần, bạn có thể làm mới trang sau.</p>
    </div>
  )

  const renderPendingMax = () => (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Clock size={64} className="mx-auto text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán đang chờ xác nhận</h2>
        <p className="text-gray-500 mb-6">
          Chúng tôi vẫn chưa nhận được xác nhận thanh toán từ VNPay.
          Vui lòng thử làm mới lại trang, kiểm tra lại trong "Đơn hàng của tôi" hoặc liên hệ chăm sóc khách hàng.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row justify-center">
          <button onClick={fetchOrder} className="btn-primary">Làm mới</button>
          <Link to="/orders" className="btn-secondary">Đơn hàng của tôi</Link>
        </div>
      </div>
    </div>
  )

  const renderSuccess = () => (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h2>
        <p className="text-gray-500 mb-8">Đơn hàng của bạn đã được xác nhận. Cảm ơn bạn đã mua sắm!</p>
        <div className="flex gap-3 justify-center">
          <Link to="/orders" className="btn-primary">Xem đơn hàng</Link>
          <Link to="/" className="btn-secondary">Tiếp tục mua sắm</Link>
        </div>
      </div>
    </div>
  )

  const renderFailed = () => (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertTriangle size={64} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán không thành công</h2>
        <p className="text-gray-500 mb-6">
          Đơn hàng của bạn chưa được xác nhận. Vui lòng kiểm tra lại thông tin hoặc thử lại sau.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row justify-center">
          <button onClick={() => navigate('/cart')} className="btn-primary">Quay lại giỏ hàng</button>
          <button onClick={fetchOrder} className="btn-secondary">Kiểm tra lại đơn</button>
        </div>
      </div>
    </div>
  )

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <AlertTriangle size={64} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thiếu thông tin đơn hàng</h2>
          <p className="text-gray-500 mb-6">Không tìm thấy orderId trong liên kết. Vui lòng thử lại từ trang VNPay hoặc liên hệ hỗ trợ.</p>
          <Link to="/orders" className="btn-primary">Đơn hàng của tôi</Link>
        </div>
      </div>
    )
  }

  if (loading && !order) {
    return (
      <div className="min-h-screen bg-gray-50"><Navbar /><LoadingSpinner className="py-32" size="lg" /></div>
    )
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <AlertTriangle size={64} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi khi xác nhận đơn hàng</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <div className="flex flex-col gap-3 sm:flex-row justify-center">
            <Link to="/orders" className="btn-primary">Đơn hàng của tôi</Link>
            <Link to="/" className="btn-secondary">Trang chủ</Link>
          </div>
        </div>
      </div>
    )
  }

  if (order?.status === STATUS_CONFIRMED) return renderSuccess()
  if (order?.status === STATUS_PENDING_PAYMENT) {
    if (attempts >= MAX_ATTEMPTS) return renderPendingMax()
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-16">
          {renderLoading()}
        </div>
      </div>
    )
  }

  return renderFailed()
}
