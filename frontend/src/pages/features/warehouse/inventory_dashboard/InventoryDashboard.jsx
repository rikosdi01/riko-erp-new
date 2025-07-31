import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

import './InventoryDashboard.css';
import { categoryIndex, productIndex } from '../../../../../config/algoliaConfig';
import { useMerks } from '../../../../context/warehouse/MerkContext';

const InventoryDashboard = () => {
    const [totalItems, setTotalItems] = useState(0);
    const [totalStock, setTotalStock] = useState(0);
    const [categoryCount, setCategoryCount] = useState(0);
    const [stockPerCategory, setStockPerCategory] = useState([]);
    const [stockByWarehouse, setStockByWarehouse] = useState([]);
    const { merks } = useMerks(); // Ambil dari context
    console.log('Merks: ', merks);

    useEffect(() => {
    const fetchDashboardData = async () => {
        try {
            // 1. Total Items
            const itemRes = await productIndex.search('', { hitsPerPage: 1000 });
            setTotalItems(itemRes.nbHits);

            const hits = itemRes.hits;

            // 2. Total Stock
            const totalQty = hits.reduce((acc, hit) => acc + (hit.stock || 0), 0);
            setTotalStock(totalQty);

            // 3. Total Kategori
            const categoriesRes = await categoryIndex.search('', { hitsPerPage: 0 });
            setCategoryCount(categoriesRes.nbHits);

            // 4. Stock per Category
            const categoryStockMap = {};
            hits.forEach(hit => {
                const categoryName = hit.category?.name || 'Tidak diketahui';
                const stock = hit.stock || 0;

                if (!categoryStockMap[categoryName]) {
                    categoryStockMap[categoryName] = 0;
                }

                categoryStockMap[categoryName] += stock;
            });

            const categoryData = Object.entries(categoryStockMap).map(([category, stock]) => ({
                category,
                stock
            }));
            setStockPerCategory(categoryData);

            // 5. Stock by Warehouse (from racks)
            const warehouseMap = {};
            hits.forEach(hit => {
                hit.racks?.forEach(rackInfo => {
                    const rackName = rackInfo.rack || 'Tidak diketahui';
                    const stock = rackInfo.stock || 0;

                    if (!warehouseMap[rackName]) {
                        warehouseMap[rackName] = 0;
                    }

                    warehouseMap[rackName] += stock;
                });
            });

            const warehouseData = Object.entries(warehouseMap).map(([name, value]) => ({
                name,
                value
            }));
            setStockByWarehouse(warehouseData);

        } catch (error) {
            console.error('Dashboard data fetch error:', error);
        }
    };

    fetchDashboardData();
}, []);



    const summary = {
        totalItems,
        totalStock,
        categories: categoryCount,
        merks: merks?.length || 0
    };
    const recentTransfers = [
        { id: 1, item: 'Printer', from: 'Gudang A', to: 'Gudang B', qty: 5 },
        { id: 2, item: 'Kabel LAN', from: 'Gudang B', to: 'Gudang C', qty: 20 },
        { id: 3, item: 'Notebook', from: 'Gudang A', to: 'Gudang C', qty: 10 }
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

    return (
        <div className="main-container">
            <h1>Inventory Dashboard</h1>

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="card">Total Item: {summary.totalItems}</div>
                <div className="card">Total Total Stok: {summary.totalStock}</div>
                <div className="card">Total Kategori: {summary.categories}</div>
                <div className="card">Total Merek: {summary.merks}</div>
            </div>

            {/* Charts */}
            <div className="charts">
                <div className="chart-container">
                    <h3>Stok per Kategori</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={stockPerCategory}>
                            <XAxis dataKey="category" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="stock" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-container">
                    <h3>Distribusi Gudang</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={stockByWarehouse}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={80}
                                label
                            >
                                {stockByWarehouse.map((entry, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Legend />
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Transfers Table */}
            <div className="recent-transfers">
                <h3>Pemindahan Stok Terbaru</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Dari</th>
                            <th>Ke</th>
                            <th>Jumlah</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentTransfers.map(t => (
                            <tr key={t.id}>
                                <td>{t.item}</td>
                                <td>{t.from}</td>
                                <td>{t.to}</td>
                                <td>{t.qty}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InventoryDashboard;
