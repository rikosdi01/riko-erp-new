import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import dayjs from 'dayjs';
import { useCSO } from '../../../../context/sales/CSOContext';
import { useCustomers } from '../../../../context/sales/CustomersContext';
import { useReturnOrder } from '../../../../context/sales/ReturnOrderContext';
import { useSalesman } from '../../../../context/sales/SalesmanContext';
import { useSalesOrder } from '../../../../context/sales/SalesOrderContext';
import './SalesDashboard.css';

const SalesDashboard = () => {
    const { salesOrder } = useSalesOrder();
    const { returnOrder } = useReturnOrder();
    const { customers } = useCustomers();
    const { salesman } = useSalesman();
    const { cso } = useCSO();

    const totalOrder = salesOrder.length;
    const totalCustomer = customers.length;
    const totalPenjualan = salesOrder.reduce((acc, item) => acc + item.price, 0);
    const totalRetur = returnOrder.length;

    const orderStatusData = [
        { name: 'Tercetak', value: salesOrder.filter(item => item.status === 'Tercetak').length },
        { name: 'Belum Tercetak', value: salesOrder.filter(item => item.status === 'Belum Tercetak').length },
    ];

    const salesByCustomer = salesOrder.reduce((acc, order) => {
        const existing = acc.find(item => item.name === order.customerName);
        if (existing) {
            existing.total += order.price;
        } else {
            acc.push({ name: order.customerName, total: order.price });
        }
        return acc;
    }, []);

    const salesBySalesman = salesOrder.reduce((acc, order) => {
        console.log(acc);
        console.log(order);
        const existing = acc.find(item => item.name === order.salesmanName);
        if (existing) {
            existing.total += order.price;
        } else {
            acc.push({ name: order.salesmanName, total: order.price });
        }
        return acc;
    }, []);

    const monthlySales = {};

    salesOrder.forEach(order => {
        if (order.createdAt && dayjs(+order.createdAt).isValid()) {
            const month = dayjs(+order.createdAt).format('YYYY-MM');
            monthlySales[month] = (monthlySales[month] || 0) + order.price;
        }
    });

    const monthlySalesData = Object.entries(monthlySales).map(([month, total]) => ({
        month,
        total,
    }));


    const pieColors = ['#00C49F', '#FF8042'];

    return (
        <div className="dashboard-container">
            {/* Summary Cards */}
            <div className="card-grid">
                <div className="card">
                    <h3>Total Order</h3>
                    <p className="card-value">{totalOrder}</p>
                </div>
                <div className="card">
                    <h3>Total Customer</h3>
                    <p className="card-value">{totalCustomer}</p>
                </div>
                <div className="card">
                    <h3>Total Penjualan</h3>
                    <p className="card-value">Rp {totalPenjualan.toLocaleString('id-ID')}</p>
                </div>
                <div className="card">
                    <h3>Total Retur</h3>
                    <p className="card-value">{totalRetur}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="chart-grid">
                <div className="chart-card-custom">
                    <h3>Status Pemesanan</h3>
                    {/* <PieChart width={300} height={250}>
                        <Pie
                            data={orderStatusData}
                            cx="50%"
                            cy="50%"
                            label
                            outerRadius={80}
                            dataKey="value"
                        >
                            {orderStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart> */}
                    <div>Tidak ada data</div>
                </div>

                <div className="chart-card-custom">
                    <h3>Penjualan per Customer</h3>
                    {/* <BarChart width={400} height={250} data={salesByCustomer}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `Rp ${value / 1000}k`} />
                        <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
                        <Legend />
                        <Bar dataKey="total" fill="#8884d8" name="Penjualan" />
                    </BarChart> */}
                    <div>Tidak ada data</div>
                </div>

                <div className="chart-card-custom">
                    <h3>Penjualan per Salesman</h3>
                    {/* <BarChart width={400} height={250} data={salesBySalesman}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `Rp ${value / 1000}k`} />
                        <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
                        <Legend />
                        <Bar dataKey="total" fill="#82ca9d" name="Penjualan" />
                    </BarChart> */}
                    <div>Tidak ada data</div>
                </div>

                <div className="chart-card-custom">
                    <h3>Tren Penjualan Bulanan</h3>
                    {/* <LineChart width={400} height={250} data={monthlySalesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `Rp ${value / 1000}k`} />
                        <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
                        <Legend />
                        <Line type="monotone" dataKey="total" stroke="#ff7300" name="Penjualan Bulanan" />
                    </LineChart> */}
                    <div>Tidak ada data</div>
                </div>

            </div>
        </div>
    );
};

export default SalesDashboard;
