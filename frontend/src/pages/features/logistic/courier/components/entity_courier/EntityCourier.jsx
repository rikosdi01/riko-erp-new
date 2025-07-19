import { useEffect, useState } from 'react';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './EntityCourier.css';
import { HandPlatter, MapPin, Phone, Receipt, Scale, Ship, UserCog } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';
import { Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../../../../../context/AuthContext';
import ConfirmationModal from '../../../../../../components/modal/confirmation_modal/ConfirmationModal';
import CourierRepository from '../../../../../../repository/logistic/CourierRepository';
import AccessAlertModal from '../../../../../../components/modal/access_alert_modal/AccessAlertModal';
import roleAccess from '../../../../../../utils/helper/roleAccess';
import { useUsers } from '../../../../../../context/auth/UsersContext';

const EntityCourier = ({
    mode,
    initialData = {},
    onSubmit
}) => {
    console.log('Initial Data: ', initialData);
    const { showToast } = useToast();
                const { accessList } = useUsers();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);

    const [name, setName] = useState(initialData.name || "");
    const [phone, setPhone] = useState(initialData.phone || "");
    const [isActive, setIsActive] = useState(initialData.isActive ?? true);
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
        setPhone(initialData.phone || "");
        setIsActive(initialData.isActive ?? true);
        setCreatedAt(initialData.createdAt || Timestamp.now());
        setUserId(initialData.userId ?? currentUser?.uid ?? `guest-${Date.now()}`)
    }, [initialData]);

    const handleCourier = async (e) => { // Tambahkan 'e' di sini
        e.preventDefault();
        setLoading(true);

        let valid = true;

        if (!name.trim()) {
            setNameError('Nama Kurir tidak boleh kosong!');
            valid = false;
        }

        if (!valid) return setLoading(false);

        try {
            const courierData = {
                name: name.trim(),
                phone,
                isActive,
                createdAt: createdAt,
                updatedAt: Timestamp.now(),
                userId: userId,
            };

            console.log("Data Kurir: ", courierData);

            try {
                await onSubmit(courierData, handleReset); // Eksekusi yang berisiko error
            } catch (submitError) {
                console.error("Error during onSubmit: ", submitError);
                showToast("gagal", mode === "create" ? "Gagal menyimpan kurir!" : "Gagal memperbarui kurir!");
                return setLoading(false);
            }

            showToast("berhasil", mode === "create" ? "Kurir berhasil ditambahkan!" : "Kurir berhasil diperbarui!");
        } catch (error) {
            console.error('Terjadi kesalahan: ', error);
            showToast("gagal", mode === "create" ? "Gagal menyimpan kurir!" : "Gagal memperbarui kurir!");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = (e) => {
        setName("");
        setPhone('');
        setIsActive(true);
        setNameError("");
    }
    // handler delete
    const handleDeleteCourier = async () => {
        try {
            await CourierRepository.deleteCourier(initialData.id);
            showToast("berhasil", "Kurir berhasil dihapus!");
            navigate("/logistic/couriers");
        } catch (error) {
            console.error("Error deleting salesman: ", error);
            showToast("gagal", "Gagal menghapus Kurir!");
        }
    }

    return (
        <div className="main-container">
            <ContentHeader
                title={mode === "create" ? "Tambah Kurir" : "Rincian Kurir"}
            />

            <div className='add-container-input'>
                <InputLabel
                    label="Nama Kurir"
                    icon={<UserCog className='input-icon' />}
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                    }}
                />
            </div>

            <div className='add-container-input'>
                <InputLabel
                    label="No. Telpon"
                    icon={<Phone className='input-icon' size={20} />}
                    value={phone}
                    onChange={(e) => {
                        setPhone(e.target.value);
                    }}
                />
            </div>

            <div className='add-container-checkbox'>
                <input
                    type='checkbox'
                    id='active'
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                />

                <label htmlFor='active'>{`Status Karyawan: ${isActive ? 'Aktif' : 'Tidak Aktif'}`}</label>
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
                        onclick={handleCourier}
                    />
                </div>
            ) : (
                <div className='add-container-actions'>
                    <ActionButton
                        title={"Hapus"}
                        background="linear-gradient(to top right,rgb(241, 66, 66),rgb(245, 51, 51))"
                        color="white"
                        onclick={() => roleAccess(accessList, 'menghapus-data-kurir') ? setOpenDeleteModal(true) : handleRestricedAction()}
                    />

                    <ActionButton
                        title={loading ? "Memperbarui..." : "Perbarui"}
                        disabled={loading}
                        onclick={handleCourier}
                    />
                </div>
            )}

            {openDeleteModal && (
                <ConfirmationModal
                    isOpen={openDeleteModal}
                    onClose={() => setOpenDeleteModal(false)}
                    onClick={handleDeleteCourier}
                    title="Kurir"
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

export default EntityCourier;