import { useEffect, useState } from 'react';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './DetailReturnOrder.css';
import { LayoutGrid, Computer, Sheet, KeyRound, ClipboardPen, BadgeDollarSign, PercentCircle } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';
import { Timestamp } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import { useMerks } from '../../../../../../context/warehouse/MerkContext';
import ConfirmationModal from '../../../../../../components/modal/confirmation_modal/ConfirmationModal';
import Formatting from '../../../../../../utils/format/Formatting';
import Dropdown from '../../../../../../components/select/Dropdown';

const DetailReturnOrder = () => {
    const { showToast } = useToast();
    const { id } = useParams();
    const { merks } = useMerks();
    const navigate = useNavigate();

    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [codeError, setCodeError] = useState("");
    const [nameError, setNameError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const selectedMerk = merks.find((m) => m.id === id);
        if (selectedMerk) {
            setCode(selectedMerk.code);
            setName(selectedMerk.name);
        }
    }, [merks, id]);


    const handleCodeChange = (e) => {
        setCode(e.target.value);
        if (e.target.value.trim()) setCodeError("");
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
        if (e.target.value.trim()) setNameError("");
    };

    const item = [
        { id: "Vixion (2008)", name: "Vixion (2008)" },
        { id: "Beat FI", name: "Beat FI" },
        { id: "Mio-J", name: "Mio-J" }
    ];

    const category = [
        { id: "Paking Full Set RIKO", name: "Paking Full Set RIKO" },
        { id: "Botol Klep RIKO", name: "Botol Klep RIKO" },
    ];

    const invoice = [
        { id: "RK25C0001", name: "RK25C0001" },
        { id: "Botol Klep RIKO", name: "Botol Klep RIKO" },
    ];

    return (
        <div className="main-container">
            <ContentHeader title="Rincian Retur Penjualan" enablePrint={true}/>

            <div className='add-merk-input'>
                <InputLabel
                    label="Nomor Returan"
                    icon={<KeyRound className='input-icon' />}
                    value={"RETUR25C0001"}
                    onChange={handleNameChange}
                />
                <Dropdown
                    values={invoice}
                    selectedId={"RK25C0001"}
                    label="Pilih Faktur Pesanan"
                    icon={<LayoutGrid className="input-icon" />}
                />
            </div>

            <div className='add-merk-input'>
                <InputLabel
                    label="Alasan Retur"
                    icon={<ClipboardPen className='input-icon' />}
                    value={"Kemasannya rusak"}
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
                <div className='list-item-header'>List Returan</div>

                <div className='add-merk-input-area'>
                    <Dropdown
                        values={category}
                        selectedId={"Paking Full Set RIKO"}
                        label="Pilih Kategori"
                        icon={<LayoutGrid className="input-icon" />}
                    />
                    <Dropdown
                        values={item}
                        selectedId={"Vixion (2008)"}
                        label="Pilih Item"
                        icon={<Computer className="input-icon" />}
                    />
                    <InputLabel
                        label="Kuantitas"
                        icon={<Sheet className='input-icon' />}
                        value={"10"}
                        onChange={handleNameChange}
                    />
                    <InputLabel
                        label="Harga"
                        icon={<BadgeDollarSign className='input-icon' />}
                        value={Formatting.formatCurrencyIDR("225000")}
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
                        value={"24"}
                        onChange={handleNameChange}
                    />
                    <InputLabel
                        label="Harga"
                        icon={<BadgeDollarSign className='input-icon' />}
                        value={Formatting.formatCurrencyIDR("770400")}
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
                    onclick={() => { }}
                />
            </div>

            <div>
                <ConfirmationModal
                    title={`Merek ${name}`}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onclick={() => { }}
                />
            </div>
        </div>
    )
}

export default DetailReturnOrder;