import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ContactsProvider } from "./hooks/useContacts";
import { AdminRoute, PublicRoute } from "./components/common/RouteGuards";
import { ToastProvider } from "./components/common/Toast";
import ScrollToTop from "./components/common/ScrollToTop";
import BackToTop from "./components/common/BackToTop";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AdminLayout from "./components/layout/AdminLayout";
// import AdminCustomers from "./pages/admin/AdminCustomers";

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
const AdminInventory = lazy(() => import("./pages/admin/AdminInventory"));
const AdminInvoice = lazy(() => import("./pages/admin/AdminInvoice"));
const AdminInvoices = lazy(() => import("./pages/admin/AdminInvoices"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));

function Layout({ children, hideFooter }) {
  const location = useLocation();
  const isHome = location.pathname === "/";
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Navbar />
      <main style={{ flex: 1, paddingTop: isHome ? 0 : 75 }}>{children}</main>
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
        fontFamily: "'Inter',system-ui,sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid #f5f5f5",
            borderTop: "3px solid #d97706",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <div
          style={{
            color: "#737373",
            fontWeight: 500,
            fontSize: 14,
            letterSpacing: 0.5,
          }}
        >
          Loading…
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ContactsProvider>
        <ToastProvider>
          <Router
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <ScrollToTop />
            <BackToTop />
            {/* ✅ Suspense wraps routes so lazy-loaded pages can load */}
            <Suspense
              fallback={
                <Layout>
                  <PageLoader />
                </Layout>
              }
            >
              <Routes>
                {/* ── Public pages ── */}
                <Route
                  path="/"
                  element={
                    <Layout>
                      <HomePage />
                    </Layout>
                  }
                />
                <Route
                  path="/products"
                  element={
                    <Layout>
                      <ProductsPage />
                    </Layout>
                  }
                />
                <Route
                  path="/about"
                  element={
                    <Layout>
                      <AboutPage />
                    </Layout>
                  }
                />
                <Route
                  path="/contact"
                  element={
                    <Layout>
                      <ContactPage />
                    </Layout>
                  }
                />

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
                      <AdminLayout>
                        <AdminDashboard />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <AdminProducts />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/customers"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <AdminCustomers />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/inventory"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <AdminInventory />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/invoices"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <AdminInvoices />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/invoice/:id"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <AdminInvoice />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/messages"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <AdminMessages />
                      </AdminLayout>
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
                        <h1
                          style={{
                            fontSize: 32,
                            color: "#0f172a",
                            margin: "16px 0 8px",
                          }}
                        >
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
        </ToastProvider>
      </ContactsProvider>
    </AuthProvider>
  );
}
