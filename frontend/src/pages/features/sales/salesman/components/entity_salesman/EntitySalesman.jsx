import { useEffect, useState } from 'react';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './EntitySalesman.css';
import { KeyRound, Users2 } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';
import { Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../../../../../context/AuthContext';
import ConfirmationModal from '../../../../../../components/modal/confirmation_modal/ConfirmationModal';
import SalesmanRepository from '../../../../../../repository/sales/SalesmanRepository';

const EntitySalesman = ({
    mode,
    initialData = {},
    onSubmit
}) => {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);

    const [code, setCode] = useState(initialData.code || "");
    const [name, setName] = useState(initialData.name || "");
    const [codeError, setCodeError] = useState("");
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

        setCode(initialData.code || "");
        setName(initialData.name || "");
        setCreatedAt(initialData.createdAt || Timestamp.now());
        setUserId(initialData.userId ?? currentUser?.uid ?? `guest-${Date.now()}`)
    }, [initialData]);

    const handleSalesman = async (e) => { // Tambahkan 'e' di sini
        e.preventDefault();
        setLoading(true);

        let valid = true;

        if (!code.trim()) {
            setCodeError('Kode Sales tidak boleh kosong!');
            valid = false;
        }

        if (!name.trim()) {
            setNameError('Nama Sales tidak boleh kosong!');
            valid = false;
        }

        if (!valid) return setLoading(false);

        try {
            const salesmanData = {
                code: code.trim(),
                name: name.trim(),
                createdAt: createdAt,
                updatedAt: Timestamp.now(),
                userId: userId,
            };

            console.log("Data Sales: ", salesmanData);

            try {
                await onSubmit(salesmanData, handleReset); // Eksekusi yang berisiko error
            } catch (submitError) {
                console.error("Error during onSubmit: ", submitError);
                showToast("gagal", mode === "create" ? "Gagal menyimpan sales!" : "Gagal memperbarui sales!");
                return setLoading(false);
            }

            showToast("berhasil", mode === "create" ? "Sales berhasil ditambahkan!" : "Sales berhasil diperbarui!");
        } catch (error) {
            console.error('Terjadi kesalahan: ', error);
            showToast("gagal", mode === "create" ? "Gagal menyimpan sales!" : "Gagal memperbarui sales!");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = (e) => {
        setCode("");
        setName("");
        setCodeError("");
        setNameError("");
    }
        // handler delete
        const handleDeleteSalesman = async () => {
            try {
                await SalesmanRepository.deleteSalesman(initialData.id);
                showToast("berhasil", "Salesman berhasil dihapus!");
                navigate("/sales/salesman");
            } catch (error) {
                console.error("Error deleting salesman: ", error);
                showToast("gagal", "Gagal menghapus Salesman!");
            }
        }

    return (
        <div className="main-container">
            <ContentHeader title="Tambah Sales" />

            <div className='add-container-input'>
                <InputLabel
                    label="Kode Sales"
                    icon={<KeyRound className='input-icon' />}
                    value={code}
                    onChange={(e) => {
                        setCode(e.target.value);
                    }}
                />
                {codeError && <div className="error-message">{codeError}</div>}
            </div>

            <div className='add-container-input'>
                <InputLabel
                    label="Nama Sales"
                    icon={<Users2 className='input-icon' />}
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                    }}
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
                        onclick={handleSalesman}
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
                        onclick={handleSalesman}
                    />
                </div>
            )}

            {openDeleteModal && (
                <ConfirmationModal
                    isOpen={openDeleteModal}
                    onClose={() => setOpenDeleteModal(false)}
                    onClick={handleDeleteSalesman}
                    title="Salesman"
                    itemDelete={name}
                />
            )}
        </div>
    )
}

export default EntitySalesman;