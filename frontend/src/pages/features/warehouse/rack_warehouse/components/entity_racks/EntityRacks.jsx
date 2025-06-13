import { useContext, useEffect, useState } from 'react';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './EntityRacks.css';
import { PackagePlus, KeyRound } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';
import { Timestamp } from 'firebase/firestore';
import ConfirmationModal from '../../../../../../components/modal/confirmation_modal/ConfirmationModal';
import MerksRepository from '../../../../../../repository/warehouse/MerksRepository';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../../../../context/AuthContext';
import RackWarehouseRepository from '../../../../../../repository/warehouse/RackWarehouseRepository';

const EntityRacks = ({
    mode,
    initialData = {},
    onSubmit
}) => {
    // Context
    const { showToast } = useToast();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);


    // ================================================================================


    // Variabels
    const [code, setCode] = useState(initialData.code || "");
    const [name, setName] = useState(initialData.name || "");
    const [createdAt, setCreatedAt] = useState(initialData.createdAt || Timestamp.now());
    const [userId, setUserId] = useState(
        initialData.userId ?? currentUser?.uid ?? `guest-${Date.now()}`
    );
    const [codeError, setCodeError] = useState("");
    const [nameError, setNameError] = useState("");
    const [loading, setLoading] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);


    // ================================================================================


    // UseEffect
    // Fetch Initial Data
    useEffect(() => {
        if (!initialData || Object.keys(initialData).length === 0) return;

        setCode(initialData.code || "");
        setName(initialData.name || "");
        setCreatedAt(initialData.createdAt || Timestamp.now());
        setUserId(initialData.userId ?? currentUser?.uid ?? `guest-${Date.now()}`)
    }, [initialData]);


    // ================================================================================


    // Logic
    const handleRacks = async (e) => { // Tambahkan 'e' di sini
        e.preventDefault();
        setLoading(true);

        let valid = true;

        if (!code.trim()) {
            setCodeError('Kode Gudang tidak boleh kosong!');
            valid = false;
        }

        if (!name.trim()) {
            setNameError('Nama Gudang tidak boleh kosong!');
            valid = false;
        }

        if (!valid) return setLoading(false);

        try {
            const exists = await MerksRepository.checkMerkCodeExists(
                code.trim(),
                mode === "detail" ? initialData.id : null
            );

            if (exists) {
                showToast("gagal", "Kode Gudang sudah digunakan!");
                return setLoading(false);
            }

            const racksData = {
                code: code.trim(),
                name: name.trim(),
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


    const handleCodeChange = (e) => {
        setCode(e.target.value);
        if (e.target.value.trim()) setCodeError("");
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
        if (e.target.value.trim()) setNameError("");
    };

    const handleReset = (e) => {
        setCode("");
        setName("");
        setCodeError("");
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

    return (
        <div className="main-container">
            <ContentHeader title={mode === "create" ? "Tambah Gudang" : "Rincian Gudang"} />

            <div className='add-container-input'>
                <InputLabel
                    label="Kode Gudang"
                    icon={<KeyRound className='input-icon' size={20} />}
                    value={code}
                    onChange={handleCodeChange}
                />
                {codeError && <div className="error-message">{codeError}</div>}
            </div>

            <div className='add-container-input'>
                <InputLabel
                    label="Nama Gudang"
                    icon={<PackagePlus className='input-icon' size={20} />}
                    value={name}
                    onChange={handleNameChange}
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
                        onclick={handleRacks}
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
        </div >
    )
}

export default EntityRacks;