import { Footer } from './Footer'
import { Header } from './Header'
import { PageTransition } from './PageTransition'
import './Layout.css'

export function Layout() {
  return (
    <div className="app-shell">
      <Header />
      <PageTransition />
      <Footer />
    </div>
  )
}
