import { Search } from 'lucide-react';
import './Navbar.css'
import React from "react";

const Navbar = () => {
    return (
        <div className='navbar-container'>
            <div className='navbar-title'>
                <div className='underline-navbar-title'>
                    Logistik
                </div>
                <div>
                    /
                </div>
                <div className='underline-navbar-title active'>
                    Pengaturan
                </div>
                {/* <div>
                    /
                </div>
                <div className='underline-navbar-title active'>
                    Riwayat Aktifitas
                </div> */}
            </div>
            <div className="navbar-search">
                <Search className='icon-search' size={18} />
                <input
                    type="text"
                    placeholder="Cari..."
                    className='search-text'
                />
            </div>
        </div>
    )
}

export default Navbar;