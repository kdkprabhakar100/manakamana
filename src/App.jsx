import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { AdminRoute, PublicRoute } from "./components/common/RouteGuards";
import Navbar  from "./components/layout/Navbar";
import Footer  from "./components/layout/Footer";

// Public pages
import HomePage     from "./pages/public/HomePage";
import ProductsPage from "./pages/public/ProductsPage";
import AboutPage    from "./pages/public/AboutPage";
import ContactPage  from "./pages/public/ContactPage";

// Auth
import LoginPage from "./pages/auth/LoginPage";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts  from "./pages/admin/AdminProducts";
import AdminInvoice   from "./pages/admin/AdminInvoice";
import AdminInvoices  from "./pages/admin/AdminInvoices";

function Layout({ children, hideFooter }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh" }}>
      <Navbar />
      <main style={{ flex:1 }}>{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>

          {/* ── Public pages ── */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/products" element={<Layout><ProductsPage /></Layout>} />
          <Route path="/about"    element={<Layout><AboutPage /></Layout>} />
          <Route path="/contact"  element={<Layout><ContactPage /></Layout>} />

          {/* ── Auth ── */}
          <Route path="/login" element={
            <PublicRoute>
              <Layout hideFooter><LoginPage /></Layout>
            </PublicRoute>
          } />

          {/* ── Admin (protected) ── */}
          <Route path="/admin" element={
            <AdminRoute>
              <Layout hideFooter><AdminDashboard /></Layout>
            </AdminRoute>
          } />
          <Route path="/admin/products" element={
            <AdminRoute>
              <Layout hideFooter><AdminProducts /></Layout>
            </AdminRoute>
          } />
          <Route path="/admin/invoices" element={
            <AdminRoute>
              <Layout hideFooter><AdminInvoices /></Layout>
            </AdminRoute>
          } />
          <Route path="/admin/invoice/:id" element={
            <AdminRoute>
              <Layout hideFooter><AdminInvoice /></Layout>
            </AdminRoute>
          } />

          {/* ── 404 ── */}
          <Route path="*" element={
            <Layout>
              <div style={{ textAlign:"center", padding:"80px 24px", fontFamily:"'Segoe UI',sans-serif" }}>
                <div style={{ fontSize:64 }}>🔩</div>
                <h1 style={{ fontSize:32, color:"#0f172a", margin:"16px 0 8px" }}>Page Not Found</h1>
                <p style={{ color:"#64748b", marginBottom:24 }}>The page you're looking for doesn't exist.</p>
                <a href="/" style={{ background:"#0ea5e9", color:"#fff", padding:"12px 28px", borderRadius:10, textDecoration:"none", fontWeight:700 }}>
                  Go Home
                </a>
              </div>
            </Layout>
          } />

        </Routes>
      </Router>
    </AuthProvider>
  );
}