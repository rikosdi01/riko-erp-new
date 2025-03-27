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
            <Route path="/" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* Warehouse */}
            <Route path="/warehouse" element={<ProtectedRoute><Merks /></ProtectedRoute>} />

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
      <Router>
        <AppContent />
      </Router>
    </ToastProvider>
  );
}

export default App;
