import { useContext } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import './Settings.css';
import { useToast } from "../../../context/ToastContext";
import React from "react";

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
            <div className="settings-logout">
                <button type="button" onClick={handleLogOut} className="button-logout">Log Out</button>
            </div>
        </div>
    );
}

export default Settings;