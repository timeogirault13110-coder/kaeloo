import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { I18nProvider } from './context/I18nContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Collection from './pages/Collection';
import ProductDetail from './pages/ProductDetail';
import Policy from './pages/Policy';
import Auth from './pages/Auth';
import Account from './pages/Account';
import Admin from './pages/Admin';
import PaymentResult from './pages/PaymentResult';
import AuthCallback from './pages/AuthCallback';
import TermsGate from './components/TermsGate';

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const AppRouter = () => {
  const location = useLocation();

  // Synchronous detection of Google OAuth callback
  if (location.hash && location.hash.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collections/:slug" element={<Collection />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/policies/:slug" element={<Policy />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
          <Route path="/account" element={<Account />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/payment/success" element={<PaymentResult variant="success" />} />
          <Route path="/payment/cancel" element={<PaymentResult variant="cancel" />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <TermsGate />
    </>
  );
};

function App() {
  return (
    <div className="App bg-white text-black min-h-screen flex flex-col">
      <BrowserRouter>
        <I18nProvider>
          <AuthProvider>
            <CartProvider>
              <AppRouter />
            </CartProvider>
          </AuthProvider>
        </I18nProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
