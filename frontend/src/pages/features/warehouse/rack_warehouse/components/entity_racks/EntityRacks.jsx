import { useContext, useEffect, useState } from 'react';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './EntityRacks.css';
import { PackagePlus, PackageOpen, List } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';
import { Timestamp } from 'firebase/firestore';
import ConfirmationModal from '../../../../../../components/modal/confirmation_modal/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../../../../context/AuthContext';
import RackWarehouseRepository from '../../../../../../repository/warehouse/RackWarehouseRepository';
import AccessAlertModal from '../../../../../../components/modal/access_alert_modal/AccessAlertModal';
import roleAccess from '../../../../../../utils/helper/roleAccess';
import { useUsers } from '../../../../../../context/auth/UsersContext';

const EntityRacks = ({
    mode,
    initialData = {},
    onSubmit
}) => {
    // Context
    const { accessList } = useUsers();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const [accessDenied, setAccessDenied] = useState(false);


    // ================================================================================


    // Variabels
    const [name, setName] = useState(initialData.name || "");
    const [category, setCategory] = useState(initialData.category || "");
    const [createdAt, setCreatedAt] = useState(initialData.createdAt || Timestamp.now());
    const [userId, setUserId] = useState(
        initialData.userId ?? currentUser?.uid ?? `guest-${Date.now()}`
    );
    const [nameError, setNameError] = useState("");
    const [categoryError, setCategoryError] = useState("");
    const [loading, setLoading] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);


    // ================================================================================


    // UseEffect
    // Fetch Initial Data
    useEffect(() => {
        if (!initialData || Object.keys(initialData).length === 0) return;

        setName(initialData.name || "");
        setCategory(initialData.category || "");
        setCreatedAt(initialData.createdAt || Timestamp.now());
        setUserId(initialData.userId ?? currentUser?.uid ?? `guest-${Date.now()}`)
    }, [initialData]);


    // ================================================================================


    // Logic
    const handleRacks = async (e) => { // Tambahkan 'e' di sini
        e.preventDefault();
        setLoading(true);

        let valid = true;

        if (!name.trim()) {
            setNameError('Nama Gudang tidak boleh kosong!');
            valid = false;
        }

        if (!category.trim()) {
            setCategoryError('Kategori Gudang tidak boleh kosong!');
            valid = false;
        }

        if (!valid) return setLoading(false);

        try {

            const racksData = {
                name: name.trim(),
                category: category.trim(),
                createdAt: createdAt,
                updatedAt: Timestamp.now(),
                userId: userId,
            };

            try {
                await onSubmit(racksData, handleReset); // Eksekusi yang berisiko error
            } catch (submitError) {
                console.error("Error during onSubmit: ", submitError);
                showToast("gagal", mode === "create" ? "Gagal menyimpan gudang!" : "Gagal memperbarui gudang!");
                return setLoading(false);
            }

            showToast("berhasil", mode === "create" ? "Gudang berhasil ditambahkan!" : "Gudang berhasil diperbarui!");
        } catch (error) {
            console.error('Terjadi kesalahan: ', error);
            showToast("gagal", mode === "create" ? "Gagal menyimpan gudang!" : "Gagal memperbarui gudang!");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = (e) => {
        setName("");
        setCategory("");
        setCategory("");
        setNameError("");
    }

    // handler delete
    const handleDeleteMerk = async () => {
        try {
            await RackWarehouseRepository.deleteRack(initialData.id);
            showToast("berhasil", "Gudang berhasil dihapus!");
            navigate("/inventory/warehouse");
        } catch (error) {
            console.error("Error deleting rack: ", error);
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
                    onChange={(e) => {
                        setName(e.target.value);
                    }}
                />
                {nameError && <div className="error-message">{nameError}</div>}
            </div>

            <div className='add-container-input'>
                <InputLabel
                    label="Kategori Gudang"
                    icon={<PackageOpen className='input-icon' size={20} />}
                    value={category}
                    onChange={(e) => {
                        setCategory(e.target.value);
                    }}
                />
                {categoryError && <div className="error-message">{categoryError}</div>}
            </div>

            <div className='add-container-input'>
                <InputLabel
                    label="Deskripsi Gudang"
                    icon={<List className='input-icon' size={20} />}
                    value={category}
                    onChange={(e) => {
                        setCategory(e.target.value);
                    }}
                />
                {categoryError && <div className="error-message">{categoryError}</div>}
            </div>

            <div className='add-container-input'>
                <InputLabel
                    label="Lokasi Gudang"
                    icon={<PackageOpen className='input-icon' size={20} />}
                    value={category}
                    onChange={(e) => {
                        setCategory(e.target.value);
                    }}
                />
                {categoryError && <div className="error-message">{categoryError}</div>}
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
                        onclick={handleRacks}
                    />
                </div>
            ) : (
                <div className='add-container-actions'>
                    <ActionButton
                        title={"Hapus"}
                        background="linear-gradient(to top right,rgb(241, 66, 66),rgb(245, 51, 51))"
                        color="white"
                        onclick={() => roleAccess(accessList, 'menghapus-data-gudang') ? setOpenDeleteModal(true) : handleRestricedAction()}
                    />

                    <ActionButton
                        title={loading ? "Memperbarui..." : "Perbarui"}
                        disabled={loading}
                        onclick={handleRacks}
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

export default EntityRacks;