import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Categories from "./pages/Categories.jsx";
import Products from "./pages/Products.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import CompanyBrief from "./pages/CompanyBrief.jsx";
import Testimonials from "./pages/Testimonials.jsx";
import Contact from "./pages/Contact.jsx";
import AdminLogin from "./admin/pages/AdminLogin.jsx";
import AdminDashboard from "./admin/pages/AdminDashboard.jsx";
import AddProduct from "./admin/pages/AddProduct.jsx";
import ManageProducts from "./admin/pages/ManageProducts.jsx";
import ManageCategories from "./admin/pages/ManageCategories.jsx";
import ManageEnquiries from "./admin/pages/ManageEnquiries.jsx";
import ManageTestimonials from "./admin/pages/ManageTestimonials.jsx";
import ProtectedRoute from "./admin/components/ProtectedRoute.jsx";
import { AdminDataProvider } from "./admin/context/AdminDataProvider.jsx";
import ScrollManager from "./components/ScrollManager.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollManager />
      <AdminDataProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetails />} />
          <Route path="/about/company-brief" element={<CompanyBrief />} />
          <Route path="/about/testimonials" element={<Testimonials />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/add-product" element={<AddProduct />} />
            <Route
              path="/admin/edit-product/:id"
              element={<AddProduct />}
            />
            <Route
              path="/admin/manage-products"
              element={<ManageProducts />}
            />
            <Route path="/admin/categories" element={<ManageCategories />} />
            <Route path="/admin/enquiries" element={<ManageEnquiries />} />
            <Route
              path="/admin/testimonials"
              element={<ManageTestimonials />}
            />
          </Route>
        </Routes>
      </AdminDataProvider>
    </BrowserRouter>
  </StrictMode>,
);
