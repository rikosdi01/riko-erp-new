import ContentHeader from '../../../../../components/content_header/ContentHeader';
import './ManageAccount.css';
import { useState } from 'react';

const roles = ['Admin', 'CSO', 'Stok Controller', 'Logistic', 'Terakhir Aktif'];

const ManageAccount = () => {
    const [filter, setFilter] = useState('all');

    return (
        <div className="main-container">
            <div className="manage-account-container">
                <ContentHeader title={"Kelola Akun"} />

                <div className="top-controls">
                    <div className="filter-options">
                        <label>
                            <input
                                type="radio"
                                value="all"
                                checked={filter === 'all'}
                                onChange={() => setFilter('all')}
                            />
                            Semua
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="active"
                                checked={filter === 'active'}
                                onChange={() => setFilter('active')}
                            />
                            Tampilkan hanya user aktif
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="inactive"
                                checked={filter === 'inactive'}
                                onChange={() => setFilter('inactive')}
                            />
                            Tampilkan hanya user tidak aktif
                        </label>
                    </div>

                    <button className="register-button">Registrasi Akun</button>
                </div>

                <table className="user-role-table">
                    <thead>
                        <tr>
                            <th>Nama Pengguna</th>
                            {roles.map(role => (
                                <th key={role}>{role}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={roles.length + 1} style={{ textAlign: 'center', padding: '20px' }}>
                                Belum ada data pengguna.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageAccount;
