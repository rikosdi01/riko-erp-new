import { BadgeCheckIcon, ClipboardEdit, Computer, HandCoins, LayoutDashboard, LayoutGrid, NotebookPen, PackageMinus, PiggyBank, Receipt, Settings, Store, Truck, Users, UsersRound, Warehouse } from "lucide-react";
import Sidebar, { SidebarItem } from "./Sidebar";
import React from "react";

const SidebarPages = () => {
    return (
        <Sidebar>
            <SidebarItem
                icon={<LayoutDashboard size={20} />}
                text="Dashboard"
                to="/dashboard"  // Mengarah ke halaman Dashboard
            />
            <SidebarItem
                icon={<ClipboardEdit size={20} />}
                text="Penjualan"
                to="/sales"
                subItems={[
                    {
                        text: "Pesanan Penjualan",
                        to: "/sales/so",
                        icon: <NotebookPen size={20}/>
                    },
                    {
                        text: "Pengiriman Pesanan",
                        to: "/sales/do",
                        icon: <Truck size={20}/>
                    },
                    {
                        text: "Faktur Penjualan",
                        to: "/sales/invoice",
                        icon: <Receipt size={20}/>
                    },
                    {
                        text: "Retur Penjualan",
                        to: "/sales/returns",
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
                    {
                        text: "Counter Sales Office",
                        to: "/sales/cso",
                        icon: <Users size={20}/>
                    },
                ]}
            />
            <SidebarItem
                icon={<Warehouse size={20} />}
                text="Gudang"
                to="/warehouse"
                subItems={[
                    {
                        text: "Merek",
                        to: "/warehouse/merks",
                        icon: <BadgeCheckIcon size={20}/>
                    },
                    {
                        text: "Kategori",
                        to: "/warehouse/categories",
                        icon: <LayoutGrid size={20}/>
                    },
                    {
                        text: "Item",
                        to: "/warehouse/items",
                        icon: <Computer size={20}/>
                    },
                ]}
            />
            <SidebarItem
                icon={<PiggyBank size={20} />}
                text="Simpanan"
                to="/saving"  // Mengarah ke halaman Kategori
            />
            <SidebarItem
                icon={<HandCoins size={20} />}
                text="Pinjaman"
                to="/loan"  // Mengarah ke halaman Kategori
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