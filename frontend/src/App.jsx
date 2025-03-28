import "./App.css";
import { Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import SignIn from "./pages/authentication/signin/SignIn";
import SidebarPages from "./components/sidebar/SidebarPages";
import Navbar from "./components/navbar/Navbar";
import NotFound from "./pages/features/notfound/NotFound";
import { ToastProvider } from "./context/ToastContext";
import Settings from "./pages/personalization/settings/Settings";
import ProtectedRoute from "./components/protectedroute/ProtectedRoute";
import Merks from "./pages/features/warehouse/merks/Merks";
import AddMerk from "./pages/features/warehouse/merks/children/add_merk/AddMerk";
import { MerkProvider } from "./context/warehouse/MerkContext";
import DetailMerk from "./pages/features/warehouse/merks/children/detail_merk/DetailMerk";
import Categories from "./pages/features/warehouse/categories/Categories";
import AddCategories from "./pages/features/warehouse/categories/children/add_merk/AddCategories";
import DetailCategories from "./pages/features/warehouse/categories/children/detail_merk/DetailCategories";
import { CategoryProvider } from "./context/warehouse/CategoryContext";
import Items from "./pages/features/warehouse/items/Items";
import { ItemProvider } from "./context/warehouse/ItemContext";
import SalesOrder from "./pages/features/sales/sales_order/SalesOrder";
import { SalesOrderProvider } from "./context/sales/SalesOrderContext";
import { SalesmanProvider } from "./context/sales/SalesmanContext";
import Salesman from "./pages/features/sales/salesman/Salesman";
import { CustomersProvider } from "./context/sales/CustomersContext";
import Customers from "./pages/features/sales/customers/Customers";
import { CSOProvider } from "./context/sales/CSOContext";
import CSO from "./pages/features/sales/counter_sales_office/CSO";

function AppContent() {
  const location = useLocation();

  // Daftar halaman yang tidak menampilkan sidebar
  const hideSidebarRoutes = ["/signin", "/signup", "/404"];

  return (
    <div className="app-container">
      {!hideSidebarRoutes.includes(location.pathname) && <SidebarPages />}
      {!hideSidebarRoutes.includes(location.pathname) && <Navbar />}

      <div className="main-content">
        <Routes>
          {/* Authentication */}
          <Route path="/signin" element={<SignIn />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />


          {/* Sales */}
          <Route path="/sales" element={<ProtectedRoute><SalesOrder /></ProtectedRoute>} />

          {/* SO */}
          <Route path="/sales/so" element={<ProtectedRoute><SalesOrder /></ProtectedRoute>} />

          {/* Customers */}
          <Route path="/sales/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />

          {/* Salesman */}
          <Route path="/sales/salesman" element={<ProtectedRoute><Salesman /></ProtectedRoute>} />

          {/* CSO */}
          <Route path="/sales/cso" element={<ProtectedRoute><CSO /></ProtectedRoute>} />



          {/* Warehouse */}
          <Route path="/warehouse" element={<ProtectedRoute><Merks /></ProtectedRoute>} />

          {/* Merks */}
          <Route path="/warehouse/merks" element={<ProtectedRoute><Merks /></ProtectedRoute>} />
          <Route path="/warehouse/merks/new" element={<ProtectedRoute><AddMerk /></ProtectedRoute>} />
          <Route path="/warehouse/merks/:id" element={<ProtectedRoute><DetailMerk /></ProtectedRoute>} />

          {/* Categories */}
          <Route path="/warehouse/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path="/warehouse/categories/new" element={<ProtectedRoute><AddCategories /></ProtectedRoute>} />
          <Route path="/warehouse/categories/:id" element={<ProtectedRoute><DetailCategories /></ProtectedRoute>} />

          {/* Items */}
          <Route path="/warehouse/items" element={<ProtectedRoute><Items /></ProtectedRoute>} />
          <Route path="/warehouse/items/new" element={<ProtectedRoute><AddCategories /></ProtectedRoute>} />
          <Route path="/warehouse/items/:id" element={<ProtectedRoute><DetailCategories /></ProtectedRoute>} />

          {/* Not Found Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <MerkProvider>
        <CategoryProvider>
          <ItemProvider>
            <CustomersProvider>
              <SalesmanProvider>
                <CSOProvider>
                  <SalesOrderProvider>
                    <Router>
                      <AppContent />
                    </Router>
                  </SalesOrderProvider>
                </CSOProvider>
              </SalesmanProvider>
            </CustomersProvider>
          </ItemProvider>
        </CategoryProvider>
      </MerkProvider>
    </ToastProvider>
  );
}

export default App;