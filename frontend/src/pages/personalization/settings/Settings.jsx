import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import './Settings.css';
import { useToast } from "../../../context/ToastContext";
import {
    BarChart3,
    Package,
    Truck,
    History,
    User,
    Settings as SettingsIcon,
    UserCog,
    Edit
} from "lucide-react";
import { useUsers } from "../../../context/auth/UsersContext";
import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";

const Settings = () => {
    const { dispatch } = useContext(AuthContext);
    const { loginUser, accessList, isLoading } = useUsers();
    const { showToast } = useToast();
    const navigate = useNavigate();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!loginUser) {
        return <div>User tidak ditemukan atau belum login.</div>;
    }

    const handleLogOut = () => {
        // Dispatch action "LOGOUT" untuk memperbarui state currentUser ke null
        dispatch({ type: "LOGOUT" });

        // Menghapus cookie "user"
        Cookies.remove("user");

        // Navigasi ke halaman login atau halaman lain setelah logout

        showToast("success", "Berhasil Log Out!");
        navigate("/signin");  // Ganti dengan route yang sesuai
    }

    return (
        <div className="settings-container">
            <div className="settings-panel">
                <h2>Pengaturan Akun</h2>

                <section className="profile-section">
                    <h3><User size={18} style={{ marginRight: 8 }} /> Informasi Profil</h3>
                    <div className="profile-card">
                        <p><strong>Nama: </strong> {loginUser.username}</p>
                        <p><strong>Email: </strong> {loginUser.email}</p>
                        <p><strong>Role: </strong> {loginUser.role}</p>
                    </div>
                </section>

                {loginUser.role === 'admin' && (
                <section className="password-section">
                    <h3>🔒 Ganti Password</h3>
                    <input type="password" placeholder="Password Saat Ini" />
                    <input type="password" placeholder="Password Baru" />
                    <input type="password" placeholder="Konfirmasi Password Baru" />
                    <button className="button-save">Simpan Perubahan</button>
                </section>
                )}


                <div className="settings-tile-section">
                    <h3><SettingsIcon size={18} style={{ marginRight: 8 }} /> Menu Pengaturan</h3>
                    <ul className="settings-tile-list">
                        <li className="settings-tile-item" onClick={() => navigate('/settings/mutation-sales')}><BarChart3 size={18} /> Mutasi Penjualan</li>
                        <li className="settings-tile-item" onClick={() => navigate('/settings/mutation-inventory')}><Package size={18} /> Mutasi Inventaris</li>
                        <li className="settings-tile-item" onClick={() => navigate('/settings/mutation-logistic')}><Truck size={18} /> Mutasi Pengiriman</li>
                        <li className="settings-tile-item" onClick={() => navigate('/settings/manage-account')}><UserCog size={18} /> Kelola Akun</li>
                        <li className="settings-tile-item" onClick={() => navigate('/settings/activity')}><History size={18} /> Riwayat Aktivitas</li>
                        <li className="settings-tile-item" onClick={() => navigate('/settings/formatting')}><Edit size={18} /> Format</li>
                    </ul>
                </div>


                <div className="settings-logout">
                    <button onClick={handleLogOut} className="button-logout">🚪 Log Out</button>
                </div>
            </div>
        </div>
    );
}

export default Settings;