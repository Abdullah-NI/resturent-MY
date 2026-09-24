import React from 'react';
import { Routes, Route } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// Public Pages
import Home from '../pages/Home';
import Menu from '../pages/Menu';
import About from '../pages/About';
import GalleryPage from '../pages/GalleryPage';
import Contact from '../pages/Contact';
import ReservationPage from '../pages/ReservationPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrderTrackingPage from '../pages/OrderTrackingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import UserProfilePage from '../pages/UserProfilePage';
import MyOrdersPage from '../pages/MyOrdersPage';
import MyReservationsPage from '../pages/MyReservationsPage';
import NotFoundPage from '../pages/NotFoundPage';

// Admin Pages
import AdminLoginPage from '../pages/AdminLoginPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import ManageMenuPage from '../pages/ManageMenuPage';
import AddMenuItemPage from '../pages/AddMenuItemPage';
import EditMenuItemPage from '../pages/EditMenuItemPage';
import ManageCategoriesPage from '../pages/ManageCategoriesPage';
import ManageOrdersPage from '../pages/ManageOrdersPage';
import OrderDetailsPage from '../pages/OrderDetailsPage';
import ManageReservationsPage from '../pages/ManageReservationsPage';
import ManageUsersPage from '../pages/ManageUsersPage';
import ManageReviewsPage from '../pages/ManageReviewsPage';
import ManageGalleryPage from '../pages/ManageGalleryPage';
import AdminProfilePage from '../pages/AdminProfilePage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/about" element={<About />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/reservation"
          element={
            <ProtectedRoute>
              <ReservationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route path="/order-tracking" element={<OrderTrackingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected Customer Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-reservations"
          element={
            <ProtectedRoute>
              <MyReservationsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ADMIN UNPROTECTED LOGIN */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* ADMIN PROTECTED ROUTES */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="menu" element={<ManageMenuPage />} />
        <Route path="menu/add" element={<AddMenuItemPage />} />
        <Route path="menu/edit/:id" element={<EditMenuItemPage />} />
        <Route path="categories" element={<ManageCategoriesPage />} />
        <Route path="orders" element={<ManageOrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailsPage />} />
        <Route path="reservations" element={<ManageReservationsPage />} />
        <Route path="users" element={<ManageUsersPage />} />
        <Route path="reviews" element={<ManageReviewsPage />} />
        <Route path="gallery" element={<ManageGalleryPage />} />
        <Route path="profile" element={<AdminProfilePage />} />
      </Route>

      {/* 404 CATCH ALL */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
