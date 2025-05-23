import { useContext } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import './Settings.css';
import { useToast } from "../../../context/ToastContext";
import React from "react";
import {
    BarChart3,
    Package,
    Truck,
    UserPlus,
    History,
    Bell,
    HelpCircle,
    LogOut,
    User,
    Lock,
    Eye,
    Settings as SettingsIcon,
    Palette,
    UserCog
} from "lucide-react";

const Settings = () => {
    const { dispatch } = useContext(AuthContext);  // Mengambil dispatch dari AuthContext
    const { showToast } = useToast();

    const navigate = useNavigate();

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
                        <p><strong>Nama: </strong> {"<username>"}</p>
                        <p><strong>Email: </strong> {"<user email>"}</p>
                        <p><strong>Role: </strong>{"Logistik"}</p>
                    </div>
                </section>

                {/* <section className="password-section">
                    <h3>🔒 Ganti Password</h3>
                    <input type="password" placeholder="Password Saat Ini" />
                    <input type="password" placeholder="Password Baru" />
                    <input type="password" placeholder="Konfirmasi Password Baru" />
                    <button className="button-save">Simpan Perubahan</button>
                </section> */}

                <section className="theme-section">
                    <h3>⚙️ Preferensi Tampilan</h3>
                    <label>
                        <input type="checkbox" /> Mode Gelap
                    </label>
                    <label>
                        Warna Utama: <input type="color" />
                    </label>
                </section>


                <div className="settings-tile-section">
                    <h3><SettingsIcon size={18} style={{ marginRight: 8 }} /> Menu Pengaturan</h3>
                    <ul className="settings-tile-list">
                        {/* <li className="settings-tile-item" onClick={() => navigate('/settings/mutation-sales')}><BarChart3 size={18}/> Mutasi Penjualan</li> */}
                        {/* <li className="settings-tile-item" onClick={() => navigate('/settings/mutation-inventory')}><Package size={18} /> Mutasi Inventaris</li> */}
                        <li className="settings-tile-item" onClick={() => navigate('/settings/mutation-logistic')}><Truck size={18} /> Mutasi Pengiriman</li>
                        {/* <li className="settings-tile-item" onClick={() => navigate('/settings/manage-account')}><UserCog size={18} /> Kelola Akun</li> */}
                        {/* <li className="settings-tile-item" onClick={() => navigate('/settings/activity')}><History size={18} /> Riwayat Aktivitas</li> */}
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