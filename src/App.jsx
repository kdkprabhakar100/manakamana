import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { AdminRoute, PublicRoute } from "./components/common/RouteGuards";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// ✅ Lazy-loaded pages (code splitting)
const HomePage = lazy(() => import("./pages/public/HomePage"));
const ProductsPage = lazy(() => import("./pages/public/ProductsPage"));
const AboutPage = lazy(() => import("./pages/public/AboutPage"));
const ContactPage = lazy(() => import("./pages/public/ContactPage"));

// Auth
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminInvoice = lazy(() => import("./pages/admin/AdminInvoice"));
const AdminInvoices = lazy(() => import("./pages/admin/AdminInvoices"));

function Layout({ children, hideFooter }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}

function PageLoader() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
        padding: "40px 24px",
        fontFamily: "'Segoe UI',sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40 }}>⏳</div>
        <div style={{ marginTop: 10, color: "#475569", fontWeight: 600 }}>
          Loading…
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {/* ✅ Suspense wraps routes so lazy-loaded pages can load */}
        <Suspense fallback={<Layout><PageLoader /></Layout>}>
          <Routes>
            {/* ── Public pages ── */}
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/products" element={<Layout><ProductsPage /></Layout>} />
            <Route path="/about" element={<Layout><AboutPage /></Layout>} />
            <Route path="/contact" element={<Layout><ContactPage /></Layout>} />

            {/* ── Auth ── */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Layout hideFooter>
                    <LoginPage />
                  </Layout>
                </PublicRoute>
              }
            />

            {/* ── Admin (protected) ── */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Layout hideFooter>
                    <AdminDashboard />
                  </Layout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <Layout hideFooter>
                    <AdminProducts />
                  </Layout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/invoices"
              element={
                <AdminRoute>
                  <Layout hideFooter>
                    <AdminInvoices />
                  </Layout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/invoice/:id"
              element={
                <AdminRoute>
                  <Layout hideFooter>
                    <AdminInvoice />
                  </Layout>
                </AdminRoute>
              }
            />

            {/* ── 404 ── */}
            <Route
              path="*"
              element={
                <Layout>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "80px 24px",
                      fontFamily: "'Segoe UI',sans-serif",
                    }}
                  >
                    <div style={{ fontSize: 64 }}>🔩</div>
                    <h1 style={{ fontSize: 32, color: "#0f172a", margin: "16px 0 8px" }}>
                      Page Not Found
                    </h1>
                    <p style={{ color: "#64748b", marginBottom: 24 }}>
                      The page you're looking for doesn't exist.
                    </p>
                    <Link
                      to="/"
                      style={{
                        background: "#0ea5e9",
                        color: "#fff",
                        padding: "12px 28px",
                        borderRadius: 10,
                        textDecoration: "none",
                        fontWeight: 700,
                        display: "inline-block",
                      }}
                    >
                      Go Home
                    </Link>
                  </div>
                </Layout>
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}