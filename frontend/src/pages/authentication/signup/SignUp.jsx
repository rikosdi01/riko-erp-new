import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import ContentHeader from "../../../components/content_header/ContentHeader";
import ImagePath from "../../../Utils/Constants/ImagePath";
import "./SignUp.css";
import { Eye, EyeOff, LockKeyhole, Mail, User } from "lucide-react";
import { auth, db } from "../../../firebase";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../context/ToastContext";
import UserRepository from "../../../repository/authentication/UserRepository";

const SignUp = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 1. Buat user di Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // 2. Simpan data tambahan ke Firestore
            await UserRepository.createUser({
                uid: user.uid,
                username: formData.username,
                email: formData.email,
                role: formData.role
            });


            showToast("success", "Berhasil Sign Up!");
            navigate(-1); // Navigasi ke halaman Sign In setelah berhasil sign up
            setFormData({ username: "", email: "", password: "", role: "" });
        } catch (error) {
            console.error("Error during sign up: ", error.message);
            alert("Gagal sign up: " + error.message);
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
                    <ContentHeader title={"Sign Up"} />
                    <div className="signin-subtitle">RIKO Parts Manajemen Stok</div>

                    <form onSubmit={handleSubmit}>
                        {/* Username */}
                        <div className="input-group">
                            <label>Username:</label>
                            <div className="input-wrapper">
                                <User className="input-icon" />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Username"
                                    className="signin-input"
                                    style={{ padding: "0.75rem 2.8rem" }}
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="input-group">
                            <label>Email:</label>
                            <div className="input-wrapper">
                                <Mail className="input-icon" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email"
                                    className="signin-input"
                                    style={{ padding: "0.75rem 2.8rem" }}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        {/* Password */}
                        <div className="input-group">
                            <label>Password:</label>
                            <div className="input-wrapper">
                                <LockKeyhole className="input-icon" />
                                <input
                                    type={showPassword ? "text" : "password"} // ⬅️ Toggle logic here
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    className="signin-input"
                                    style={{ padding: "0.75rem 2.8rem" }}
                                    required
                                />
                                <span className="toggle-password" onClick={togglePasswordVisibility} style={{ cursor: "pointer" }}>
                                    {showPassword ? <Eye /> : <EyeOff />} {/* Bisa ganti jadi Eye/EyeOff */}
                                </span>
                            </div>
                        </div>


                        {/* Role */}
                        <div className="input-group">
                            <label>Role:</label>
                            <div className="input-wrapper">
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="signin-input"
                                    style={{ padding: "0.75rem 1rem" }}
                                    required
                                >
                                    <option value="">Pilih Role</option>
                                    <option value="Admin">Admin</option>
                                    <option value="CSO">CSO</option>
                                    <option value="Stok Controller">Stok Controller</option>
                                    <option value="Logistic">Logistic</option>
                                </select>
                            </div>
                        </div>

                        {/* Submit */}
                        <button type="submit" className="signin-button">Sign Up</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
