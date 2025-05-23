import { useCourier } from '../../../../context/logistic/CourierContext';
import { useDeliveryOrder } from '../../../../context/logistic/DeliveryOrderContext';
import { useExpress } from '../../../../context/logistic/ExpressContext';
import { useInvoice } from '../../../../context/sales/InvoiceContext';
import './LogisticDashboard.css';

import { ResponsiveContainer, BarChart, Cell, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';

const LogisticDashboard = () => {
    const { deliveryOrder } = useDeliveryOrder();
    const { invoice } = useInvoice();
    const { couriers } = useCourier();
    const { express } = useExpress();

    // Helper konversi Timestamp Firestore
    const formatMonth = (timestamp) => {
        const date = timestamp?.toDate?.() || new Date(timestamp);
        return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    };

    // Hitung invoice per bulan
    const invoicePerMonth = {};
    invoice.forEach(inv => {
        const month = formatMonth(inv.createdAt);
        invoicePerMonth[month] = (invoicePerMonth[month] || 0) + 1;
    });

    const invoiceChartData = Object.entries(invoicePerMonth)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([month, count]) => ({ month, count }));

    const latestDOChartData = deliveryOrder.slice(0, 5).map((item) => ({
        noDO: item.code || "—",
        statusDO: item.statusDO || "Tidak diketahui",
        dummyValue: 1,
    }));


    const statusColors = {
        "Sedang dikirim": "#4CAF50",
        "Tertunda": "#FFC107",
        "Dibatalkan": "#F44336",
        "Tercetak": "#2196F3",
        "default": "#9E9E9E"
    };


    return (
        <div className="dashboard-container">
            {/* Summary Cards */}
            <div className="card-grid">
                <div className="card"><h3>Total Delivery Orders</h3><div className="card-value">{0}</div></div>
                <div className="card"><h3>Total Invoices</h3><div className="card-value">{0}</div></div>
                <div className="card"><h3>Kurir Aktif</h3><div className="card-value">{0}</div></div>
                <div className="card"><h3>Layanan Ekspedisi</h3><div className="card-value">{0}</div></div>
            </div>

            <div className="chart-grid">
                {/* Chart: Invoice per Bulan */}
                <div className="chart-card-custom">
                    <h3>Jumlah Invoice per Bulan</h3>
                    {/* <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={invoiceChartData}>
                            <XAxis dataKey="month" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#82ca9d" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer> */}
                    <div>Tidak ada data</div>
                </div>

                {/* Tabel: Delivery Order */}
                <div className="chart-card-custom">
                    <h3>Status Pengiriman Delivery Order Terbaru</h3>
                    {/* <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={latestDOChartData}>
                            <XAxis dataKey="noDO" />
                            <YAxis hide />
                            <Tooltip formatter={(value, name, props) => props.payload.statusDO} />
                            <Bar
                                dataKey="dummyValue"
                                fill="#8884d8"
                                barSize={30}
                                name="Status Pengiriman"
                            >
                                {
                                    latestDOChartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={statusColors[entry.statusDO] || statusColors["default"]}
                                        />
                                    ))
                                }
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer> */}
                    <div>Tidak ada data</div>
                </div>


                {/* Tabel: Kurir */}
                {/* <div className="table-card">
                    <h3>Daftar Kurir Aktif</h3>
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>Nama</th>
                                <th>No. Telp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {couriers.filter(c => c.status === 'Aktif').map((courier, idx) => (
                                <tr key={idx}>
                                    <td>{courier.name}</td>
                                    <td>{courier.telp}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div> */}

                <div className="chart-card-custom">
                    <h3>Daftar Kurir Aktif</h3>
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>Nama</th>
                                <th>No. Telp</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>-</td>
                                <td>-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};


export default LogisticDashboard;