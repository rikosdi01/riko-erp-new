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
    const { merks } = useMerks(); // Ambil dari context
    console.log('Merks: ', merks);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Total Items
                const itemRes = await productIndex.search('', { hitsPerPage: 1000 });
                setTotalItems(itemRes.nbHits);

                const hits = itemRes.hits;

                console.log('Hits: ', hits);
                // 2. Total Stock
                const totalQty = hits.reduce((acc, hit) => {
                    const stockValues = hit.stock ? Object.values(hit.stock) : [];
                    const stockSum = stockValues.reduce((sum, qty) => sum + qty, 0);
                    return acc + stockSum;
                }, 0);

                setTotalStock(totalQty);


                // 3. Total Kategori
                const categoriesRes = await categoryIndex.search('', { hitsPerPage: 0 });
                setCategoryCount(categoriesRes.nbHits);

                // 4. Stock per Category
                const categoryStockMap = {};
                hits.forEach(hit => {
                    const categoryName = hit.category?.name || 'Tidak diketahui';
                    const stockValues = hit.stock ? Object.values(hit.stock) : [];
                    const totalStock = stockValues.reduce((sum, qty) => sum + qty, 0);

                    if (!categoryStockMap[categoryName]) {
                        categoryStockMap[categoryName] = 0;
                    }

                    categoryStockMap[categoryName] += totalStock;
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
        { id: 1, item: 'As Kick Stater RIKO - Beat (Honda)', from: 'Jakarta', to: 'Medan', qty: 5, set: 'set' },
        { id: 2, item: 'As Kick Stater RIKO - Astrea (Honda)', from: 'Jakarta', to: 'Medan', qty: 20, set: 'set' },
        { id: 3, item: 'As Kick Stater RIKO - Grand (Honda)', from: 'Jakarta', to: 'Medan', qty: 10, set: 'set' },
        { id: 3, item: 'Botol Klep RIKO - Legenda (Honda)', from: 'Medan', to: 'Jakarta', qty: 50, set: 'set' },
        { id: 3, item: 'Botol Klep RIKO - Vixion (Yamaha)', from: 'Medan', to: 'Jakarta', qty: 40, set: 'set' },
    ];

    return (
        <div className="main-container">
            <div className='dashboard-page'>
                <h1>Dashboard Inventaris</h1>

                {/* Summary Cards */}
                <div className="summary-cards-container">
                    <div className="summary-card">
                        <div className="summary-card-title">Total Item</div>
                        <div className="summary-card-value">{summary.totalItems}</div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-card-title">Total Stok</div>
                        <div className="summary-card-value">{summary.totalStock}</div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-card-title">Total Kategori</div>
                        <div className="summary-card-value">{summary.categories}</div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-card-title">Total Merek</div>
                        <div className="summary-card-value">{summary.merks}</div>
                    </div>
                </div>

                {/* Charts */}
                <div className="charts-section">
                    <div className="chart-card">
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
                </div>

                {/* Recent Transfers Table */}
                <div className="recent-transfers-section">
                    <h3>Pencatatan Stok Terbaru</h3>
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
        </div>
    );
};

export default InventoryDashboard;
