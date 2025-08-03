import { useEffect, useState } from 'react';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './EntityExpress.css';
import { Calendar1, CalendarCheck, HandPlatter, MapPin, Phone, Receipt, Scale, Ship } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';
import { Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../../../../../context/AuthContext';
import ConfirmationModal from '../../../../../../components/modal/confirmation_modal/ConfirmationModal';
import Formatting from '../../../../../../utils/format/Formatting';
import ExpressRepository from '../../../../../../repository/logistic/ExpressRepository';
import { useUsers } from '../../../../../../context/auth/UsersContext';
import AccessAlertModal from '../../../../../../components/modal/access_alert_modal/AccessAlertModal';
import roleAccess from '../../../../../../utils/helper/roleAccess';

const EntityExpress = ({
    mode,
    initialData = {},
    onSubmit
}) => {
    const { showToast } = useToast();
    const { accessList } = useUsers();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);

    const [name, setName] = useState(initialData.name || "");
    const [address, setAddress] = useState(initialData.address || "");
    const [phone, setPhone] = useState(initialData.phone || "");
    const [basePrice, setBasePrice] = useState(initialData.basePrice || '');
    const [itemPerPrice, setItemPerPrice] = useState(initialData.itemPerPrice || '');
    const [estimationStart, setEstimationStart] = useState(initialData.estimationStart || '');
    const [estimationEnd, setEstimationEnd] = useState(initialData.estimationEnd || '');
    const [nameError, setNameError] = useState("");
    const [createdAt, setCreatedAt] = useState(initialData.createdAt || Timestamp.now());
    const [userId, setUserId] = useState(
        initialData.userId ?? currentUser?.uid ?? `guest-${Date.now()}`
    );
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

        setName(initialData.name || "");
        setAddress(initialData.address || "");
        setPhone(initialData.phone || "");
        setBasePrice(initialData.basePrice || 0);
        setItemPerPrice(initialData.itemPerPrice || 0);
        setEstimationStart(initialData.estimationStart || 0);
        setEstimationEnd(initialData.estimationEnd || 0);
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
                basePrice,
                itemPerPrice,
                estimationStart,
                estimationEnd,
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
        setBasePrice('');
        setItemPerPrice('');
        setEstimationStart('');
        setEstimationEnd('');
        setNameError("");
    }
    // handler delete
    const hanldeDeleteExpress = async () => {
        try {
            await ExpressRepository.deleteExpress(initialData.id);
            showToast("berhasil", "Pengangkutan berhasil dihapus!");
            navigate("/logistic/express");
        } catch (error) {
            console.error("Error deleting express: ", error);
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
                    label="Nomor Telpon"
                    icon={<Phone className='input-icon' />}
                    value={phone}
                    onChange={(e) => {
                        setPhone(e.target.value);
                    }}
                />
            </div>

            <div className='add-container-input-attribute'>
                <InputLabel
                    label="Harga Dasar"
                    icon={<HandPlatter className='input-icon' size={20} />}
                    value={basePrice}
                    onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, "");
                        setBasePrice(rawValue ? Formatting.formatCurrencyIDR(parseInt(rawValue)) : "");
                    }}
                />
                <InputLabel
                    label="Harga Per Item"
                    icon={<Receipt className='input-icon' size={20} />}
                    value={itemPerPrice}
                    onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, "");
                        setItemPerPrice(rawValue ? Formatting.formatCurrencyIDR(parseInt(rawValue)) : "");
                    }}
                />
            </div>

            <div className='add-container-input-attribute'>
                <InputLabel
                type={'number'}
                    label="Estimasi Awal"
                    icon={<Calendar1 className='input-icon' />}
                    value={estimationStart}
                    onChange={(e) => {
                        setEstimationStart(e.target.value);
                    }}
                />
                <InputLabel
                type={'number'}
                    label="Estimasi Akhir"
                    icon={<CalendarCheck className='input-icon' size={20} />}
                    value={estimationEnd}
                    onChange={(e) => {
                        setEstimationEnd(e.target.value);
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
                        onclick={() => roleAccess(accessList, 'menghapus-data-pengangkutan') ? setOpenDeleteModal(true) : handleRestricedAction()}
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

            <AccessAlertModal
                isOpen={accessDenied}
                onClose={() => setAccessDenied(false)}
            />
        </div>
    )
}

export default EntityExpress;