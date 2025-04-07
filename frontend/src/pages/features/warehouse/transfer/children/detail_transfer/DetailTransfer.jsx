import { useEffect, useState } from 'react';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './DetailTransfer.css';
import { LayoutGrid, Computer, Sheet, KeyRound, ClipboardPen } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';
import MerksRepository from '../../../../../../repository/warehouse/MerksRepository';
import { Timestamp } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmationModal from '../../../../../../components/modal/confirmation_modal/ConfirmationModal';
import { useCategories } from '../../../../../../context/warehouse/CategoryContext';
import Dropdown from '../../../../../../components/select/Dropdown';
import { useItems } from '../../../../../../context/warehouse/ItemContext';
import Formatting from '../../../../../../utils/format/Formatting';

const DetailTransfer = () => {
    const { showToast } = useToast();
    const { id } = useParams();
    const { categories } = useCategories();
    const { items } = useItems();
    const navigate = useNavigate();

    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [codeError, setCodeError] = useState("");
    const [nameError, setNameError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const item = [
        { id: "Beat", name: "Beat" },
        { id: "Beat FI", name: "Beat FI" },
        { id: "Mio-J", name: "Mio-J" }
    ];

    const category = [
        { id: "As Kick Stater RIKO", name: "As Kick Stater RIKO" },
        { id: "Botol Klep RIKO", name: "Botol Klep RIKO" },
    ];

    const brand = [
        { id: "Honda", name: "Honda" },
        { id: "Yamaha", name: "Yamaha" },
        { id: "Suzuki", name: "Suzuki" }
    ];
    

    useEffect(() => {
        const selectedMerk = items.find((m) => m.id === id);
        if (selectedMerk) {
            setCode(selectedMerk.code);
            setName(selectedMerk.name);
        }
    }, [items, id]);


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
            <ContentHeader title="Rincian Pemindahan Stok" />

            <div className='add-merk-input'>
                <InputLabel
                    label="Nomor Penyesuaian"
                    icon={<KeyRound className='input-icon' />}
                    value={"IT25C0001"}
                    onChange={handleNameChange}
                />
                {codeError && <div className="error-message">{codeError}</div>}
            </div>

            <div className='add-merk-input'>
                <InputLabel
                    label="Keterangan"
                    icon={<ClipboardPen className='input-icon' />}
                    value={"Pindah Stok"}
                    onChange={handleNameChange}
                />
                <InputLabel
                    label="Tanggal"
                    type="datetime-local"
                    icon={<ClipboardPen className='input-icon' />}
                    value={Formatting.getCurrentDateTime()}
                    onChange={handleNameChange}
                />
            </div>

            <div className='divider'></div>

            <div className='list-item-container'>
                <div className='list-item-header'>List Penyesuaian</div>

                <div className='add-merk-input-area'>
                    <Dropdown
                        values={category}
                        selectedId={"As Kick Stater RIKO"}
                        label="Pilih Kategori"
                        icon={<LayoutGrid className="input-icon" />}
                    />
                    <Dropdown
                        values={item}
                        selectedId={"Beat FI"}
                        label="Pilih Item"
                        icon={<Computer className="input-icon" />}
                    />
                    <InputLabel
                        label="Kuantitas"
                        icon={<Sheet className='input-icon' />}
                        value={"100"}
                        onChange={handleNameChange}
                    />
                    <InputLabel
                        label="Keterangan"
                        icon={<ClipboardPen className='input-icon' />}
                        value={"AD2, No. I02/G88048"}
                        onChange={handleNameChange}
                    />
                </div>
                <div className='add-merk-input-area'>
                    <Dropdown
                        values={category}
                        selectedId={"Botol Klep RIKO"}
                        label="Pilih Kategori"
                        icon={<LayoutGrid className="input-icon" />}
                    />
                    <Dropdown
                        values={item}
                        selectedId={"Mio-J"}
                        label="Pilih Item"
                        icon={<Computer className="input-icon" />}
                    />
                    <InputLabel
                        label="Kuantitas"
                        icon={<Sheet className='input-icon' />}
                        value={"50"}
                        onChange={handleNameChange}
                    />
                    <InputLabel
                        label="Keterangan"
                        icon={<ClipboardPen className='input-icon' />}
                        value={"AB2, No. 009/G88052"}
                        onChange={handleNameChange}
                    />
                </div>
                <div className='add-merk-input-area'>
                    <Dropdown
                        values={category}
                        label="Pilih Kategori"
                        icon={<LayoutGrid className="input-icon" />}
                    />
                    <Dropdown
                        values={item}
                        label="Pilih Item"
                        icon={<Computer className="input-icon" />}
                    />
                    <InputLabel
                        label="Kuantitas"
                        icon={<Sheet className='input-icon' />}
                        value={name}
                        onChange={handleNameChange}
                    />
                    <InputLabel
                        label="Keterangan"
                        icon={<ClipboardPen className='input-icon' />}
                        value={""}
                        onChange={handleNameChange}
                    />
                </div>
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

export default DetailTransfer;