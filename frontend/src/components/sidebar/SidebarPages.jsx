import {  HandCoins, LayoutDashboard, PiggyBank, Settings, Users, Warehouse } from "lucide-react";
import Sidebar, { SidebarItem } from "./Sidebar";
import React from "react";

const SidebarPages = () => {
    return (
        <Sidebar>
            <SidebarItem
                icon={<LayoutDashboard size={20} />}
                text="Dashboard"
                to="/"  // Mengarah ke halaman Dashboard
            />
            <SidebarItem
                icon={<Warehouse size={20} />}
                text="Warehouse"
                to="/warehouse"  // Mengarah ke halaman Item
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