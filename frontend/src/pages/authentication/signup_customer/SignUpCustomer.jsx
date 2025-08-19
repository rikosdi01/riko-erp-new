import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { serverTimestamp, Timestamp } from "firebase/firestore";
import { auth } from "../../../firebase";
import UserRepository from "../../../repository/authentication/UserRepository";
import "./SignUpCustomer.css";

import { useToast } from "../../../context/ToastContext";
import InputGroup from "../../../components/input/input_group/InputGroup";
import { Eye, EyeOff, FlagTriangleRight, Hotel, LockKeyhole, Mail, MapPin, Phone, User } from "lucide-react";
import ImagePath from "../../../Utils/Constants/ImagePath";

const SignUpCustomer = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [showPassword, setShowPassword] = useState(false);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [province, setProvince] = useState('');
    const [usernameError, setUsernameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [addressError, setAddressError] = useState("");
    const [cityError, setCityError] = useState("");
    const [provinceError, setProvinceError] = useState("");

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const validateEmail = (email) => {
        return /\S+@\S+\.\S+/.test(email); // Validasi format email
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        let valid = true;

        // Validasi password
        if (!username.trim()) {
            setUsernameError("Username tidak boleh kosong.");
            valid = false;
        } else {
            setUsernameError("");
        }

        // Validasi email
        if (!email.trim()) {
            setEmailError("Email tidak boleh kosong.");
            valid = false;
        } else if (!validateEmail(email)) {
            setEmailError("Format email tidak valid.");
            valid = false;
        } else {
            setEmailError("");
        }

        // Validasi password
        if (!password.trim()) {
            setPasswordError("Password tidak boleh kosong.");
            valid = false;
        } else {
            setPasswordError("");
        }

        // Validasi phone
        if (!phone.trim()) {
            setPhoneError("Nomor telepon tidak boleh kosong.");
            valid = false;
        } else if (!/^\d{10,13}$/.test(phone.trim())) {
            setPhoneError("Nomor telepon harus terdiri dari 10–13 digit angka.");
            valid = false;
        } else {
            setPhoneError("");
        }

        // Validasi password
        if (!address.trim()) {
            setAddressError("Alamat tidak boleh kosong.");
            valid = false;
        } else {
            setAddressError("");
        }

        // Validasi password
        if (!city.trim()) {
            setCityError("Kota tidak boleh kosong.");
            valid = false;
        } else {
            setCityError("");
        }

        // Validasi password
        if (!province.trim()) {
            setProvinceError("Provinsi tidak boleh kosong.");
            valid = false;
        } else {
            setProvinceError("");
        }

        if (!valid) return;

        try {
            const hasFullAddress = address.trim() && city.trim() && province.trim();

            const addressData = hasFullAddress
                ? [{
                    address,
                    city,
                    province,
                }]
                : [];

            const selectedAddressData = hasFullAddress
                ? {
                    address,
                    city,
                    province,
                }
                : {};
            // 1. Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            console.log("User created:", user);

            // 2. Simpan ke koleksi "users"
            await UserRepository.createUser({
                uid: user.uid,
                email: email,
                username: username,
                role: "Customer",
                type: "customer",
                status: "active",
                canDebt: false,
                phone: phone,
                addresses: addressData,
                selectedAddress: selectedAddressData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
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
                    <div className="signin-title">Sign Up</div>
                    <div className="signin-subtitle">Daftar akun anda untuk mulai beberlanja</div>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <InputGroup
                                label={"Nama"}
                                icon={<User className="input-icon" />}
                                value={username}
                                handleChange={(e) => {
                                    setUsername(e.target.value);
                                    setUsernameError('');
                                }}
                                type={"text"}
                                name={"username"}
                                isRequired={false}
                            />
                            {usernameError && <div className="error-message">{usernameError}</div>}
                        </div>

                        <div className="input-group">
                            <InputGroup
                                label={"Email"}
                                icon={<Mail className="input-icon" />}
                                value={email}
                                handleChange={(e) => {
                                    setEmail(e.target.value);
                                    setEmailError('');
                                }}
                                type={"email"}
                                name={"email"}
                                isRequired={false}
                            />

                            {emailError && <div className="error-message">{emailError}</div>}
                        </div>

                        <div className="input-group">
                            <InputGroup
                                label={"Password"}
                                icon={<LockKeyhole className="input-icon" />}
                                value={password}
                                handleChange={(e) => {
                                    setPassword(e.target.value);
                                    setPasswordError('');
                                }}
                                type={showPassword ? "text" : "password"}
                                name={"password"}
                                leadingIcon={
                                    <span className="toggle-password" onClick={togglePasswordVisibility} style={{ cursor: "pointer" }}>
                                        {showPassword ? <Eye /> : <EyeOff />} {/* Bisa ganti jadi Eye/EyeOff */}
                                    </span>
                                }
                                isRequired={false}
                            />

                            {passwordError && <div className="error-message">{passwordError}</div>}
                        </div>

                        <div className="signup-customer-form-flex">
                            <div className="input-group">
                                <InputGroup
                                    label={"Nomor HP"}
                                    icon={<Phone className="input-icon" />}
                                    value={phone}
                                    handleChange={(e) => {
                                        const onlyNums = e.target.value.replace(/\D/g, ''); // buang semua selain angka
                                        setPhone(onlyNums);
                                        setPhoneError('');
                                    }}
                                    type={"text"}
                                    name={"phone"}
                                    isRequired={false}
                                />

                                {phoneError && <div className="error-message">{phoneError}</div>}
                            </div>

                            <div className="input-group">
                                <InputGroup
                                    label={"Alamat"}
                                    icon={<MapPin className="input-icon" />}
                                    value={address}
                                    handleChange={(e) => {
                                        setAddress(e.target.value);
                                        setAddressError('');
                                    }}
                                    type={"text"}
                                    name={"address"}
                                    isRequired={false}
                                />

                                {addressError && <div className="error-message">{addressError}</div>}
                            </div>
                        </div>

                        <div className="signup-customer-form-flex">
                            <div className="input-group">
                                <InputGroup
                                    label={"Kota"}
                                    icon={<Hotel className="input-icon" />}
                                    value={city}
                                    handleChange={(e) => {
                                        setCity(e.target.value);
                                        setCityError('');
                                    }}
                                    type={"text"}
                                    name={"city"}
                                    isRequired={false}
                                />

                                {cityError && <div className="error-message">{cityError}</div>}
                            </div>

                            <div className="input-group">
                                <InputGroup
                                    label={"Provinsi"}
                                    icon={<FlagTriangleRight className="input-icon" />}
                                    value={province}
                                    handleChange={(e) => {
                                        setProvince(e.target.value);
                                        setProvinceError('');
                                    }}
                                    type={"text"}
                                    name={"province"}
                                    isRequired={false}
                                />
                                {provinceError && <div className="error-message">{provinceError}</div>}
                            </div>
                        </div>

                        <button className="submit-button" type="submit">Sign Up</button>
                        <div className="signin-link" onClick={() => navigate('/signin')}>
                            Sudah memiliki akun? <span>Sign In</span> disini
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignUpCustomer;
