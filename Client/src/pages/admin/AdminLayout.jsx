import { Outlet, NavLink } from 'react-router-dom'

const AdminLayout = () => (
  <div className="flex min-h-screen">
    <aside className="w-48 bg-gray-900 text-white p-4 flex flex-col gap-2 text-sm">
      <p className="font-bold text-lg mb-4">관리자</p>
      <NavLink to="/admin" end className={({ isActive }) => isActive ? 'text-yellow-400' : 'hover:text-gray-300'}>대시보드</NavLink>
      <NavLink to="/admin/products" className={({ isActive }) => isActive ? 'text-yellow-400' : 'hover:text-gray-300'}>상품 관리</NavLink>
      <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'text-yellow-400' : 'hover:text-gray-300'}>주문 관리</NavLink>
      <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'text-yellow-400' : 'hover:text-gray-300'}>회원 관리</NavLink>
    </aside>
    <main className="flex-1 p-6 bg-gray-50">
      <Outlet />
    </main>
  </div>
)

export default AdminLayout
