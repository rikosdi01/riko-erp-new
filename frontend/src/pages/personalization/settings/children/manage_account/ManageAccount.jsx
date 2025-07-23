import { useNavigate } from 'react-router-dom';
import ContentHeader from '../../../../../components/content_header/ContentHeader';
import './ManageAccount.css';
import { useEffect, useState } from 'react';
import { useUsers } from '../../../../../context/auth/UsersContext';
import { MoreVertical } from 'lucide-react';
import UserRepository from '../../../../../repository/authentication/UserRepository';

const roles = ['Admin', 'CSO', 'Stok Controller', 'Logistic', 'Terakhir Aktif'];

const ManageAccount = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');
    const [selectedUserId, setSelectedUserId] = useState(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(".dropdown-container")) {
                setSelectedUserId(null);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    useEffect(() => {
        const unsubscribe = UserRepository.getUsers((fetchedUsers) => {
            setUsers(fetchedUsers);
        });

        return () => unsubscribe(); // Unsubscribe saat komponen unmount
    }, []); // dependency array wajib untuk mencegah infinite loop

    // Filter user aktif / tidak aktif
    const filteredUsers = users.filter((user) => {
        if (filter === 'all') return true;
        return filter === 'active' ? user.status === 'active' : user.status !== 'active';
    });

    return (
        <div className="main-container">
            <div className="manage-account-container">
                <ContentHeader title={"Kelola Akun"} />
                <div>
                    <div className='user-title-section'>Akun Internal</div>
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

                        <div className='manage-buttons'>
                            <button className="manage-button" onClick={() => navigate('/signup')}>Registrasi Akun</button>
                            <button className="manage-button" onClick={() => navigate('/settings/manage-account/roles')}>Kelola Role</button>
                        </div>
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
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.username}</td>
                                        {roles.map(role => (
                                            <td key={role} style={{ textAlign: "center" }}>
                                                {role === "Terakhir Aktif"
                                                    ? new Date(user.createdAt?.seconds * 1000).toLocaleDateString()
                                                    : user.role === role
                                                        ? "✅"
                                                        : ""}
                                            </td>
                                        ))}
                                        <td style={{ textAlign: "center", position: "relative" }} className="dropdown-container">
                                            <MoreVertical
                                                size={18}
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation(); // cegah bubbling
                                                    setSelectedUserId(user.id === selectedUserId ? null : user.id);
                                                }}
                                            />

                                            {selectedUserId === user.id && (
                                                <div className="dropdown-menu">
                                                    <div onClick={() => handleChangePassword(user)} className="dropdown-item">Ganti Password</div>
                                                    <div onClick={() => handleDeactivate(user)} className="dropdown-item">Nonaktifkan Akun</div>
                                                    <div onClick={() => handleDelete(user)} className="dropdown-item danger">Hapus Akun</div>
                                                </div>
                                            )}
                                        </td>

                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={roles.length + 2} style={{ textAlign: 'center', padding: '20px' }}>
                                        Belum ada data pengguna.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className='user-title-section'>Akun Pelanggan</div>
            </div>
        </div>
    );
};

export default ManageAccount;
