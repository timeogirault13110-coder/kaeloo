import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Collection from './pages/Collection';
import ProductDetail from './pages/ProductDetail';

function App() {
  return (
    <div className="App bg-white text-black min-h-screen flex flex-col">
      <BrowserRouter>
        <CartProvider>
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/collections/:slug" element={<Collection />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
