import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { useAdjustment } from '../../../../context/warehouse/AdjustmentContext';
import { useCategories } from '../../../../context/warehouse/CategoryContext';
import { useInventory } from '../../../../context/warehouse/InventoryContext';
import { useItems } from '../../../../context/warehouse/ItemContext';
import { useMerks } from '../../../../context/warehouse/MerkContext';
import { useTransfer } from '../../../../context/warehouse/TransferContext';
import './InventoryDashboard.css';

const InventoryDashboard = () => {
    const { inventory } = useInventory();
    const { adjustment } = useAdjustment();
    const { transfer } = useTransfer();
    const { merks } = useMerks();
    const { categories } = useCategories();
    const { items } = useItems();

    // Kalkulasi metrik
    // const totalStock = items.reduce((total, item) => total + Number(item.quantity), 0);
    // const uniqueItems = items.length;
    // const totalAdjustments = adjustment.length;
    // const totalTransfers = transfer.length;
    // const totalCategories = categories.length;
    // const totalMerks = merks.length;
    const totalStock = 0;
    const uniqueItems = 0;
    const totalAdjustments = 0;
    const totalTransfers = 0;
    const totalCategories = 0;
    const totalMerks = 0;


    // Ambil Top 5 item berdasarkan quantity
    const topItems = [...items]
        .sort((a, b) => Number(b.quantity) - Number(a.quantity))
        .slice(0, 5)
        .map(item => ({
            name: item.name,
            quantity: Number(item.quantity)
        }));

    // Hitung distribusi merk
    const merkMap = {};
    items.forEach(item => {
        if (merkMap[item.brandName]) {
            merkMap[item.brandName] += Number(item.quantity);
        } else {
            merkMap[item.brandName] = Number(item.quantity);
        }
    });
    const merkData = Object.entries(merkMap).map(([name, value]) => ({ name, value }));

    // Helper untuk format bulan
    const formatMonth = (dateInput) => {
        let date;

        if (typeof dateInput === 'object' && typeof dateInput.toDate === 'function') {
            // Jika Firestore Timestamp
            date = dateInput.toDate();
        } else {
            // Asumsikan miliseconds number
            date = new Date(dateInput);
        }

        if (isNaN(date)) return 'Invalid Date'; // Fallback jika tetap gagal

        return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    };

    // Hitung adjustment per bulan
    const adjustmentPerMonth = {};
    adjustment.forEach(adj => {
        const month = formatMonth(adj.createdAt); // pastikan 'createdAt' adalah nama field tanggal adjustment
        adjustmentPerMonth[month] = (adjustmentPerMonth[month] || 0) + 1;
    });

    // Ubah jadi array untuk Recharts
    const adjustmentData = Object.entries(adjustmentPerMonth)
        .sort(([a], [b]) => new Date(a) - new Date(b)) // urutkan berdasarkan tanggal
        .map(([month, count]) => ({ month, count }));



    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BE6', '#FF6384'];


    return (
        <div className="dashboard-container">
            <div className="card-grid">
                {/* <div className="card">
                    <h3>Total Stok Barang</h3>
                    <div className="card-value">{totalStock}</div>
                </div> */}
                <div className="card">
                    <h3>Total Item</h3>
                    <div className="card-value">{uniqueItems}</div>
                </div>
                <div className="card">
                    <h3>Total Kategori</h3>
                    <div className="card-value">{totalCategories}</div>
                </div>
                {/* <div className="card">
                    <h3>Total Merk</h3>
                    <div className="card-value">{totalMerks}</div>
                </div> */}
                <div className="card">
                    <h3>Total Adjustment</h3>
                    <div className="card-value">{totalAdjustments}</div>
                </div>
                <div className="card">
                    <h3>Total Transfer</h3>
                    <div className="card-value">{totalTransfers}</div>
                </div>
            </div>

            <div className="chart-grid">
                <div className="chart-card-custom">
                    <h3>Top 5 Barang dengan Stok Terbanyak</h3>
                    {/* <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topItems}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="quantity" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer> */}
                    <div>Tidak ada data</div>
                </div>

                <div className="chart-card-custom">
                    <h3>Distribusi Stok Berdasarkan Merk</h3>
                    {/* <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={merkData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                                label
                            >
                                {merkData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer> */}
                    <div>Tidak ada data</div>
                </div>

                {/* <div className="table-card">
                    <h3>5 Barang dengan Stok Terendah</h3>
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>Nama Barang</th>
                                <th>Merk</th>
                                <th>Kategori</th>
                                <th>Stok</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...items]
                                .sort((a, b) => Number(a.quantity) - Number(b.quantity))
                                .slice(0, 5)
                                .map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.name}</td>
                                        <td>{item.brandName}</td>
                                        <td>{item.categoryName}</td>
                                        <td>{item.quantity}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div> */}

                <div className="chart-card-custom">
                    <h3>5 Barang dengan Stok Terendah</h3>
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>Nama Barang</th>
                                <th>Merk</th>
                                <th>Kategori</th>
                                <th>Stok</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="chart-card-custom">
                    <h3>Grafik Garis: Jumlah Adjustment per Bulan</h3>
                    {/* <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={adjustmentData}>
                            <XAxis dataKey="month" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#FF6B6B" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer> */}
                    <div>Tidak ada data</div>
                </div>
            </div>
        </div>
    );
};

export default InventoryDashboard;
