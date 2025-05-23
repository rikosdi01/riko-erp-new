import React, { useState } from "react";
import './MutationSales.css';
import {
    Search
} from "lucide-react";
import ContentHeader from "../../../../../../components/content_header/ContentHeader";

const MutationSales = () => {
    const [filter, setFilter] = useState("Pesanan Penjualan");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="mutation-sales-container">
            <ContentHeader title={"Mutasi Penjualan"} />

            <div className="filter-section">
                <div className="filter-header">
                    <div className="navbar-search">
                        <Search className='icon-search' size={18} />
                        <input
                            type="text"
                            placeholder="Cari..."
                            className='search-text'
                        />
                    </div>

                    <div className="filter-date">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <span className="separator">s/d</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>

                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option>Pesanan Penjualan</option>
                    <option>Retur Penjualan</option>
                    <option>Pelanggan</option>
                    <option>Sales</option>
                </select>
            </div>

            <div className="mutation-sales-data">
                <p className="no-data">Tidak ada data</p>
            </div>
        </div>
    );
};

export default MutationSales;
