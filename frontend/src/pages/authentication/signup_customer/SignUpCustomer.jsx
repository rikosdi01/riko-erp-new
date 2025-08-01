import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { auth } from "../../../firebase";
import UserRepository from "../../../repository/authentication/UserRepository";
import "./SignUpCustomer.css";

import { useToast } from "../../../context/ToastContext";
import InputGroup from "../../../components/input/input_group/InputGroup";
import { Eye, EyeOff, FlagTriangleRight, Hotel, LockKeyhole, Mail, MapPin, Phone, Store, UserCheck } from "lucide-react";
import ContentHeader from "../../../components/content_header/ContentHeader";
import { useUsers } from "../../../context/auth/UsersContext";
import Dropdown from "../../../components/select/Dropdown";
import { useSalesman } from "../../../context/sales/SalesmanContext";

const SignUpCustomer = () => {
    const navigate = useNavigate();
    const { loginUser } = useUsers();
    const { showToast } = useToast();
    const { salesman } = useSalesman();
    const [showPassword, setShowPassword] = useState(false);
    const [selectedSalesman, setSelectedSalesman] = useState(null);

    const [formData, setFormData] = useState({
        email: "",
        password: "Pelanggan123",
        name: "",
        phone: "",
        address: "",
        city: "",
        province: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // 1. Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            console.log("User created:", user);
            console.log("User data:", formData);

            // 2. Simpan ke koleksi "users"
            await UserRepository.createUser({
                uid: user.uid,
                email: formData.email,
                username: formData.name,
                role: "Customer",
                type: "customer",
                status: "active",
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                province: formData.province,
                salesman: selectedSalesman, // ⬅️ tambahkan ini
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });

            showToast("berhasil", "Berhasil membuat akun customer!");
            navigate("/settings/manage-account");
        } catch (error) {
            console.error("Error:", error.message);
            showToast("gagal", `Gagal daftar: ${error.message}`);
        }
    };

    return (
        <div className="signin-container">
            <div className="signin-customer-content">
                <form onSubmit={handleSubmit}>
                    <ContentHeader
                        title="Daftar Pelanggan"
                        enableBack={loginUser?.type !== 'customer'}
                    />

                    <InputGroup
                        label={"Email"}
                        icon={<Mail className="input-icon" />}
                        value={formData.email}
                        handleChange={handleChange}
                        type={"email"}
                        name={"email"}
                    />

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

                    <InputGroup
                        label={"Nama Toko"}
                        icon={<Store className="input-icon" />}
                        value={formData.name}
                        handleChange={handleChange}
                        type={"text"}
                        name={"name"}
                    />

                    <Dropdown
                        values={salesman}
                        selectedId={selectedSalesman}
                        setSelectedId={setSelectedSalesman}
                        label={"Pilih Sales"}
                        icon={<UserCheck className="input-icon" />}
                    />

                    <div className="signup-customer-form-flex">
                        <InputGroup
                            label={"Nomor HP"}
                            icon={<Phone className="input-icon" />}
                            value={formData.phone}
                            handleChange={handleChange}
                            type={"text"}
                            name={"phone"}
                            isRequired={false}
                        />

                        <InputGroup
                            label={"Alamat"}
                            icon={<MapPin className="input-icon" />}
                            value={formData.address}
                            handleChange={handleChange}
                            type={"text"}
                            name={"address"}
                            isRequired={false}
                        />
                    </div>

                    <div className="signup-customer-form-flex">
                        <InputGroup
                            label={"Kota"}
                            icon={<Hotel className="input-icon" />}
                            value={formData.city}
                            handleChange={handleChange}
                            type={"text"}
                            name={"city"}
                            isRequired={false}
                        />

                        <InputGroup
                            label={"Provinsi"}
                            icon={<FlagTriangleRight className="input-icon" />}
                            value={formData.province}
                            handleChange={handleChange}
                            type={"text"}
                            name={"province"}
                            isRequired={false}
                        />
                    </div>

                    <button className="submit-button" type="submit">Sign Up</button>
                </form>
            </div>
        </div>
    );
};

export default SignUpCustomer;
