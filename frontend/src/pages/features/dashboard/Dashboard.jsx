import { Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import './Dashboard.css'
import { LineChart } from 'lucide-react';

const Dashboard = () => {
    const users = [
        {
            id: 1,
            name: 'Mini',
            role: 'admin',
            isActive: true,
            currentFeature: 'Dashboard Global',
            lastActiveAt: '2025-04-10T08:15:00'
        },
        {
            id: 2,
            name: 'Tiffany',
            role: 'cso',
            isActive: false,
            currentFeature: null,
            lastActiveAt: null
        },
        {
            id: 3,
            name: 'Dewi',
            role: 'logistik',
            isActive: true,
            currentFeature: 'Logistik',
            lastActiveAt: '2025-04-10T08:32:00'
        },
        {
            id: 4,
            name: 'Jefry',
            role: 'stok controller',
            isActive: true,
            currentFeature: 'Inventaris',
            lastActiveAt: '2025-04-10T09:10:00'
        },
        {
            id: 5,
            name: 'Patricia',
            role: 'cso',
            isActive: true,
            currentFeature: 'Penjualan',
            lastActiveAt: '2025-04-10T09:45:00'
        },
        {
            id: 6,
            name: 'Michael',
            role: 'logistik',
            isActive: false,
            currentFeature: null,
            lastActiveAt: null
        },
        {
            id: 7,
            name: 'Gita',
            role: 'stok controller',
            isActive: false,
            currentFeature: null,
            lastActiveAt: null
        },
        {
            id: 8,
            name: 'Hadi',
            role: 'admin',
            isActive: true,
            currentFeature: 'Monitoring Pengguna',
            lastActiveAt: '2025-04-10T10:03:00'
        },
        {
            id: 9,
            name: 'Angelica',
            role: 'cso',
            isActive: true,
            currentFeature: 'Input Pesanan',
            lastActiveAt: '2025-04-10T10:14:00'
        },
        {
            id: 10,
            name: 'Joko',
            role: 'logistik',
            isActive: false,
            currentFeature: null,
            lastActiveAt: null
        },
    ];

    const totalUsers = 0;
    const activeUsers = users.filter(u => u.isActive);
    const inactiveUsers = users.filter(u => !u.isActive);

    const formatDateTime = (isoDate) => {
        const date = new Date(isoDate);
        const options = {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        };
        const time = date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });

        const tanggal = date.toLocaleDateString('id-ID', options);
        return `${tanggal} - ${time} WIB`;
    };

    const data = [];

    return (
        <div className="dashboard-container">
            <div className="card-grid">
                <div className="card">
                    <h3>Total Item</h3>
                    <div className='card-value'>{totalUsers}</div>
                </div>
                <div className="card">
                    <h3>Total Item dengan stok menipis</h3>
                    <div className='card-value'>{totalUsers}</div>
                </div>
                <div className="card">
                    <h3>Total Item dengan stok kosong</h3>
                    <div className='card-value'>{totalUsers}</div>
                </div>
            </div>

            {/* <div className="chart-card">
                <h3>Jumlah Invoice per Bulan</h3>
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                            <XAxis dataKey="month" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#82ca9d" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ textAlign: 'center', padding: '50px 0', color: '#888' }}>
                        Tidak ada data invoice untuk ditampilkan.
                    </div>
                )}
            </div> */}

            <div className='chart-grid'>
                <div className="table-card">
                    <h3>Daftar Item dengan stok menipis</h3>
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>Nama Item</th>
                                <th>Kuantitas</th>
                                <th>Sejak Tanggal</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="table-card">
                    <h3>Daftar Item dengan stok kosong</h3>
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>Nama Item</th>
                                <th>Sejak Tanggal</th>
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


            <div className="active-users">
                <h3>Aktifitas terakhir</h3>
                {/* <ul>
                    {[...activeUsers]
                        .sort((a, b) => new Date(b.lastActiveAt) - new Date(a.lastActiveAt))
                        .map(user => (
                            <li key={user.id} className={user.role.replace(/\s/g, '-')}>
                                <strong>{user.name}</strong> ({user.role}) sedang membuka fitur <strong>{user.currentFeature}</strong><br />
                                <span style={{ fontSize: '0.9em', color: '#666' }}>
                                    {formatDateTime(user.lastActiveAt)}
                                </span>
                            </li>
                        ))}

                </ul> */}

                Tidak ada aktifitas pengguna saat ini.
            </div>
        </div>
    )
}

export default Dashboard
