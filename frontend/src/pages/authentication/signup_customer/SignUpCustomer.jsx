import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { auth } from "../../../firebase";
import UserRepository from "../../../repository/authentication/UserRepository";
import "./SignUpCustomer.css";

import { useToast } from "../../../context/ToastContext";
import InputGroup from "../../../components/input/input_group/InputGroup";
import { Eye, EyeOff, FlagTriangleRight, Hotel, LockKeyhole, Mail, MapPin, Phone, Store, User, UserCheck } from "lucide-react";
import ContentHeader from "../../../components/content_header/ContentHeader";
import { useUsers } from "../../../context/auth/UsersContext";
import Dropdown from "../../../components/select/Dropdown";
import { useSalesman } from "../../../context/sales/SalesmanContext";
import ImagePath from "../../../Utils/Constants/ImagePath";

const SignUpCustomer = () => {
    const navigate = useNavigate();
    const { loginUser } = useUsers();
    const { showToast } = useToast();
    const { salesman } = useSalesman();
    const [showPassword, setShowPassword] = useState(false);
    const [selectedSalesman, setSelectedSalesman] = useState(null);

    useEffect(() => {
        console.log('Salesman: ', selectedSalesman);
    }, [selectedSalesman])

    const [formData, setFormData] = useState({
        email: "",
        password: "Pelanggan123",
        username: "",
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
            const selectedSalesmanData = salesman.find(s => s.id === selectedSalesman);

            // 1. Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            console.log("User created:", user);
            console.log("User data:", formData);

            // 2. Simpan ke koleksi "users"
            await UserRepository.createUser({
                uid: user.uid,
                email: formData.email,
                username: formData.username,
                role: "Customer",
                type: "customer",
                status: "active",
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                province: formData.province,
                salesman: selectedSalesmanData
                    ? { id: selectedSalesmanData.id, name: selectedSalesmanData.name }
                    : null, createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });

            showToast("berhasil", "Berhasil membuat akun customer!");
            navigate("/sales/customers");
        } catch (error) {
            console.error("Error:", error.message);
            showToast("gagal", `Gagal daftar: ${error.message}`);
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
                    <form onSubmit={handleSubmit}>
                        <ContentHeader
                            title="Daftar Pelanggan"
                            enableBack={loginUser && loginUser?.type !== 'customer'}
                        />

                        <InputGroup
                            label={"Nama"}
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

                        {loginUser && loginUser?.type !== 'customer' && (
                            <Dropdown
                                values={salesman}
                                selectedId={selectedSalesman}
                                setSelectedId={setSelectedSalesman}
                                label={"Pilih Sales"}
                                icon={<UserCheck className="input-icon" />}
                            />
                        )}

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
        </div>
    );
};

export default SignUpCustomer;
