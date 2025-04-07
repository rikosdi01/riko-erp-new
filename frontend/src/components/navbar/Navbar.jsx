import { Search } from 'lucide-react';
import './Navbar.css'
import React from "react";

const Navbar = () => {
    return (
        <div className='navbar-container'>
            <div className='navbar-title'>
                {/* Pinjaman dan Simpanan di bulan {Formatting.formatMonth()} */}
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