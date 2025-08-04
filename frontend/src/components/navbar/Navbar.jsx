import Cookies from "js-cookie";
import './Navbar.css'
import { useUsers } from '../../context/auth/UsersContext';
import { LogOut } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import ActionButton from "../button/actionbutton/ActionButton";
import UserRepository from "../../repository/authentication/UserRepository";
import { serverTimestamp } from "firebase/firestore";

const getInitials = (name) => {
    if (!name) return 'U';
    const words = name.split(' ');
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
};

const Navbar = () => {
    const { dispatch } = useContext(AuthContext);
    const { loginUser, logout } = useUsers(); // pastikan ada logout
    const initials = getInitials(loginUser?.username);
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [editedUser, setEditedUser] = useState(loginUser);


    console.log('Login User:', loginUser);

    const handleLogOut = () => {
        // Dispatch action "LOGOUT" untuk memperbarui state currentUser ke null
        dispatch({ type: "LOGOUT" });

        // Menghapus cookie "user"
        Cookies.remove("user");

        // Navigasi ke halaman login atau halaman lain setelah logout

        showToast("berhasil", "Berhasil Log Out!");
        navigate("/signin");  // Ganti dengan route yang sesuai
    }

    const handleSaveProfile = async () => {
        try {
            await UserRepository.updateUserData(editedUser.id, {
                username: editedUser.username,
                phone: editedUser.phone,
                address: editedUser.address,
                updatedAt: serverTimestamp(),
            });

            showToast("berhasil", "Profil berhasil diperbarui!");
            setShowProfileModal(false);
        } catch (e) {
            console.error("Gagal update profil:", e);
            showToast("gagal", "Gagal menyimpan perubahan.");
        }
    };


    return (
        <>
            <div className='navbar-container'>
                <div className="navbar-user-info">
                    <div
                        style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center',
                            // cursor: 'pointer',
                        }}
                        // onClick={() => {
                        //     if (loginUser?.role === 'Customer') {
                        //         setEditedUser(loginUser); // Reset nilai
                        //         setShowProfileModal(true);
                        //     } else {
                        //         navigate('/settings');
                        //     }
                        // }}
                    >
                        <div className="circle-avatar">{initials}</div>
                        <div className="user-details">
                            <div className="username">{loginUser?.username || 'User'}</div>
                            <div className="email">{loginUser?.email || '-'}</div>
                        </div>
                    </div>
                    <button className="logout-button" onClick={handleLogOut}>
                        <LogOut size={16} /> Keluar
                    </button>
                </div>
            </div>



            {/* {showProfileModal && (
                <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Edit Profil</h3>
                        <div className="form-group">
                            <label>Nama</label>
                            <input
                                type="text"
                                value={editedUser.username}
                                onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Telepon</label>
                            <input
                                type="text"
                                value={editedUser.phone}
                                onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Alamat</label>
                            <textarea
                                value={editedUser.address}
                                onChange={(e) => setEditedUser({ ...editedUser, address: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Kota</label>
                            <input
                                type="text"
                                value={editedUser.city}
                                onChange={(e) => setEditedUser({ ...editedUser, city: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Provinsi</label>
                            <input
                                type="text"
                                value={editedUser.province}
                                onChange={(e) => setEditedUser({ ...editedUser, province: e.target.value })}
                            />
                        </div>

                        <div className="modal-buttons">
                            <ActionButton
                                title={'Batal'}
                                background={'red'}
                                onclick={() => setShowProfileModal(false)}
                            />
                            <ActionButton
                                title={'Simpan'}
                                onclick={handleSaveProfile}
                            />
                        </div>
                    </div>
                </div>
            )} */}
        </>
    );
};

export default Navbar;