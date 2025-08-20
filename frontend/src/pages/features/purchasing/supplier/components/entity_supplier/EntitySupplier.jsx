import { useContext, useEffect, useState } from 'react';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './EntitySupplier.css';
import { PackagePlus, KeyRound, Mail, User, Phone, Hotel, FlagTriangleRight, Flag } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';
import { Timestamp } from 'firebase/firestore';
import ConfirmationModal from '../../../../../../components/modal/confirmation_modal/ConfirmationModal';
import MerksRepository from '../../../../../../repository/warehouse/MerksRepository';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../../../../context/AuthContext';
import AccessAlertModal from '../../../../../../components/modal/access_alert_modal/AccessAlertModal';
import roleAccess from '../../../../../../utils/helper/roleAccess';
import { useUsers } from '../../../../../../context/auth/UsersContext';
import SupplierRepository from '../../../../../../repository/purchasing/SupplierRepository';

const EntitySupplier = ({
    mode,
    initialData = {},
    onSubmit
}) => {
    console.log('Initial Data Supplier: ', initialData);
    // Context
    const { accessList } = useUsers();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);


    // ================================================================================


    // Variabels
    const [name, setName] = useState(initialData.name || "");
    const [email, setEmail] = useState(initialData.email || "");
    const [phone, setPhone] = useState(initialData.phone || "");
    const [city, setCity] = useState(initialData.city || "");
    const [province, setProvince] = useState(initialData.province || "");
    const [state, setState] = useState(initialData.state || "");
    const [createdAt, setCreatedAt] = useState(initialData.createdAt || Timestamp.now());
    const [isActive, setIsActive] = useState(initialData.isActive ?? true);

    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [loading, setLoading] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);


    // ================================================================================


    // UseEffect
    // Fetch Initial Data
    useEffect(() => {
        if (!initialData || Object.keys(initialData).length === 0) return;

        setName(initialData.name || "");
        setEmail(initialData.email || '');
        setPhone(initialData.phone || '');
        setCity(initialData.city || '');
        setProvince(initialData.province || '');
        setState(initialData.state || '');
        setIsActive(initialData.isActive ?? true);
        setCreatedAt(initialData.createdAt || Timestamp.now());
    }, [initialData]);


    // ================================================================================


    // Logic
    const handleSupplier = async (e) => { // Tambahkan 'e' di sini
        e.preventDefault();
        setLoading(true);

        let valid = true;

        if (!name.trim()) {
            setNameError('Nama Supplier tidak boleh kosong!');
            valid = false;
        }

        if (!email.trim()) {
            setEmailError('Email Supplier tidak boleh kosong!');
            valid = false;
        }

        if (!valid) return setLoading(false);

        try {
            const exists = await SupplierRepository.checkSupplierExists(
                name.trim(),
                email.trim(),
                mode === "detail" ? initialData.id : null
            );

            if (exists) {
                showToast("gagal", "Supplier sudah ada!");
                return setLoading(false);
            }

            const supplierData = {
                name: name.trim(),
                email: email.trim(),
                phone,
                city,
                province,
                state,
                isActive,
                createdAt: createdAt,
                updatedAt: Timestamp.now(),
            };

            try {
                await onSubmit(supplierData, handleReset); // Eksekusi yang berisiko error
            } catch (submitError) {
                console.error("Error during onSubmit: ", submitError);
                showToast("gagal", mode === "create" ? "Gagal menyimpan supplier!" : "Gagal memperbarui merek!");
                return setLoading(false);
            }

            showToast("berhasil", mode === "create" ? "Supplier berhasil ditambahkan!" : "Supplier berhasil diperbarui!");
        } catch (error) {
            console.error('Terjadi kesalahan: ', error);
            showToast("gagal", mode === "create" ? "Gagal menyimpan supplier!" : "Gagal memperbarui supplier!");
        } finally {
            setLoading(false);
        }
    };


    const handleNameChange = (e) => {
        setName(e.target.value);
        if (e.target.value.trim()) setNameError("");
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (e.target.value.trim()) setEmailError("");
    };

    const handleReset = (e) => {
        setName("");
        setEmail('');
        setPhone('');
        setCity('');
        setProvince('');
        setState('');
        setNameError('');
        setEmailError('');
    }

    // handler delete
    const handleDeleteSupplier = async () => {
        try {
            await SupplierRepository.deleteSupplier(initialData.id);
            showToast("berhasil", "Supplier berhasil dihapus!");
            navigate("/purchase/supplier");
        } catch (error) {
            console.error("Error deleting merk: ", error);
            showToast("gagal", "Gagal menghapus Supplier!");
        }
    }

    const handleRestricedAction = () => {
        setAccessDenied(true);
    }

    return (
        <div className="main-container">
            <ContentHeader title={mode === "create" ? "Tambah Supplier" : "Rincian Supplier"} />

            <div className='add-container-input'>
                <InputLabel
                    label="Nama Supplier"
                    icon={<User className='input-icon' size={20} />}
                    value={name}
                    onChange={handleNameChange}
                />
                {nameError && <div className="error-message">{nameError}</div>}
            </div>

            <div className='add-container-input'>
                <div>
                    <InputLabel
                        label="Email Supplier"
                        icon={<Mail className='input-icon' size={20} />}
                        value={email}
                        onChange={handleEmailChange}
                    />
                    {emailError && <div className="error-message">{emailError}</div>}
                </div>

                <InputLabel
                    label="No. Telpon"
                    icon={<Phone className='input-icon' size={20} />}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
            </div>

            <div className='add-container-input-attribute'>
                <InputLabel
                    label="Kota"
                    icon={<Hotel className='input-icon' size={20} />}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                />

                <InputLabel
                    label="Provinsi"
                    icon={<FlagTriangleRight className='input-icon' size={20} />}
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                />

                <InputLabel
                    label="Negara"
                    icon={<Flag className='input-icon' size={20} />}
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                />
            </div>

                <div className="switch-container">
                    <label className="switch-label">
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                        />
                        <span className="slider"></span>
                    </label>
                    <span className="switch-text">Item {isActive ? 'Aktif' : 'Tidak Aktif'}</span>
                </div>

            {mode === "create" ? (
                <div className='add-container-actions'>
                    <ActionButton
                        title={"Reset"}
                        background="linear-gradient(to top right,rgb(241, 66, 66),rgb(245, 51, 51))"
                        color="white"
                        onclick={handleReset}
                    />

                    <ActionButton
                        title={loading ? "Menyimpan..." : "Simpan"}
                        disabled={loading}
                        onclick={handleSupplier}
                    />
                </div>
            ) : (
                <div className='add-container-actions'>
                    <ActionButton
                        title={"Hapus"}
                        background="linear-gradient(to top right,rgb(241, 66, 66),rgb(245, 51, 51))"
                        color="white"
                        onclick={() => roleAccess(accessList, 'menghapus-data-supplier') ? setOpenDeleteModal(true) : handleRestricedAction()}
                    />

                    <ActionButton
                        title={loading ? "Memperbarui..." : "Perbarui"}
                        disabled={loading}
                        onclick={handleSupplier}
                    />
                </div>
            )}

            {openDeleteModal && (
                <ConfirmationModal
                    isOpen={openDeleteModal}
                    onClose={() => setOpenDeleteModal(false)}
                    onClick={handleDeleteSupplier}
                    title="Merek"
                    itemDelete={name}
                />
            )}

            <AccessAlertModal
                isOpen={accessDenied}
                onClose={() => setAccessDenied(false)}
            />
        </div >
    )
}

export default EntitySupplier;