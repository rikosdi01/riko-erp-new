import { useEffect, useState } from 'react';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './DetailStorage.css';
import { LayoutGrid, CarFront, BadgeDollarSign, Scale, Computer, Sheet, MapPinHouse, ListEnd } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';
import MerksRepository from '../../../../../../repository/warehouse/MerksRepository';
import { Timestamp } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmationModal from '../../../../../../components/modal/confirmation_modal/ConfirmationModal';
import { useCategories } from '../../../../../../context/warehouse/CategoryContext';
import Dropdown from '../../../../../../components/select/Dropdown';
import { useItems } from '../../../../../../context/warehouse/ItemContext';

const DetailStorage = () => {
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
            setCategory(selectedMerk.categoryName);
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
            <ContentHeader title="Rincian Penyimpanan Stok" />

            <div className='add-merk-input'>
                <Dropdown
                    values={category}
                    selectedId={"As Kick Stater RIKO"}
                    label="Pilih Kategori"
                    icon={<LayoutGrid className="input-icon" />}
                />
                {codeError && <div className="error-message">{codeError}</div>}
            </div>

            <div className='add-merk-input'>
                <Dropdown
                    values={item}
                    selectedId={"Beat"}
                    label="Pilih Item"
                    icon={<Computer className="input-icon" />}
                />

                <Dropdown
                    values={brand}
                    selectedId={"Honda"}
                    label="Pilih Motor"
                    icon={<CarFront className="input-icon" />}
                />
            </div>

            <div className='add-merk-input'>
                <InputLabel
                    label="Rak"
                    icon={<MapPinHouse className='input-icon' />}
                    value={"BD2"}
                    onChange={handleNameChange}
                />
                <InputLabel
                    label="Baris"
                    icon={<ListEnd className='input-icon' />}
                    value={"A2"}
                    onChange={handleNameChange}
                />
                <InputLabel
                    label="Kuantitas"
                    icon={<Sheet className='input-icon' />}
                    value={100}
                    onChange={handleNameChange}
                />
            </div>

            <div className='add-merk-input-attribute'>
                <div>
                    <InputLabel
                        label="No. Dus"
                        icon={<BadgeDollarSign className='input-icon' />}
                        value={"I012"}
                        onChange={handleNameChange}
                    />
                    {nameError && <div className="error-message">{nameError}</div>}
                </div>

                <div>
                    <InputLabel
                        label="Trip"
                        icon={<Scale className='input-icon' />}
                        value={"G88014"}
                        onChange={handleNameChange}
                    />
                    {nameError && <div className="error-message">{nameError}</div>}
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

export default DetailStorage;