import { useCourier } from '../../../../context/logistic/CourierContext';
import { useDeliveryOrder } from '../../../../context/logistic/DeliveryOrderContext';
import { useExpress } from '../../../../context/logistic/ExpressContext';
import { useInvoice } from '../../../../context/sales/InvoiceContext';
import './LogisticDashboard.css';

import { ResponsiveContainer, BarChart, Cell, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';

const LogisticDashboard = () => {
    // Dummy fallback data
    const dummyInvoices = [
        { createdAt: new Date('2024-05-01') },
        { createdAt: new Date('2024-05-15') },
        { createdAt: new Date('2024-06-01') },
    ];

    const dummyDeliveryOrders = [
        { code: 'DO-001', statusDO: 'Sedang dikirim' },
        { code: 'DO-002', statusDO: 'Tertunda' },
        { code: 'DO-003', statusDO: 'Tercetak' },
    ];

    const dummyCouriers = [
        { name: 'Kurir A', telp: '081234567890', status: 'Aktif' },
        { name: 'Kurir B', telp: '082345678901', status: 'Tidak Aktif' },
    ];

    const dummyExpress = [
        { name: 'JNE' },
        { name: 'TIKI' },
    ];


    const deliveryOrder = dummyDeliveryOrders;
    const invoice = dummyInvoices;
    const couriers = dummyCouriers;
    const express = dummyExpress;


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
        <div className="main-container">
            <div className='dashboard-page'>
                {/* Summary Cards */}
                <div className="summary-cards-container">
                    <div className="summary-card">
                        <div className="summary-card-title">Total Delivery Orders</div>
                        <div className="summary-card-value">{deliveryOrder?.length || 0}</div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-card-title">Total Invoices</div>
                        <div className="summary-card-value">{invoice?.length || 0}</div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-card-title">Kurir Aktif</div>
                        <div className="summary-card-value">{couriers?.length || 0}</div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-card-title">Layanan Ekspedisi</div>
                        <div className="summary-card-value">{express?.length || 0}</div>
                    </div>
                </div>

                <div className="charts-section">
                    {/* Chart: Invoice per Bulan */}
                    <div className="chart-card">
                        <h3>Jumlah Invoice per Bulan</h3>
                        {invoiceChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={invoiceChartData}>
                                    <XAxis dataKey="month" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="count" stroke="#82ca9d" strokeWidth={3} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div>Tidak ada data</div>
                        )}
                    </div>
                </div>


                <div className="charts-section">
                    {/* Tabel: Delivery Order */}
                    <div className="chart-card">
                        <h3>Status Pengiriman Delivery Order Terbaru</h3>
                        {latestDOChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
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
                                        {latestDOChartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={statusColors[entry.statusDO] || statusColors["default"]}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div>Tidak ada data</div>
                        )}
                    </div>
                </div>

                {/* Tabel: Kurir */}
                <div className="table-container">
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
                            {couriers.filter(c => c.status === 'Aktif').length === 0 && (
                                <tr>
                                    <td>-</td>
                                    <td>-</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
};


export default LogisticDashboard;