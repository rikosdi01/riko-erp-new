import { useContext, useState, useEffect } from "react";
import ImagePath from "../../../Utils/Constants/ImagePath";
import "./SignIn.css";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { auth, signInWithEmailAndPassword } from "../../../firebase";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";  // Impor library js-cookie
import { AuthContext } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import React from "react";

const SignIn = () => {
    const { showToast } = useToast();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [rememberMe, setRememberMe] = useState(false); // State untuk checkbox Remember Me

    const navigate = useNavigate();
    const { dispatch } = useContext(AuthContext);

    useEffect(() => {
        // Mengecek apakah ada email yang tersimpan di cookies dan mengisinya ke form
        const savedEmail = Cookies.get("email");
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true); // Jika email ada di cookies, centang checkbox Remember Me
        }
    }, []);

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    const validateEmail = (email) => {
        return /\S+@\S+\.\S+/.test(email); // Validasi format email
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const accessToken = await user.getIdToken();
    
            // Kirim token ke backend untuk mendapatkan refresh token
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken: accessToken }),
                credentials: "include", // ⬅️ Simpan refreshToken di cookie
            });
    
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
    
            dispatch({
                type: "LOGIN",
                payload: {
                    uid: user.uid,
                    email: user.email,
                    accessToken: data.accessToken,
                },
            });
    
            navigate("/");
        } catch (error) {
            console.error("Login gagal:", error);
        }
    };

    return (
        <div className="signin-container">
            <div className="signin-content">
                <div className="signin-left">
                    <img src={ImagePath.logoRIKO} className="signin-image" alt="RIKO Parts Logo" />
                    <div className="signin-image-title">RIKO Motorcycle Parts</div>
                </div>

                <div className="signin-right">
                    <div className="signin-title">Sign In</div>
                    <div className="signin-subtitle">RIKO Parts Manajemen Stok</div>

                    <form onSubmit={handleSubmit}>
                        {/* Email Input */}
                        <div className="input-group">
                            <label>Email:</label>
                            <div className="input-wrapper">
                                <Mail className="input-icon" />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="signin-input"
                                    style={{ padding: "0.75rem 1rem 0.75rem 2.8rem" }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            {emailError && <div className="error-message">{emailError}</div>}
                        </div>

                        {/* Password Input */}
                        <div className="input-group">
                            <label>Password:</label>
                            <div className="input-wrapper">
                                <LockKeyhole className="input-icon" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className="signin-input"
                                    style={{ padding: "0.75rem 2.8rem" }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <span className="toggle-password" onClick={togglePassword}>
                                    {showPassword ? <EyeOff /> : <Eye />}
                                </span>
                            </div>
                            {passwordError && <div className="error-message">{passwordError}</div>}
                        </div>

                        {/* Checkbox Remember Me */}
                        <div className="signin-remember-me">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe} // Mengatur checkbox sesuai state rememberMe
                                onChange={(e) => setRememberMe(e.target.checked)} // Mengubah state saat checkbox berubah
                            />
                            <label htmlFor="rememberMe">Ingat Akun saya</label>
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className="signin-button">Sign In</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
