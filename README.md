# Manakamana Heavy Equipments Pvt. Ltd. — Web App

A full React + Firebase web application with:
- 🏠 Public website (Home, Products, About, Contact)
- 🔐 Admin login (hardcoded credentials)
- 📦 Product management (add/edit/delete, saved to Firebase)
- 🧾 Invoice/Estimate builder (searches products live from Firebase)
- 💾 All invoices saved to Firebase, editable anytime

---

## 📁 Project Structure

```
src/
├── App.jsx                        ← All routes
├── main.jsx                       ← Entry point
├── firebase/
│   └── config.js                  ← ⚠️ PUT YOUR FIREBASE CONFIG HERE
├── hooks/
│   ├── useAuth.jsx                ← Auth context + hardcoded admin
│   ├── useProducts.js             ← Firestore products CRUD
│   └── useInvoices.js             ← Firestore invoices CRUD
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   └── common/
│       └── RouteGuards.jsx
└── pages/
    ├── public/
    │   ├── HomePage.jsx
    │   ├── ProductsPage.jsx
    │   ├── AboutPage.jsx
    │   └── ContactPage.jsx
    ├── auth/
    │   └── LoginPage.jsx
    └── admin/
        ├── AdminDashboard.jsx
        ├── AdminProducts.jsx      ← CRUD products → Firebase
        ├── AdminInvoice.jsx       ← Invoice builder, fetches products from Firebase
        └── AdminInvoices.jsx      ← List all saved invoices
```

---

## 🚀 Setup Instructions

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Create Firebase project
1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add Project** → name it "manakamana" → Create
3. Click **Firestore Database** → Create database → Start in **test mode**
4. Click **Authentication** → Get started → **Email/Password** → Enable it
5. Go to **Project Settings** → **Your Apps** → Add Web App → Copy the config

### Step 3 — Add Firebase config
Open `src/firebase/config.js` and replace the placeholder values:
```js
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
};
```

### Step 4 — Create admin user in Firebase
1. Go to Firebase Console → **Authentication** → **Users**
2. Click **Add User**
3. Email: `admin@manakamana.com`
4. Password: `Admin@1234`

> You can change these credentials in `src/hooks/useAuth.jsx` (ADMIN_EMAIL / ADMIN_PASSWORD)

### Step 5 — Run the app
```bash
npm run dev
```

Visit: [http://localhost:5173](http://localhost:5173)

---

## 🔑 Admin Access

| URL | Page |
|-----|------|
| `/login` | Admin Login |
| `/admin` | Dashboard |
| `/admin/products` | Manage Products |
| `/admin/invoices` | All Invoices |
| `/admin/invoice/new` | New Invoice |

**Default credentials:**
- Email: `admin@manakamana.com`
- Password: `Admin@1234`

---

## 🔄 How Products flow to Invoices

1. Admin adds products in `/admin/products` → saved to Firebase `products` collection
2. When creating an invoice in `/admin/invoice/new`, the search bar **live-fetches** all products from Firebase
3. Click any product in the dropdown → it's added to the invoice line items
4. Same product clicked again → quantity increases (no duplicate lines)
5. Save the invoice → stored in Firebase `invoices` collection

---

## 🏗️ Build for production
```bash
npm run build
```
Deploy the `dist/` folder to Netlify, Vercel, or Firebase Hosting.

### Deploy to Firebase Hosting (optional)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# set public dir to: dist
# configure as SPA: yes
npm run build
firebase deploy
```
