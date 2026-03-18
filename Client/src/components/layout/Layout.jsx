import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Toast from '../common/Toast'
import ScrollToTop from '../common/ScrollToTop'

const Layout = () => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    <ScrollToTop />
    <Header />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
    <Toast />
  </div>
)

export default Layout
