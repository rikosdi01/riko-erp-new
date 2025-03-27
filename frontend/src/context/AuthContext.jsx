import { createContext, useEffect, useReducer } from "react";
import AuthReducer from "./AuthReducer";

const INITIAL_STATE = {
    currentUser: JSON.parse(sessionStorage.getItem("currentUser")) || null,
};

// Buat context
export const AuthContext = createContext(INITIAL_STATE);

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

    // ✅ Fungsi untuk merefresh token dari backend
    const refreshAccessToken = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/refresh`, {
                method: "POST",
                credentials: "include",
            });
    
            if (response.status === 403) {
                console.warn("Tidak ada refresh token atau token tidak valid.");
                return; // ⬅️ Jangan logout, cukup biarkan user tetap dalam keadaan belum login
            }
    
            const data = await response.json();
            if (!response.ok) {
                console.error("Refresh token gagal:", data.message);
                return;
            }
    
            console.log("Token berhasil diperbarui:", data.accessToken);
            sessionStorage.setItem("accessToken", data.accessToken);
            dispatch({ type: "UPDATE_ACCESS_TOKEN", payload: data.accessToken });
    
        } catch (error) {
            console.error("Gagal memperbarui token:", error);
        }
    };
    
    // ✅ Perbaiki useEffect agar tidak logout otomatis saat pertama kali aplikasi dimuat
    useEffect(() => {
        const refreshTokenExists = document.cookie.includes("refreshToken");
        if (refreshTokenExists) {
            refreshAccessToken();
        }
    }, []);

    // ✅ Perbarui token setiap 10 menit jika user masih login
    useEffect(() => {
        const interval = setInterval(() => {
            if (state.currentUser) {
                refreshAccessToken();
            }
        }, 10 * 60 * 1000); // 10 menit

        return () => clearInterval(interval);
    }, [state.currentUser]);

    return (
        <AuthContext.Provider value={{ currentUser: state.currentUser, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};
