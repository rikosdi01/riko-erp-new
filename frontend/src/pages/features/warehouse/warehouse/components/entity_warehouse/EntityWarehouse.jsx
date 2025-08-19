import { useContext, useEffect, useState } from 'react';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './EntityWarehouse.css';
import { PackagePlus, ListEnd } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';
import { Timestamp } from 'firebase/firestore';
import ConfirmationModal from '../../../../../../components/modal/confirmation_modal/ConfirmationModal';
import MerksRepository from '../../../../../../repository/warehouse/MerksRepository';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../../../../context/AuthContext';
import AccessAlertModal from '../../../../../../components/modal/access_alert_modal/AccessAlertModal';
import roleAccess from '../../../../../../utils/helper/roleAccess';
import { useUsers } from '../../../../../../context/auth/UsersContext';
import RackWarehouseRepository from '../../../../../../repository/warehouse/RackWarehouseRepository';

const EntityWarehouse = ({
    mode,
    initialData = {},
    onSubmit
}) => {
    // Context
    const { loginUser, accessList } = useUsers();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);


    // ================================================================================


    // Variabels
    const [name, setName] = useState(initialData.name || "");
    const [description, setDescription] = useState(initialData.description || "");
    const [createdAt, setCreatedAt] = useState(initialData.createdAt || Timestamp.now());
    const [userId, setUserId] = useState(
        initialData.userId ?? currentUser?.uid ?? `guest-${Date.now()}`
    );
    const [nameError, setNameError] = useState("");
    const [loading, setLoading] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);


    // ================================================================================


    // UseEffect
    // Fetch Initial Data
    useEffect(() => {
        if (!initialData || Object.keys(initialData).length === 0) return;

        setName(initialData.name || "");
        setDescription(initialData.description || "");
        setCreatedAt(initialData.createdAt || Timestamp.now());
        setUserId(initialData.userId ?? currentUser?.uid ?? `guest-${Date.now()}`)
    }, [initialData]);


    // ================================================================================


    // Logic
    const handleMerks = async (e) => { // Tambahkan 'e' di sini
        e.preventDefault();
        setLoading(true);

        let valid = true;

        if (!name.trim()) {
            setNameError('Nama Gudang tidak boleh kosong!');
            valid = false;
        }

        if (!valid) return setLoading(false);

        try {
            const exists = await RackWarehouseRepository.checkExistsRackName(
                name.trim(),
                loginUser?.location,
                mode === "detail" ? initialData.id : null
            );

            if (exists) {
                showToast("gagal", "Nama Gudang sudah digunakan!");
                return setLoading(false);
            }

            const rackData = {
                name: name.trim(),
                description: description.trim(),
                location: loginUser?.location,
                createdAt: createdAt,
                updatedAt: Timestamp.now(),
            };

            console.log('Rack Data: ', rackData);

            try {
                await onSubmit(rackData, handleReset); // Eksekusi yang berisiko error
            } catch (submitError) {
                console.error("Error during onSubmit: ", submitError);
                showToast("gagal", mode === "create" ? "Gagal menyimpan merek!" : "Gagal memperbarui merek!");
                return setLoading(false);
            }

            showToast("berhasil", mode === "create" ? "Gudang berhasil ditambahkan!" : "Gudang berhasil diperbarui!");
        } catch (error) {
            console.error('Terjadi kesalahan: ', error);
            showToast("gagal", mode === "create" ? "Gagal menyimpan merek!" : "Gagal memperbarui merek!");
        } finally {
            setLoading(false);
        }
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
        if (e.target.value.trim()) setNameError("");
    };

    const handleReset = (e) => {
        setName("");
        setDescription("");
        setNameError("");
    }

    // handler delete
    const handleDeleteMerk = async () => {
        try {
            await MerksRepository.deleteMerk(initialData.id);
            showToast("berhasil", "Gudang berhasil dihapus!");
            navigate("/inventory/merks");
        } catch (error) {
            console.error("Error deleting merk: ", error);
            showToast("gagal", "Gagal menghapus Gudang!");
        }
    }

    const handleRestricedAction = () => {
        setAccessDenied(true);
    }

    return (
        <div className="main-container">
            <ContentHeader title={mode === "create" ? "Tambah Gudang" : "Rincian Gudang"} />

            <div className='add-container-input'>
                <InputLabel
                    label="Nama Gudang"
                    icon={<PackagePlus className='input-icon' size={20} />}
                    value={name}
                    onChange={handleNameChange}
                />
                {nameError && <div className="error-message">{nameError}</div>}
            </div>

            <div className='add-container-input'>
                <InputLabel
                    label="Deskripsi Gudang"
                    icon={<ListEnd className='input-icon' size={20} />}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                {nameError && <div className="error-message">{nameError}</div>}
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
                        onclick={handleMerks}
                    />
                </div>
            ) : (
                <div className='add-container-actions'>
                    <ActionButton
                        title={"Hapus"}
                        background="linear-gradient(to top right,rgb(241, 66, 66),rgb(245, 51, 51))"
                        color="white"
                        onclick={() => roleAccess(accessList, 'menghapus-data-merek') ? setOpenDeleteModal(true) : handleRestricedAction()}
                    />

                    <ActionButton
                        title={loading ? "Memperbarui..." : "Perbarui"}
                        disabled={loading}
                        onclick={handleMerks}
                    />
                </div>
            )}

            {openDeleteModal && (
                <ConfirmationModal
                    isOpen={openDeleteModal}
                    onClose={() => setOpenDeleteModal(false)}
                    onClick={handleDeleteMerk}
                    title="Gudang"
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

export default EntityWarehouse;