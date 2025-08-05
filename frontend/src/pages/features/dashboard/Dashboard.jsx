import { useEffect, useState } from "react";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import './Dashboard.css';
import { productIndex, soIndex, usersIndex } from "../../../../config/algoliaConfig";

const Dashboard = () => {
    const [totalItems, setTotalItems] = useState(0);
    const [totalStock, setTotalStock] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [orderStatusData, setOrderStatusData] = useState([]);
    const [totalCustomer, setTotalCustomer] = useState(0);

    const recentTransfers = [
        { id: 1, item: 'As Kick Stater RIKO - Beat (Honda)', from: 'Jakarta', to: 'Medan', qty: 5, set: 'set' },
        { id: 2, item: 'As Kick Stater RIKO - Astrea (Honda)', from: 'Jakarta', to: 'Medan', qty: 20, set: 'set' },
        { id: 3, item: 'As Kick Stater RIKO - Grand (Honda)', from: 'Jakarta', to: 'Medan', qty: 10, set: 'set' },
        { id: 3, item: 'Botol Klep RIKO - Legenda (Honda)', from: 'Medan', to: 'Jakarta', qty: 50, set: 'set' },
        { id: 3, item: 'Botol Klep RIKO - Vixion (Yamaha)', from: 'Medan', to: 'Jakarta', qty: 40, set: 'set' },
    ];

    const STATUS_LABELS = ['mengantri', 'diproses', 'selesai', 'pending', 'tertunda'];
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA66CC'];

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


                // 3. Total Customer
                const customerRes = await usersIndex.search('', {
                    hitsPerPage: 0,
                    filters: 'type: customer'
                });
                setTotalCustomer(customerRes.nbHits);


            } catch (error) {
                console.error('Dashboard data fetch error:', error);
            }
        };

        fetchDashboardData();
    }, []);


    return (
        <div className="main-container">
            <div className='dashboard-page'>
                <h1>Dashboard Admin</h1>

                <div className="summary-cards-container">
                    <div className="summary-card">
                        <div className="summary-card-title">Total Pesanan</div>
                        <div className="summary-card-value">{totalOrders}</div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-card-title">Total Pelanggan</div>
                        <div className="summary-card-value">{totalCustomer}</div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-card-title">Total Item</div>
                        <div className="summary-card-value">{totalItems}</div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-card-title">Total Stok</div>
                        <div className="summary-card-value">{totalStock}</div>
                    </div>
                </div>

                {/* Chart Status Pesanan */}
                <div className="charts-section">
                    <div className="chart-card">
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

export default Dashboard;
