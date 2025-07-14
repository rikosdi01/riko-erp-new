import { Activity, Backpack, BadgeCheckIcon, ClipboardEdit, Computer, FilePlus2, HandCoins, LayoutDashboard, LayoutGrid, Locate, Map, NotebookPen, Package, PackageMinus, PiggyBank, Receipt, SendToBack, Settings, Ship, Store, Truck, UserCog, Users, UsersRound, Warehouse } from "lucide-react";
import Sidebar, { SidebarItem } from "./Sidebar";
import React from "react";
import { useUsers } from "../../context/auth/UsersContext";

const SidebarPages = () => {
    const { loginUser } = useUsers();
    console.log("Login Users: ", loginUser);
    return (
        <Sidebar>
            <SidebarItem
                icon={<LayoutDashboard size={20} />}
                text="Dashboard"
                to="/dashboard"  // Mengarah ke halaman Dashboard
            />
            {/* <SidebarItem
                icon={<Computer size={20} />}
                text="Item"
                to="/inventory/items"  // Mengarah ke halaman Dashboard
            />
            <SidebarItem
                icon={<Truck size={20} />}
                text="Pengiriman Pesanan"
                to="/logistic/delivery-order"  // Mengarah ke halaman Dashboard
            /> */}
            <SidebarItem
                icon={<ClipboardEdit size={20} />}
                text="Penjualan"
                to="/sales"
                subItems={[
                    {
                        text: "Dashboard",
                        to: "/sales/sales-dashboard",
                        icon: <Activity size={20}/>
                    },
                    {
                        text: "Pesanan Penjualan",
                        to: "/sales/sales-order",
                        icon: <NotebookPen size={20}/>
                    },
                    {
                        text: "Retur Penjualan",
                        to: "/sales/return-order",
                        icon: <PackageMinus size={20}/>
                    },
                    { type: "divider" }, // Tambahkan divider di sini
                    {
                        text: "Pelanggan",
                        to: "/sales/customers",
                        icon: <Store size={20}/>
                    },
                    {
                        text: "Sales",
                        to: "/sales/salesman",
                        icon: <UsersRound size={20}/>
                    },
                    // {
                    //     text: "Counter Sales Office",
                    //     to: "/sales/cso",
                    //     icon: <Users size={20}/>
                    // },
                ]}
            />
            <SidebarItem
                icon={<Warehouse size={20} />}
                text="Inventaris"
                to="/inventory"
                subItems={[
                    {
                        text: "Dashboard",
                        to: "/inventory/inventory-dashboard",
                        icon: <Activity size={20}/>
                    },
                    {
                        text: "Penyimpanan Stok",
                        to: "/inventory/storage",
                        icon: <Backpack size={20}/>
                    },
                    {
                        text: "Penyesuaian Stok",
                        to: "/inventory/adjustment",
                        icon: <FilePlus2 size={20}/>
                    },
                    {
                        text: "Pemindahan Stok",
                        to: "/inventory/transfer",
                        icon: <SendToBack size={20}/>
                    },
                    { type: "divider" }, // Tambahkan divider di sini
                    {
                        text: "Gudang Rak",
                        to: "/inventory/warehouse",
                        icon: <Warehouse size={20}/>
                    },
                    {
                        text: "Merek",
                        to: "/inventory/merks",
                        icon: <BadgeCheckIcon size={20}/>
                    },
                    {
                        text: "Kategori",
                        to: "/inventory/categories",
                        icon: <LayoutGrid size={20}/>
                    },
                    {
                        text: "Item",
                        to: "/inventory/items",
                        icon: <Computer size={20}/>
                    },
                ]}
            />
            <SidebarItem
                icon={<Package size={20} />}
                text="Logistik"
                to="/logistic"
                subItems={[
                    {
                        text: "Dashboard",
                        to: "/logistic/logistic-dashboard",
                        icon: <Activity size={20}/>
                    },
                    {
                        text: "Pengiriman Pesanan",
                        to: "/logistic/delivery-order",
                        icon: <Truck size={20}/>
                    },
                    {
                        text: "Faktur Pesanan",
                        to: "/logistic/invoice-order",
                        icon: <Receipt size={20}/>
                    },
                    // {
                    //     text: "Pelacakan Pesanan",
                    //     to: "/logistic/tracking-orders",
                    //     icon: <Locate size={20}/>
                    // },
                    { type: "divider" }, // Tambahkan divider di sini
                    {
                        text: "Kurir",
                        to: "/logistic/couriers",
                        icon: <UserCog size={20}/>
                    },
                    {
                        text: "Pengangkutan",
                        to: "/logistic/express",
                        icon: <Ship size={20}/>
                    },
                    // {
                    //     text: "Rute",
                    //     to: "/logistic/routes",
                    //     icon: <Map size={20}/>
                    // },
                ]}
            />
            <hr />
            <SidebarItem
                icon={<Settings size={20} />}
                text="Pengaturan"
                to="/settings"  // Mengarah ke halaman Kategori
            />
        </Sidebar>
    );
}

export default SidebarPages;