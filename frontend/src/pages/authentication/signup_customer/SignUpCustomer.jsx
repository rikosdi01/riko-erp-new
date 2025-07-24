import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { serverTimestamp } from "firebase/firestore";
import { auth } from "../../../firebase";
import UserRepository from "../../../repository/authentication/UserRepository";

import CustomersRepository from "../../../repository/sales/CustomersRepository";
import { useToast } from "../../../context/ToastContext";

const SignUpCustomer = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        username: "",
        name: "",
        phone: "",
        address: "",
        city: "",
        province: "",
        code: "",
        salesmanId: "",
        salesmanName: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // 1. Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // 2. Simpan ke koleksi "users"
            await UserRepository.createUser({
                uid: user.uid,
                email: formData.email,
                username: formData.username,
                role: "Customer",
                type: "customer",
                status: "active",
                createdAt: serverTimestamp(),
            });

            // 3. Simpan ke koleksi "customers"
            await CustomersRepository.createCustomers({
                userId: user.uid,
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                province: formData.province,
                code: formData.code,
                salesman: {
                    id: formData.salesmanId,
                    name: formData.salesmanName,
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            showToast("success", "Berhasil membuat akun customer!");
            navigate("/dashboard");
        } catch (error) {
            console.error("Error:", error.message);
            showToast("error", `Gagal daftar: ${error.message}`);
        }
    };

    return (
        <form className="signup-customer-form" onSubmit={handleSubmit}>
            <h2 className="form-title">Sign Up Customer</h2>

            <div className="">
            <div className="form-group">
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    className="form-group-input"
                    required
                />
            </div>

            <div className="form-group">
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-group-input"
                    required
                />
            </div>
            </div>

            <div className="form-group">
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-group-input"
                    required
                />
            </div>

            <div className="form-group">
                <input
                    type="text"
                    name="name"
                    placeholder="Nama Toko"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-group-input"
                    required
                />
            </div>

            <div className="form-group">
                <input
                    type="text"
                    name="phone"
                    placeholder="Nomor HP"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-group-input"
                    required
                />
            </div>

            <div className="form-group">
                <input type="text"
                    name="address"
                    placeholder="Alamat"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-group-input"
                    required
                />
            </div>

            <div className="form-group">
                <input
                    type="text"
                    name="city"
                    placeholder="Kota"
                    value={formData.city}
                    onChange={handleChange}
                    className="form-group-input"
                    required
                />
            </div>

            <div className="form-group">
                <input
                    type="text"
                    name="province"
                    placeholder="Provinsi"
                    value={formData.province}
                    onChange={handleChange}
                    className="form-group-input"
                    required
                />
            </div>

            <div className="form-group">
                <input
                    type="text"
                    name="code"
                    placeholder="Kode Toko"
                    value={formData.code}
                    onChange={handleChange}
                    className="form-group-input"
                    required
                />
            </div>

            <button className="submit-button" type="submit">Sign Up Customer</button>
        </form>
    );
};

export default SignUpCustomer;
