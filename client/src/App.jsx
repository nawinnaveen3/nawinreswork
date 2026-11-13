import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import OwnerLayout from './components/OwnerLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import About from './pages/About';
import Menu from './pages/Menu';
import Contact from './pages/Contact';

import CustomerLogin from './pages/customer/CustomerLogin';
import Register from './pages/customer/Register';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import Orders from './pages/customer/Orders';
import Profile from './pages/customer/Profile';

import OwnerLogin from './pages/owner/OwnerLogin';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import MenuManagement from './pages/owner/MenuManagement';
import CategoryManagement from './pages/owner/CategoryManagement';
import OrderManagement from './pages/owner/OrderManagement';
import CustomerManagement from './pages/owner/CustomerManagement';
import Reports from './pages/owner/Reports';
import OwnerMessages from './pages/owner/OwnerMessages';
import OwnerProfile from './pages/owner/OwnerProfile';

const cust = (el) => <ProtectedRoute role="customer">{el}</ProtectedRoute>;

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<CustomerLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/customer" element={cust(<CustomerDashboard />)} />
        <Route path="/cart" element={cust(<Cart />)} />
        <Route path="/checkout" element={cust(<Checkout />)} />
        <Route path="/orders" element={cust(<Orders />)} />
        <Route path="/profile" element={cust(<Profile />)} />
      </Route>

      <Route path="/owner/login" element={<OwnerLogin />} />
      <Route path="/owner" element={<ProtectedRoute role="owner"><OwnerLayout /></ProtectedRoute>}>
        <Route index element={<OwnerDashboard />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="menu" element={<MenuManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="customers" element={<CustomerManagement />} />
        <Route path="reports" element={<Reports />} />
        <Route path="messages" element={<OwnerMessages />} />
        <Route path="profile" element={<OwnerProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
