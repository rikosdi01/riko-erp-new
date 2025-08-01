import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

import './SalesDashboard.css';
import { soIndex, usersIndex } from '../../../../../config/algoliaConfig';
import { useSalesman } from '../../../../context/sales/SalesmanContext';
import Formatting from '../../../../utils/format/Formatting';

const SalesDashboard = () => {
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [totalReturns, setTotalReturns] = useState(0);
    const [orderStatusData, setOrderStatusData] = useState([]);
    const [latestOrders, setLatestOrders] = useState([]);
    const { salesmen } = useSalesman(); // ← ambil dari context


    const STATUS_LABELS = ['mengantri', 'diproses', 'selesai', 'pending', 'tertunda'];
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA66CC'];

    useEffect(() => {
        const fetchSalesData = async () => {
            try {
                // 1. Pesanan Penjualan
                const ordersRes = await soIndex.search('', { hitsPerPage: 1000 });
                const orders = ordersRes.hits;
                setTotalOrders(ordersRes.nbHits);

                // Hitung berdasarkan status
                const statusMap = {};
                orders.forEach(order => {
                    const status = order.status || 'tidak diketahui';
                    statusMap[status] = (statusMap[status] || 0) + 1;
                });

                const statusData = Object.entries(statusMap).map(([status, count]) => ({
                    status,
                    count
                }));
                setOrderStatusData(statusData);

                // Ambil 5 orderan terbaru
                setLatestOrders(orders.slice(0, 5));

                // 2. Total Customer
                const customersRes = await usersIndex.search('', { hitsPerPage: 0 });
                setTotalCustomers(customersRes.nbHits);

                // 3. Total Retur Penjualan
                // const returnRes = await ioI.search('', { hitsPerPage: 0 });
                // setTotalReturns(returnRes.nbHits);

            } catch (err) {
                console.error("Sales Dashboard Error:", err);
            }
        };

        fetchSalesData();
    }, []);

    return (
        <div className="main-container">
            <h1>Sales Dashboard</h1>

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="card">Total Pesanan: {totalOrders}</div>
                <div className="card">Total Customer: {totalCustomers}</div>
                <div className="card">Total Salesman: {salesmen?.length || 0}</div>
                <div className="card">Total Retur: {totalReturns}</div>
            </div>

            {/* Chart Status Pesanan */}
            <div className="charts">
                <div className="chart-container">
                    <h3>Status Pesanan</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={orderStatusData}
                                dataKey="count"
                                nameKey="status"
                                outerRadius={80}
                                label
                            >
                                {orderStatusData.map((entry, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Legend />
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tabel Pesanan Terbaru */}
            <div className="recent-orders">
                <h3>Pesanan Terbaru</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Kode</th>
                            <th>Customer</th>
                            <th>Status</th>
                            <th>Tanggal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {latestOrders.map(order => (
                            <tr key={order.objectID}>
                                <td>{order.code || '-'}</td>
                                <td>{order.customer?.name || '-'}</td>
                                <td>{order.status}</td>
                                <td>{Formatting.formatDateByTimestamp(order.createdAt)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesDashboard;