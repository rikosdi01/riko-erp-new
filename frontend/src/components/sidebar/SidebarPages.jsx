import { Activity, Backpack, BadgeCheckIcon, ClipboardEdit, Computer, FilePlus2, LayoutDashboard, LayoutGrid, ListOrdered, Locate, Map, NotebookPen, Package, PackageMinus, PiggyBank, Receipt, SendToBack, Settings, Ship, Store, Truck, User, UserCog, Users, UsersRound, Warehouse } from "lucide-react";
import Sidebar, { SidebarItem } from "./Sidebar";
import { useUsers } from "../../context/auth/UsersContext";
import roleAccess from "../../utils/helper/roleAccess";

const SidebarPages = () => {
    const { accessList, loginUser } = useUsers();
    console.log('Access List: ', accessList);
    console.log('Login User: ', loginUser);
    const cleanDividers = (items) => {
        const cleaned = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            // Skip divider if at the start or end
            if (item.type === 'divider') {
                if (
                    i === 0 ||                             // awal
                    i === items.length - 1 ||              // akhir
                    items[i - 1]?.type === 'divider'       // double divider
                ) {
                    continue;
                }
            }

            cleaned.push(item);
        }

        return cleaned;
    };

    const filterSubItems = (items) =>
        cleanDividers(
            items.filter(
                item => item.type === "divider" || roleAccess(accessList, item.permission)
            )
        );

    const customerSubItems = filterSubItems([
        { text: "List Barang", to: "/customer/list-products", icon: <Computer size={20} />, permission: "melihat-daftar-list-barang-pelanggan" },
        { text: "Pesanan", to: "/customer/list-orders", icon: <ListOrdered size={20} />, permission: "melihat-daftar-pesanan-pelanggan" },
        { text: "Profil", to: "/customer/profil", icon: <User size={20} />, permission: "melihat-profil-pelanggan" },
    ]);

    const salesSubItems = filterSubItems([
        { text: "Dashboard", to: "/sales/sales-dashboard", icon: <Activity size={20} />, permission: "melihat-dashboard-order" },
        { text: "Pesanan Penjualan", to: "/sales/sales-order", icon: <NotebookPen size={20} />, permission: "melihat-data-pesanan-penjualan" },
        // { text: "Retur Penjualan", to: "/sales/return-order", icon: <PackageMinus size={20} />, permission: "melihat-data-retur-order" },
        { type: "divider" },
        { text: "Pelanggan", to: "/sales/customers", icon: <Store size={20} />, permission: "melihat-data-pelanggan" },
        // { text: "Sales", to: "/sales/salesman", icon: <UsersRound size={20} />, permission: "melihat-data-sales" },
    ]);

    const inventorySubItems = filterSubItems([
        { text: "Dashboard", to: "/inventory/inventory-dashboard", icon: <Activity size={20} />, permission: "melihat-dashboard-inventaris" },
        { text: "Penyesuaian Stok", to: "/inventory/adjustment", icon: <FilePlus2 size={20} />, permission: "melihat-data-penyesuaian-pesanan" },
        { text: "Catatan Pemindahan", to: "/inventory/transfer", icon: <SendToBack size={20} />, permission: "melihat-data-pemindahan-stok" },
        { type: "divider" },
        { text: "Merek", to: "/inventory/merks", icon: <BadgeCheckIcon size={20} />, permission: "melihat-data-merek" },
        { text: "Kategori", to: "/inventory/categories", icon: <LayoutGrid size={20} />, permission: "melihat-data-kategori" },
        { text: "Item", to: "/inventory/items", icon: <Computer size={20} />, permission: "melihat-data-item" },
    ]);

    const logisticSubItems = filterSubItems([
        { text: "Dashboard", to: "/logistic/logistic-dashboard", icon: <Activity size={20} />, permission: "melihat-dashboard-logistic" },
        { text: "Pengiriman Pesanan", to: "/logistic/delivery-order", icon: <Truck size={20} />, permission: "melihat-data-pengiriman-pesanan" },
        { text: "Faktur Pesanan", to: "/logistic/invoice-order", icon: <Receipt size={20} />, permission: "melihat-data-faktur-pesanan" },
        { type: "divider" },
        { text: "Kurir", to: "/logistic/couriers", icon: <UserCog size={20} />, permission: "melihat-data-kurir" },
        { text: "Pengangkutan", to: "/logistic/express", icon: <Ship size={20} />, permission: "melihat-data-pengangkutan" },
    ]);

    return (
        <Sidebar>
            {roleAccess(accessList, "melihat-dashboard-global") && (
                <SidebarItem
                    icon={<LayoutDashboard size={20} />}
                    text="Dashboard"
                    to="/dashboard"
                />
            )}


            {loginUser && loginUser.role === 'Customer' ? (
                <>
                    {customerSubItems.length > 0 && (
                        <SidebarItem
                            icon={<Computer size={20} />}
                            text="List Barang"
                            to="/customer/list-products"
                        />
                    )}

                    {customerSubItems.length > 0 && (
                        <SidebarItem
                            icon={<ListOrdered size={20} />}
                            text="Pesanan"
                            to="/customer/list-orders"
                        />
                    )}

                    <hr></hr>

                    {customerSubItems.length > 0 && (
                        <SidebarItem
                            icon={<User size={20} />}
                            text="Profil"
                            to="/customer/profile"
                        />
                    )}
                </>
            ) : (
                customerSubItems.length > 0 && (
                    <SidebarItem
                        icon={<ListOrdered size={20} />}
                        text="Transaksi"
                        to="/customer"
                        subItems={customerSubItems}
                    />
                )
            )}



            {salesSubItems.length > 0 && (
                <SidebarItem
                    icon={<ClipboardEdit size={20} />}
                    text="Penjualan"
                    to="/sales"
                    subItems={salesSubItems}
                />
            )}

            {inventorySubItems.length > 0 && (
                <SidebarItem
                    icon={<Warehouse size={20} />}
                    text="Inventaris"
                    to="/inventory"
                    subItems={inventorySubItems}
                />
            )}

            {logisticSubItems.length > 0 && (
                <SidebarItem
                    icon={<Package size={20} />}
                    text="Logistik"
                    to="/logistic"
                    subItems={logisticSubItems}
                />
            )}

            {loginUser && loginUser.role !== 'Customer' && (
                <><hr />
                    <SidebarItem
                        icon={<Settings size={20} />}
                        text="Pengaturan"
                        to="/settings"
                    />
                </>
            )}
        </Sidebar>
    );
};


export default SidebarPages;