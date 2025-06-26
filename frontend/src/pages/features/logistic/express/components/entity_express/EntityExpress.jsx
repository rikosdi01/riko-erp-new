import { useEffect, useState } from 'react';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './EntityExpress.css';
import { HandPlatter, MapPin, Phone, Receipt, Scale, Ship } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';
import { Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../../../../../context/AuthContext';
import ConfirmationModal from '../../../../../../components/modal/confirmation_modal/ConfirmationModal';
import Formatting from '../../../../../../utils/format/Formatting';
import ExpressRepository from '../../../../../../repository/logistic/ExpressRepository';

const EntityExpress = ({
    mode,
    initialData = {},
    onSubmit
}) => {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);

    const [name, setName] = useState(initialData.name || "");
    const [address, setAddress] = useState(initialData.address || "");
    const [phone, setPhone] = useState(initialData.phone || "");
    const [service, setService] = useState(initialData.service || '');
    const [price, setPrice] = useState(initialData.price || 0);
    const [set, setSet] = useState(initialData.set || '');
    const [nameError, setNameError] = useState("");
    const [createdAt, setCreatedAt] = useState(initialData.createdAt || Timestamp.now());
    const [userId, setUserId] = useState(
        initialData.userId ?? currentUser?.uid ?? `guest-${Date.now()}`
    );
    const [loading, setLoading] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    // UseEffect
    // Fetch Initial Data
    useEffect(() => {
        if (!initialData || Object.keys(initialData).length === 0) return;

        setName(initialData.name || "");
        setAddress(initialData.address || "");
        setPhone(initialData.phone || "");
        setService(initialData.service || "");
        setPrice(initialData.price || 0);
        setSet(initialData.set || "");
        setCreatedAt(initialData.createdAt || Timestamp.now());
        setUserId(initialData.userId ?? currentUser?.uid ?? `guest-${Date.now()}`)
    }, [initialData]);

    const handleExpress = async (e) => { // Tambahkan 'e' di sini
        e.preventDefault();
        setLoading(true);

        let valid = true;

        if (!name.trim()) {
            setNameError('Nama Pengangkutan tidak boleh kosong!');
            valid = false;
        }

        if (!valid) return setLoading(false);

        try {
            const expressData = {
                name: name.trim(),
                address,
                phone,
                service,
                price: parseInt(price.toString().replace(/[^0-9]/g, ""), 10) || 0,
                set,
                createdAt: createdAt,
                updatedAt: Timestamp.now(),
                userId: userId,
            };

            console.log("Data Express: ", expressData);

            try {
                await onSubmit(expressData, handleReset); // Eksekusi yang berisiko error
            } catch (submitError) {
                console.error("Error during onSubmit: ", submitError);
                showToast("gagal", mode === "create" ? "Gagal menyimpan pengangkutan!" : "Gagal memperbarui pengangkutan!");
                return setLoading(false);
            }

            showToast("berhasil", mode === "create" ? "Pengangkutan berhasil ditambahkan!" : "Pengangkutan berhasil diperbarui!");
        } catch (error) {
            console.error('Terjadi kesalahan: ', error);
            showToast("gagal", mode === "create" ? "Gagal menyimpan pengangkutan!" : "Gagal memperbarui pengangkutan!");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = (e) => {
        setName("");
        setAddress('');
        setPhone('');
        setService('');
        setPrice(0);
        setSet('');
        setNameError("");
    }
    // handler delete
    const hanldeDeleteExpress = async () => {
        try {
            await ExpressRepository.deleteExpress(initialData.id);
            showToast("berhasil", "Pengangkutan berhasil dihapus!");
            navigate("/sales/salesman");
        } catch (error) {
            console.error("Error deleting salesman: ", error);
            showToast("gagal", "Gagal menghapus Pengangkutan!");
        }
    }

    return (
        <div className="main-container">
            <ContentHeader
                title={mode === "create" ? "Tambah Pengangkutan" : "Rincian Pengangkutna"}
            />

            <div className='add-container-input'>
                <InputLabel
                    label="Nama Pengangkutan"
                    icon={<Ship className='input-icon' />}
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                    }}
                />
            </div>

            <div className='add-container-input'>
                <InputLabel
                    label="Alamat Pengangkutan"
                    icon={<MapPin className='input-icon' />}
                    value={address}
                    onChange={(e) => {
                        setAddress(e.target.value);
                    }}
                />
                <InputLabel
                    label="No. Telpon"
                    icon={<Phone className='input-icon' size={20} />}
                    value={phone}
                    onChange={(e) => {
                        setPhone(e.target.value);
                    }}
                />
            </div>

            <div className='add-container-input'>
                <InputLabel
                    label="Jasa"
                    icon={<HandPlatter className='input-icon' size={20} />}
                    value={service}
                    onChange={(e) => {
                        setService(e.target.value);
                    }}
                />
                <InputLabel
                    label="Harga"
                    icon={<Receipt className='input-icon' size={20} />}
                    value={price}
                    onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, "");
                        setPrice(rawValue ? Formatting.formatCurrencyIDR(parseInt(rawValue)) : "");
                    }}
                />
                <InputLabel
                    label="Satuan"
                    icon={<Scale className='input-icon' size={20} />}
                    value={set}
                    onChange={(e) => {
                        setSet(e.target.value);
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
                        onclick={handleExpress}
                    />
                </div>
            ) : (
                <div className='add-container-actions'>
                    <ActionButton
                        title={"Hapus"}
                        background="linear-gradient(to top right,rgb(241, 66, 66),rgb(245, 51, 51))"
                        color="white"
                        onclick={() => setOpenDeleteModal(true)}
                    />

                    <ActionButton
                        title={loading ? "Memperbarui..." : "Perbarui"}
                        disabled={loading}
                        onclick={handleExpress}
                    />
                </div>
            )}

            {openDeleteModal && (
                <ConfirmationModal
                    isOpen={openDeleteModal}
                    onClose={() => setOpenDeleteModal(false)}
                    onClick={hanldeDeleteExpress}
                    title="Express"
                    itemDelete={name}
                />
            )}
        </div>
    )
}

export default EntityExpress;