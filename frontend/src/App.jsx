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
import AddCategory from "./pages/features/warehouse/categories/children/add_category/AddCategory";
import DetailCategory from "./pages/features/warehouse/categories/children/detail_category/DetailCategory";
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
import DeliveryOrder from "./pages/features/logistic/delivery_order/DeliveryOrder";
import { InvoiceProvider } from "./context/sales/InvoiceContext";
import ReturnOrder from "./pages/features/sales/return_order/ReturnOrder";
import { ReturnProvider } from "./context/sales/ReturnOrderContext";
import Courier from "./pages/features/logistic/courier/Courier";
import { CourierProvider } from "./context/logistic/CourierContext";
import { DeliveryOrderProvider } from "./context/logistic/DeliveryOrderContext";
import { ExpressProvider } from "./context/logistic/ExpressContext";
import Express from "./pages/features/logistic/express/Express";
import TrackingOrder from "./pages/features/logistic/tracking_order/TrackingOrder";
import AddItem from "./pages/features/warehouse/items/children/add_item/AddItem";
import DetailItem from "./pages/features/warehouse/items/children/detail_item/DetailItem";
import Storage from "./pages/features/warehouse/storage/Storage";
import AddStorage from "./pages/features/warehouse/storage/children/add_storage/AddStorage";
import DetailStorage from "./pages/features/warehouse/storage/children/detail_storage/DetailStorage";
import Adjustment from "./pages/features/warehouse/adjustment/Adjustment";
import { AdjustmentProvider } from "./context/warehouse/AdjustmentContext";
import AddAdjustment from "./pages/features/warehouse/adjustment/children/add_adjustment/AddAdjustment";
import DetailAdjustment from "./pages/features/warehouse/adjustment/children/detail_adjustment/DetailAdjustment";
import { TransferProvider } from "./context/warehouse/TransferContext";
import Transfer from "./pages/features/warehouse/transfer/Transfer";
import AddTransfer from "./pages/features/warehouse/transfer/children/add_transfer/AddTransfer";
import DetailTransfer from "./pages/features/warehouse/transfer/children/detail_transfer/DetailTransfer";
import AddSalesOrder from "./pages/features/sales/sales_order/children/add_salesorder/AddSalesOrder";
import DetailSalesOrder from "./pages/features/sales/sales_order/children/detail_salesorder/DetailSalesOrder";
import DetailInvoice from "./pages/features/logistic/invoice/children/detail_invoice/DetailInvoice";
import AddReturnOrder from "./pages/features/sales/return_order/children/add_returnorder/AddReturnOrder";
import DetailReturnOrder from "./pages/features/sales/return_order/children/detail_returnorder/DetailReturnOrder";
import AddCustomer from "./pages/features/sales/customers/children/add_customer/AddCustomer";
import DetailCustomer from "./pages/features/sales/customers/children/detail_customer/DetailCustomer";
import AddSalesman from "./pages/features/sales/salesman/children/add_salesman/AddSalesman";
import DetailSalesman from "./pages/features/sales/salesman/children/detail_salesman/DetailSalesman";
import AddCSO from "./pages/features/sales/counter_sales_office/children/add_cso/AddCSO";
import DetailCSO from "./pages/features/sales/counter_sales_office/children/detail_cso/DetailCSO";
import DetailDeliveryOrder from "./pages/features/logistic/delivery_order/children/detail_delivery_order/DetailDeliveryOrder";
import AddCourier from "./pages/features/logistic/courier/children/add_courier/AddCourier";
import DetailCourier from "./pages/features/logistic/courier/children/detail_courier/DetailCourier";
import AddExpress from "./pages/features/logistic/express/children/add_express/AddExpress";
import DetailExpress from "./pages/features/logistic/express/children/detail_express/DetailExpress";
import SalesDashboard from "./pages/features/sales/sales_dashboard/SalesDashboard";
import LogisticDashboard from "./pages/features/logistic/logistic_dashboard/LogisticDashboard";
import InventoryDashboard from "./pages/features/warehouse/inventory_dashboard/InventoryDashboard";
import Dashboard from "./pages/features/dashboard/Dashboard";
import MutationSales from "./pages/personalization/settings/children/mutations/mutation_sales/MutationSales";
import MutationInventory from "./pages/personalization/settings/children/mutations/mutation_inventory/MutationInventory";
import MutationLogistic from "./pages/personalization/settings/children/mutations/mutation_logistic/MutationLogistic";
import ManageAccount from "./pages/personalization/settings/children/manage_account/ManageAccount";
import SettingActivity from "./pages/personalization/settings/children/activity/SettingActivity";
import SettingNotification from "./pages/personalization/settings/children/notification/SettingNotification";
import SettingHelp from "./pages/personalization/settings/children/help/SettingHelp";
import SignUp from "./pages/authentication/signup/SignUp";
import RackWarehouse from "./pages/features/warehouse/rack_warehouse/RackWarehouse";
import { RackProvider } from "./context/warehouse/RackWarehouseContext";
import AddRacks from "./pages/features/warehouse/rack_warehouse/children/add_racks/AddRacks";
import DetailRacks from "./pages/features/warehouse/rack_warehouse/children/detail_racks/DetailRacks";
import AddDeliveryOrder from "./pages/features/logistic/delivery_order/children/add_delivery_order/AddDeliveryOrder";
import InvoiceOrder from "./pages/features/logistic/invoice/InvoiceOrder";
import { UsersProvider } from "./context/auth/UsersContext";
import ManageRoles from "./pages/personalization/settings/children/manage_account/manage_roles/ManageRoles";
import FormatSettings from "./pages/personalization/settings/children/format_settings/FormatSettings";
import { FormatProvider } from "./context/personalization/FormatContext";

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
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />



          {/* Sales */}
          <Route path="/sales" element={<ProtectedRoute><SalesOrder /></ProtectedRoute>} />

          {/* Dashboard */}
          <Route path="/sales/sales-dashboard" element={<ProtectedRoute><SalesDashboard /></ProtectedRoute>} />

          {/* SO */}
          <Route path="/sales/sales-order" element={<ProtectedRoute><SalesOrder /></ProtectedRoute>} />
          <Route path="/sales/sales-order/new" element={<ProtectedRoute><AddSalesOrder /></ProtectedRoute>} />
          <Route path="/sales/sales-order/:id" element={<ProtectedRoute><DetailSalesOrder /></ProtectedRoute>} />

          {/* Return Order */}
          <Route path="/sales/return-order" element={<ProtectedRoute><ReturnOrder /></ProtectedRoute>} />
          <Route path="/sales/return-order/new" element={<ProtectedRoute><AddReturnOrder /></ProtectedRoute>} />
          <Route path="/sales/return-order/:id" element={<ProtectedRoute><DetailReturnOrder /></ProtectedRoute>} />

          {/* Customers */}
          <Route path="/sales/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
          <Route path="/sales/customers/new" element={<ProtectedRoute><AddCustomer /></ProtectedRoute>} />
          <Route path="/sales/customers/:id" element={<ProtectedRoute><DetailCustomer /></ProtectedRoute>} />

          {/* Salesman */}
          <Route path="/sales/salesman" element={<ProtectedRoute><Salesman /></ProtectedRoute>} />
          <Route path="/sales/salesman/new" element={<ProtectedRoute><AddSalesman /></ProtectedRoute>} />
          <Route path="/sales/salesman/:id" element={<ProtectedRoute><DetailSalesman /></ProtectedRoute>} />

          {/* CSO */}
          <Route path="/sales/cso" element={<ProtectedRoute><CSO /></ProtectedRoute>} />
          <Route path="/sales/cso/new" element={<ProtectedRoute><AddCSO /></ProtectedRoute>} />
          <Route path="/sales/cso/:id" element={<ProtectedRoute><DetailCSO /></ProtectedRoute>} />




          {/* Logistic */}
          <Route path="/logistic" element={<ProtectedRoute><DeliveryOrder /></ProtectedRoute>} />

          {/* Dashboard */}
          <Route path="/logistic/logistic-dashboard" element={<ProtectedRoute><LogisticDashboard /></ProtectedRoute>} />

          {/* DO */}
          <Route path="/logistic/delivery-order" element={<ProtectedRoute><DeliveryOrder /></ProtectedRoute>} />
          <Route path="/logistic/delivery-order/new" element={<ProtectedRoute><AddDeliveryOrder /></ProtectedRoute>} />
          <Route path="/logistic/delivery-order/:id" element={<ProtectedRoute><DetailDeliveryOrder /></ProtectedRoute>} />

          {/* Invoice */}
          <Route path="/logistic/invoice-order" element={<ProtectedRoute><InvoiceOrder /></ProtectedRoute>} />
          <Route path="/logistic/invoice-order/:id" element={<ProtectedRoute><DetailInvoice /></ProtectedRoute>} />

          {/* Tracking */}
          <Route path="/logistic/tracking-orders" element={<ProtectedRoute><TrackingOrder /></ProtectedRoute>} />

          {/* Courier */}
          <Route path="/logistic/couriers" element={<ProtectedRoute><Courier /></ProtectedRoute>} />
          <Route path="/logistic/couriers/new" element={<ProtectedRoute><AddCourier /></ProtectedRoute>} />
          <Route path="/logistic/couriers/:id" element={<ProtectedRoute><DetailCourier /></ProtectedRoute>} />

          {/* Express */}
          <Route path="/logistic/express" element={<ProtectedRoute><Express /></ProtectedRoute>} />
          <Route path="/logistic/express/new" element={<ProtectedRoute><AddExpress /></ProtectedRoute>} />
          <Route path="/logistic/express/:id" element={<ProtectedRoute><DetailExpress /></ProtectedRoute>} />



          {/* Warehouse */}
          <Route path="/inventory" element={<ProtectedRoute><Merks /></ProtectedRoute>} />

          {/* Dashboard */}
          <Route path="/inventory/inventory-dashboard" element={<ProtectedRoute><InventoryDashboard /></ProtectedRoute>} />

          {/* Inventory */}
          <Route path="/inventory/storage" element={<ProtectedRoute><Storage /></ProtectedRoute>} />
          <Route path="/inventory/storage/new" element={<ProtectedRoute><AddStorage /></ProtectedRoute>} />
          <Route path="/inventory/storage/:id" element={<ProtectedRoute><DetailStorage /></ProtectedRoute>} />

          {/* Adjustment */}
          <Route path="/inventory/adjustment" element={<ProtectedRoute><Adjustment /></ProtectedRoute>} />
          <Route path="/inventory/adjustment/new" element={<ProtectedRoute><AddAdjustment /></ProtectedRoute>} />
          <Route path="/inventory/adjustment/:id" element={<ProtectedRoute><DetailAdjustment /></ProtectedRoute>} />

          {/* Tramsfer */}
          <Route path="/inventory/transfer" element={<ProtectedRoute><Transfer /></ProtectedRoute>} />
          <Route path="/inventory/transfer/new" element={<ProtectedRoute><AddTransfer /></ProtectedRoute>} />
          <Route path="/inventory/transfer/:id" element={<ProtectedRoute><DetailTransfer /></ProtectedRoute>} />

          {/* Warehouse */}
          <Route path="/inventory/warehouse" element={<ProtectedRoute><RackWarehouse /></ProtectedRoute>} />
          <Route path="/inventory/warehouse/new" element={<ProtectedRoute><AddRacks /></ProtectedRoute>} />
          <Route path="/inventory/warehouse/:id" element={<ProtectedRoute><DetailRacks /></ProtectedRoute>} />

          {/* Merks */}
          <Route path="/inventory/merks" element={<ProtectedRoute><Merks /></ProtectedRoute>} />
          <Route path="/inventory/merks/new" element={<ProtectedRoute><AddMerk /></ProtectedRoute>} />
          <Route path="/inventory/merks/:id" element={<ProtectedRoute><DetailMerk /></ProtectedRoute>} />

          {/* Categories */}
          <Route path="/inventory/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path="/inventory/categories/new" element={<ProtectedRoute><AddCategory /></ProtectedRoute>} />
          <Route path="/inventory/categories/:id" element={<ProtectedRoute><DetailCategory /></ProtectedRoute>} />

          {/* Items */}
          <Route path="/inventory/items" element={<ProtectedRoute><Items /></ProtectedRoute>} />
          <Route path="/inventory/items/new" element={<ProtectedRoute><AddItem /></ProtectedRoute>} />
          <Route path="/inventory/items/:id" element={<ProtectedRoute><DetailItem /></ProtectedRoute>} />



          {/* Settings */}
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/settings/mutation-sales" element={<ProtectedRoute><MutationSales /></ProtectedRoute>} />
          <Route path="/settings/mutation-inventory" element={<ProtectedRoute><MutationInventory /></ProtectedRoute>} />
          <Route path="/settings/mutation-logistic" element={<ProtectedRoute><MutationLogistic /></ProtectedRoute>} />
          <Route path="/settings/manage-account" element={<ProtectedRoute><ManageAccount /></ProtectedRoute>} />
          <Route path="/settings/activity" element={<ProtectedRoute><SettingActivity /></ProtectedRoute>} />
          <Route path="/settings/formatting" element={<ProtectedRoute><FormatSettings /></ProtectedRoute>} />
          <Route path="/settings/notification" element={<ProtectedRoute><SettingNotification /></ProtectedRoute>} />
          <Route path="/settings/help" element={<ProtectedRoute><SettingHelp /></ProtectedRoute>} />

          {/* Settings Manage Account */}
          <Route path="/settings/manage-account/roles" element={<ProtectedRoute><ManageRoles /></ProtectedRoute>} />


          <Route path="/signup" element={<ProtectedRoute><SignUp /></ProtectedRoute>} />

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
      <UsersProvider>
        <FormatProvider>
          <RackProvider>
            <MerkProvider>
              <CategoryProvider>
                <ItemProvider>
                  <AdjustmentProvider>
                    <TransferProvider>
                      <CustomersProvider>
                        <SalesmanProvider>
                          <CSOProvider>
                            <SalesOrderProvider>
                              <CourierProvider>
                                <ExpressProvider>
                                  <DeliveryOrderProvider>
                                    <InvoiceProvider>
                                      <ReturnProvider>
                                        <Router>
                                          <AppContent />
                                        </Router>
                                      </ReturnProvider>
                                    </InvoiceProvider>
                                  </DeliveryOrderProvider>
                                </ExpressProvider>
                              </CourierProvider>
                            </SalesOrderProvider>
                          </CSOProvider>
                        </SalesmanProvider>
                      </CustomersProvider>
                    </TransferProvider>
                  </AdjustmentProvider>
                </ItemProvider>
              </CategoryProvider>
            </MerkProvider>
          </RackProvider>
        </FormatProvider>
      </UsersProvider>
    </ToastProvider>
  );
}

export default App;