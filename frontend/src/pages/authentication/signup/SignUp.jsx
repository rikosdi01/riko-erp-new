import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import ContentHeader from "../../../components/content_header/ContentHeader";
import ImagePath from "../../../Utils/Constants/ImagePath";
import "./SignUp.css";
import { Eye, EyeOff, LockKeyhole, Mail, User } from "lucide-react";
import { auth, db } from "../../../firebase";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../context/ToastContext";
import UserRepository from "../../../repository/authentication/UserRepository";
import InputGroup from "../../../components/input/input_group/InputGroup";
import { useRoles } from "../../../context/auth/RolesContext";

const SignUp = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "",
        location: "",
    });
    const { roles } = useRoles();
    console.log("Roles: ", roles);

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
                role: formData.role,
                location: formData.location,
                type: "internal", // Atau "customer" sesuai kebutuhan
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                status: "active", // Atau sesuai logika bisnis
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
                        <InputGroup
                            label={"Username"}
                            icon={<User className="input-icon" />}
                            value={formData.username}
                            handleChange={handleChange}
                            type={"text"}
                            name={"username"}
                        />

                        <InputGroup
                            label={"Email"}
                            icon={<Mail className="input-icon" />}
                            value={formData.email}
                            handleChange={handleChange}
                            type={"email"}
                            name={"email"}
                        />

                        {/* Password */}
                        <InputGroup
                            label={"Password"}
                            icon={<LockKeyhole className="input-icon" />}
                            value={formData.password}
                            handleChange={handleChange}
                            type={showPassword ? "text" : "password"}
                            name={"password"}
                            leadingIcon={
                                <span className="toggle-password" onClick={togglePasswordVisibility} style={{ cursor: "pointer" }}>
                                    {showPassword ? <Eye /> : <EyeOff />} {/* Bisa ganti jadi Eye/EyeOff */}
                                </span>}
                        />
                        {/* Role */}
                        <div className="input-group">
                            <label>Lokasi Pengguna:</label>
                            <div className="input-wrapper">
                                <select
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="signin-input"
                                    style={{ padding: "0.75rem 1rem" }}
                                    required
                                >
                                    <option value="">Pilih Lokasi</option>
                                    <option value="medan">Medan</option>
                                    <option value="jakarta">Jakarta</option>
                                </select>
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
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.name}>
                                            {role.name}
                                        </option>
                                    ))}
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
