import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import './Settings.css';
import { useToast } from "../../../context/ToastContext";
import {
    User,
    Edit,
    UserCog,
    UserCheck
} from "lucide-react";
import { useUsers } from "../../../context/auth/UsersContext";
import { useContext, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import FormatSettings from "./children/format_settings/FormatSettings";
import ManageAccount from "./children/manage_account/ManageAccount";
import ManageRoles from "./children/manage_account/manage_roles/ManageRoles";
import roleAccess from "../../../utils/helper/roleAccess";

const Settings = () => {
    const { dispatch } = useContext(AuthContext);
    const { loginUser, accessList, isLoading } = useUsers();
    const { showToast } = useToast();
    const navigate = useNavigate();

    console.log('Access List: ', accessList);

    console.log('Access Status: ', roleAccess(accessList, 'melihat-pengelolaan-akun'));
    console.log('Access Status: ', roleAccess(accessList, 'mengelola-akses-data'));
    console.log('Access Status: ', roleAccess(accessList, 'melihat-format-sistem'));

    // canAdd={roleAccess(accessList, 'menambah-data-pemindahan-stok')}


    // State untuk mengelola tab yang aktif
    const [activeTab, setActiveTab] = useState('profile');

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!loginUser) {
        return <div>User tidak ditemukan atau belum login.</div>;
    }

    const handleLogOut = () => {
        dispatch({ type: "LOGOUT" });
        Cookies.remove("user");
        showToast("success", "Berhasil Log Out!");
        navigate("/signin");
    }

    return (
        <div className="main-container">
            <div className="settings-panel">
                <h2 className="settings-title">Pengaturan</h2>

                <div className="settings-tabs">
                    <div className="tab-header">
                        <div
                            className={`tab-item ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <User size={18} /> Profile
                        </div>
                        {roleAccess(accessList, 'melihat-format-sistem') && (
                            <div
                                className={`tab-item ${activeTab === 'formatting' ? 'active' : ''}`}
                                onClick={() => setActiveTab('formatting')}
                            >
                                <Edit size={18} /> Format
                            </div>
                        )}
                        {roleAccess(accessList, 'melihat-pengelolaan-akun') && (
                            <div
                                className={`tab-item ${activeTab === 'manage-account' ? 'active' : ''}`}
                                onClick={() => setActiveTab('manage-account')}
                            >
                                <UserCog size={18} /> Kelola Akun
                            </div>
                        )}
                        {roleAccess(accessList, 'mengelola-akses-data') && (
                            <div
                                className={`tab-item ${activeTab === 'manage-roles' ? 'active' : ''}`}
                                onClick={() => setActiveTab('manage-roles')}
                            >
                                <UserCheck size={18} /> Kelola Akses Data
                            </div>
                        )}
                    </div>

                    <div className="tab-content">
                        {activeTab === 'profile' && (
                            <>
                                <section className="profile-section">
                                    <h3>Informasi Profil</h3>
                                    <div className="profile-card">
                                        <p><strong>Nama: </strong> {loginUser.username}</p>
                                        <p><strong>Email: </strong> {loginUser.email}</p>
                                        <p><strong>Role: </strong> {loginUser.role}</p>
                                        {loginUser.location && (<p><strong>Lokasi: </strong> {loginUser.location.charAt(0).toUpperCase() + loginUser?.location.slice(1)}</p>)}
                                    </div>
                                </section>

                                <div className="settings-logout">
                                    <button onClick={handleLogOut} className="button-logout">🚪 Keluar</button>
                                </div>
                                {/* {loginUser.role === 'Admin' && (
                                    <section className="password-section">
                                        <h3>Ganti Password</h3>
                                        <input type="password" placeholder="Password Saat Ini" />
                                        <input type="password" placeholder="Password Baru" />
                                        <input type="password" placeholder="Konfirmasi Password Baru" />
                                        <button className="button-save">Simpan Perubahan</button>
                                    </section>
                                )} */}
                            </>
                        )}
                        {activeTab === 'formatting' && (
                            <FormatSettings />
                        )}
                        {activeTab === 'manage-account' && (
                            <ManageAccount />
                        )}
                        {activeTab === 'manage-roles' && (
                            <ManageRoles />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;