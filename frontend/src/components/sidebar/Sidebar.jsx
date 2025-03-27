import { Link, useLocation } from 'react-router-dom';
import { MoreVertical, ChevronLast, ChevronFirst, Search, Plus } from "lucide-react"
import { useContext, createContext, useState } from "react"
import './Sidebar.css'
import React from "react";

const SidebarContext = createContext()

export default function Sidebar({ children }) {
    // Ambil status sidebar dari localStorage saat pertama kali dimuat
    const [expanded, setExpanded] = useState(() => {
        return localStorage.getItem("sidebarExpanded") === "true";
    });

    // Fungsi untuk toggle sidebar dan simpan ke localStorage
    const toggleSidebar = () => {
        setExpanded((curr) => {
            const newState = !curr;
            localStorage.setItem("sidebarExpanded", newState);
            return newState;
        });
    };

    return (
        <aside className={`sidebar ${expanded ? "expanded" : "collapsed"}`}>
            <nav className="nav">
                <div className="logo-section">
                    {/* <img
                        src={"https://img.logoipsum.com/243.svg"}
                        className={`logo ${expanded ? "expanded" : "collapsed"}`}
                        alt=""
                    /> */}
                    <div className='sidebar-header'>{expanded ? "RIKO Parts" : ""}</div>
                    <button onClick={toggleSidebar} className="expand-button">
                        {expanded ? <ChevronFirst /> : <ChevronLast />}
                    </button>
                </div>

                <SidebarContext.Provider value={{ expanded }}>
                    <ul className="sidebar-items">{children}</ul>
                </SidebarContext.Provider>

                <div className="user-profile">
                    <img
                        src="https://ui-avatars.com/api/?background=c7d2fe&color=3730a3&bold=true"
                        alt="Profile"
                        className="user-profile-image"
                    />
                    <div className={`user-details ${expanded ? "expanded" : "collapsed"}`}>
                        <div className="user-information">
                            <h4 className="user-name">Junior Chen</h4>
                            <span className="user-email">ct.junior7@gmail.com</span>
                        </div>
                        <MoreVertical size={20} cursor="pointer" />
                    </div>
                </div>
            </nav>
        </aside >
    );
}


export function SidebarItem({ icon, text, alert, to }) {
    const { expanded } = useContext(SidebarContext);
    const location = useLocation();

    const isActive = location.pathname === to;

    return (
        <Link to={to} style={{ textDecoration: 'none' }}>
            <li className={`sidebar-item ${isActive ? 'active' : ''}`}>
                {icon}
                <span className={`item-text ${expanded ? 'expanded' : 'collapsed'}`}>
                    {text}
                </span>
                {alert && (
                    <div className={`alert ${!expanded ? 'collapsed' : ''}`} />
                )}
                {!expanded && (
                    <div className="tooltip">
                        {text}
                    </div>
                )}
            </li>
        </Link>
    )
}