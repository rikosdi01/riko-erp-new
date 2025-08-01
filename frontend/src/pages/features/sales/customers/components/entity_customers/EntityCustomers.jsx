import { useContext, useEffect, useState } from 'react';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './EntityCustomers.css';
import { MapPin, PhoneCall, Store, Building2, LandPlot, UsersRound } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';
import { Timestamp } from 'firebase/firestore';
import { AuthContext } from '../../../../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CustomersRepository from '../../../../../../repository/sales/CustomersRepository';
import { useSalesman } from '../../../../../../context/sales/SalesmanContext';
import Dropdown from '../../../../../../components/select/Dropdown';
import ConfirmationModal from '../../../../../../components/modal/confirmation_modal/ConfirmationModal';
import AccessAlertModal from '../../../../../../components/modal/access_alert_modal/AccessAlertModal';
import roleAccess from '../../../../../../utils/helper/roleAccess';
import { useUsers } from '../../../../../../context/auth/UsersContext';

const EntityCustomers = ({
    mode,
    initialData = {},
    onSubmit
}) => {
    console.log('Initial Data: ', initialData);
    const { showToast } = useToast();
    const { accessList } = useUsers();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const { salesman } = useSalesman();

    const [name, setName] = useState(initialData.username || "");
    const [address, setAddress] = useState(initialData.address || "");
    const [phone, setPhone] = useState(initialData.phone || "");
    const [city, setCity] = useState(initialData.city || "");
    const [province, setProvince] = useState(initialData.province || "");
    const [salesmanId, setSalesmanId] = useState(initialData.salesman?.id || '');
    const [createdAt, setCreatedAt] = useState(initialData.createdAt || Timestamp.now());
    const [userId, setUserId] = useState(
        initialData.userId ?? currentUser?.uid ?? `guest-${Date.now()}`
    );
    const [codeError, setCodeError] = useState("");
    const [nameError, setNameError] = useState("");
    const [loading, setLoading] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const [accessDenied, setAccessDenied] = useState(false);

    const handleRestricedAction = () => {
        setAccessDenied(true);
    }

    // UseEffect
    // Fetch Initial Data
    useEffect(() => {
        if (!initialData || Object.keys(initialData).length === 0) return;

        setName(initialData.username || "");
        setAddress(initialData.address || "");
        setPhone(initialData.phone || "");
        setCity(initialData.city || "");
        setProvince(initialData.province || "");
        setSalesmanId(initialData.salesman?.id || '');
        setCreatedAt(initialData.createdAt || Timestamp.now());
        setUserId(initialData.userId ?? currentUser?.uid ?? `guest-${Date.now()}`)
    }, [initialData]);

    const handleCustomers = async (e) => { // Tambahkan 'e' di sini
        e.preventDefault();
        setLoading(true);

        let valid = true;

        if (!name.trim()) {
            setNameError('Nama Pelanggan tidak boleh kosong!');
            valid = false;
        }

        if (!valid) return setLoading(false);

        try {
            const selectedSalesman = salesman.find(s => s.id === salesmanId);

            const customersData = {
                name: name.trim(),
                address: address.trim(),
                phone: phone.trim(),
                city: city.trim(),
                province: province.trim(),
                salesman: selectedSalesman,
                createdAt: createdAt,
                updatedAt: Timestamp.now(),
                userId: userId,
            };

            console.log("Data Pelanggan: ", customersData);

            try {
                await onSubmit(customersData, handleReset); // Eksekusi yang berisiko error
            } catch (submitError) {
                console.error("Error during onSubmit: ", submitError);
                showToast("gagal", mode === "create" ? "Gagal menyimpan pelanggan!" : "Gagal memperbarui pelanggan!");
                return setLoading(false);
            }

            showToast("berhasil", mode === "create" ? "Pelanggan berhasil ditambahkan!" : "Pelanggan berhasil diperbarui!");
        } catch (error) {
            console.error('Terjadi kesalahan: ', error);
            showToast("gagal", mode === "create" ? "Gagal menyimpan pelanggan!" : "Gagal memperbarui pelanggan!");
        } finally {
            setLoading(false);
        }
    };



    const handleReset = (e) => {
        setName("");
        setAddress("");
        setPhone("");
        setCity("");
        setProvince("");
        setCodeError("");
        setNameError("");
    }

    // handler delete
    const handleDeleteCustomers = async () => {
        try {
            await CustomersRepository.deleteCustomer(initialData.id);
            showToast("berhasil", "Pelanggan berhasil dihapus!");
            navigate("/sales/customers");
        } catch (error) {
            console.error("Error deleting pelanggan: ", error);
            showToast("gagal", "Gagal menghapus Pelanggan!");
        }
    }

    return (
        <div className="main-container">
            <ContentHeader title={mode === "create" ? "Tambah Pelanggan" : "Rincian Pelanggan"} />

            <div className='add-container-input'>
                <div>
                    <InputLabel
                        label="Nama Pelanggan"
                        icon={<Store className='input-icon' />}
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                        }}
                    />
                    {nameError && <div className="error-message">{nameError}</div>}
                </div>

                <Dropdown
                    values={salesman}
                    selectedId={salesmanId}
                    setSelectedId={setSalesmanId}
                    label="Pilih Sales"
                    icon={<UsersRound className="input-icon" />}
                />
            </div>

            <div className='add-container-input'>
                <InputLabel
                    label="Alamat"
                    icon={<MapPin className='input-icon' />}
                    value={address}
                    onChange={(e) => {
                        setAddress(e.target.value);
                    }}
                />

                <InputLabel
                    label="No. Telpon"
                    icon={<PhoneCall className='input-icon' />}
                    value={phone}
                    onChange={(e) => {
                        setPhone(e.target.value);
                    }}
                />
            </div>
            <div className='add-container-input-attribute'>
                <InputLabel
                    label="Kota"
                    icon={<Building2 className='input-icon' />}
                    value={city}
                    onChange={(e) => {
                        setCity(e.target.value);
                    }}
                />
                <InputLabel
                    label="Provinsi"
                    icon={<LandPlot className='input-icon' />}
                    value={province}
                    onChange={(e) => {
                        setProvince(e.target.value);
                    }}
                />
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
                        onclick={handleCustomers}
                    />
                </div>
            ) : (
                <div className='add-container-actions'>
                    <ActionButton
                        title={"Hapus"}
                        background="linear-gradient(to top right,rgb(241, 66, 66),rgb(245, 51, 51))"
                        color="white"
                        onclick={() => roleAccess(accessList, 'menghapus-data-pelanggan') ? setOpenDeleteModal(true) : handleRestricedAction()}
                    />

                    <ActionButton
                        title={loading ? "Memperbarui..." : "Perbarui"}
                        disabled={loading}
                        onclick={handleCustomers}
                    />
                </div>
            )}

            {openDeleteModal && (
                <ConfirmationModal
                    isOpen={openDeleteModal}
                    onClose={() => setOpenDeleteModal(false)}
                    onClick={handleDeleteCustomers}
                    title="Pelanggan"
                    itemDelete={name}
                />
            )}

            <AccessAlertModal
                isOpen={accessDenied}
                onClose={() => setAccessDenied(false)}
            />
        </div>
    )
}

export default EntityCustomers;