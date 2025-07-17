import { Link, useLocation } from 'react-router-dom';
import { MoreVertical, ChevronLast, ChevronFirst, ChevronDown, ChevronUp } from "lucide-react";
import { useContext, createContext, useState } from "react";
import './Sidebar.css';
import React from "react";

const SidebarContext = createContext();

export default function Sidebar({ children }) {
    const [expanded, setExpanded] = useState(() => {
        return localStorage.getItem("sidebarExpanded") === "true";
    });

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
                    <div className='sidebar-header'>{expanded ? "RIKO Parts" : ""}</div>
                    <button onClick={toggleSidebar} className="expand-button">
                        {expanded ? <ChevronFirst /> : <ChevronLast />}
                    </button>
                </div>

                <SidebarContext.Provider value={{ expanded }}>
                    <ul className="sidebar-items">{children}</ul>
                </SidebarContext.Provider>
            </nav>
        </aside>
    );
}

export function SidebarItem({ icon, text, alert, to, subItems = [] }) {
    const { expanded } = useContext(SidebarContext);
    const location = useLocation();
    const isActive = location.pathname.startsWith(to) || subItems.some(subItem => location.pathname === subItem.to);
    const [isOpen, setIsOpen] = useState(location.pathname.startsWith(to));

    return (
        <>
            <div className="sidebar-item-container">
                <Link
                    to={to || "#"}
                    style={{ textDecoration: 'none' }}
                    onClick={(e) => {
                        if (subItems.length > 0) {
                            e.preventDefault();
                            setIsOpen(!isOpen);
                        }
                    }}
                >
                    <li className={`sidebar-item ${isActive ? 'active' : ''}`}>
                        {icon}
                        <span className={`item-text ${expanded ? 'expanded' : 'collapsed'}`}>{text}</span>
                        {subItems.length > 0 && expanded && (
                            isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                        {alert && <div className={`alert ${!expanded ? 'collapsed' : ''}`} />}
                        {!expanded && <div className="tooltip">{text}</div>}
                    </li>
                </Link>
            </div>
            {isOpen && subItems.length > 0 && (
                <ul className={`sub-menu ${expanded ? 'expanded' : 'collapsed'}`}>
                    {subItems.map((subItem, index) => {
                        if (subItem.type === "divider") {
                            return <hr key={index} className="sidebar-divider" />;
                        }

                        const isSubActive = location.pathname.startsWith(subItem.to);
                        return (
                            <Link key={index} to={subItem.to} style={{ textDecoration: 'none' }}>
                                <li className={`sidebar-sub-item ${isSubActive ? 'active' : ''}`}>
                                    {subItem.icon}
                                    <span className={`sidebar-sub-item-text ${expanded ? 'expanded' : 'collapsed'}`}>{subItem.text}</span>
                                    {!expanded && <div className="tooltip">{subItem.text}</div>}
                                </li>
                            </Link>
                        );
                    })}
                </ul>

            )}
        </>
    );
}