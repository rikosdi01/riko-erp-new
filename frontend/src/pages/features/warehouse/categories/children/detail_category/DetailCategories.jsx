import { useEffect, useState } from 'react';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './DetailCategories.css';
import { PackagePlus, KeyRound, BadgeCheck } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';
import MerksRepository from '../../../../../../repository/warehouse/MerksRepository';
import { Timestamp } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmationModal from '../../../../../../components/modal/confirmation_modal/ConfirmationModal';
import { useCategories } from '../../../../../../context/warehouse/CategoryContext';
import Dropdown from '../../../../../../components/select/Dropdown';
import { useMerks } from '../../../../../../context/warehouse/MerkContext';

const DetailCategories = () => {
    const { showToast } = useToast();
    const { id } = useParams();
    const { categories } = useCategories();
    const { merks } = useMerks();
    const navigate = useNavigate();

    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [merk, setMerk] = useState("");
    const [codeError, setCodeError] = useState("");
    const [nameError, setNameError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const selectedMerk = categories.find((m) => m.id === id);
        if (selectedMerk) {
            setCode(selectedMerk.code);
            setName(selectedMerk.name);
            setMerk(selectedMerk.merkName);
        }
    }, [categories, id]);


    const handleEditMerks = async (e) => {
        e.preventDefault();
        setLoading(true);

        let valid = true;

        if (!code.trim()) {
            setCodeError('Kode Merek tidak boleh kosong!');
            valid = false;
        }

        if (!name.trim()) {
            setNameError('Nama Merek tidak boleh kosong!');
            valid = false;
        }

        if (!valid) return setLoading(false);

        try {
            const updatedMerks = {
                code,
                name,
                updatedAt: Timestamp.now(),
            };

            await MerksRepository.updateMerk(id, updatedMerks);
            showToast('berhasil', 'Merek berhasil diperbarui!');
        } catch (error) {
            console.error('Terjadi kesalahan: ', error);
            showToast('gagal', 'Gagal memperbarui merek!');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMerks = async () => {
        try {
            await MerksRepository.deleteMerk(id);
            navigate('/warehouse/categories', { replace: true });
            showToast('berhasil', 'Merek berhasil dihapus!');
        } catch (error) {
            console.error('Terjadi kesalahan: ', error);
            showToast('gagal', 'Gagal menghapus merek!');
        }
    }

    const handleCodeChange = (e) => {
        setCode(e.target.value);
        if (e.target.value.trim()) setCodeError("");
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
        if (e.target.value.trim()) setNameError("");
    };

    return (
        <div className="main-container">
            <ContentHeader title="Rincian Kategori" />

            <div className='add-merk-input'>
                <InputLabel
                    label="Kode Merek"
                    icon={<KeyRound className='input-icon' />}
                    value={code}
                    onChange={handleCodeChange}
                />
                {codeError && <div className="error-message">{codeError}</div>}
            </div>

            <div className='add-merk-input'>
                <InputLabel
                    label="Nama Merek"
                    icon={<PackagePlus className='input-icon' />}
                    value={name}
                    onChange={handleNameChange}
                />
                {nameError && <div className="error-message">{nameError}</div>}
            </div>

            <div className='add-merk-input'>
                <Dropdown
                    values={merks}
                    selectedId={"7SXLBn32WVj50Qv2BfYe"}
                    label="Pilih Merek"
                    icon={<BadgeCheck className="input-icon" />}
                />
            </div>

            <div className='add-merk-actions'>
                <ActionButton
                    title="Hapus"
                    background="linear-gradient(to top right,rgb(241, 66, 66),rgb(245, 51, 51))"
                    color="white"
                    onclick={() => setIsModalOpen(true)}
                />

                <ActionButton
                    title={loading ? "Memperbarui..." : "Perbarui"}
                    disabled={loading}
                    onclick={handleEditMerks}
                />
            </div>

            <div>
                <ConfirmationModal
                    title={`Merek ${name}`}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onclick={handleDeleteMerks}
                />
            </div>
        </div>
    )
}

export default DetailCategories;