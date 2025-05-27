import { useEffect, useState } from 'react';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './DetailInvoice.css';
import { LayoutGrid, Computer, Sheet, KeyRound, ClipboardPen, BadgeDollarSign, PercentCircle, Store, Receipt, UserCog, Ship } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';
import { Timestamp } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import { useMerks } from '../../../../../../context/warehouse/MerkContext';
import ConfirmationModal from '../../../../../../components/modal/confirmation_modal/ConfirmationModal';
import Formatting from '../../../../../../utils/format/Formatting';
import Dropdown from '../../../../../../components/select/Dropdown';

const DetailInvoice = () => {
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

    return (
        <div className="main-container">
            <ContentHeader title="Rincian Faktur" enablePrint={true} />


            <div className='add-container-input-attribute'>
                <InputLabel
                    label="Kurir"
                    icon={<UserCog className='input-icon' />}
                    value={"Didi"}
                    onChange={handleNameChange}
                />
                <InputLabel
                    label="Pengangkutan"
                    icon={<Ship className='input-icon' />}
                    value={"Auto Express"}
                    onChange={handleNameChange}
                />
            </div>

            <div className='add-container-input'>
                <InputLabel
                    label="Nomor Pengiriman"
                    icon={<KeyRound className='input-icon' />}
                    value={"DO25C0001"}
                    onChange={handleNameChange}
                />
                {codeError && <div className="error-message">{codeError}</div>}
            </div>

            <div className='add-container-input'>
                <InputLabel
                    label="Nama Pelanggan"
                    icon={<Store className='input-icon' />}
                    value={"Arjuna Tipang"}
                    onChange={handleNameChange}
                />
                <InputLabel
                    label="Total Kuantitas"
                    icon={<Sheet className='input-icon' />}
                    value={"750"}
                    onChange={handleNameChange}
                />
                <InputLabel
                    label="Total Harga"
                    icon={<Receipt className='input-icon' />}
                    value={Formatting.formatCurrencyIDR("21137250")}
                    onChange={handleNameChange}
                />
            </div>

            <div className='add-container-input'>
                <InputLabel
                    label="Keterangan"
                    icon={<ClipboardPen className='input-icon' />}
                    value={"hari ini"}
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
                <div className='list-item-header'>List Faktur</div>

                <div className='add-container-input-area'>
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
                        value={"200"}
                        onChange={handleNameChange}
                    />
                    <InputLabel
                        label="Harga"
                        icon={<BadgeDollarSign className='input-icon' />}
                        value={Formatting.formatCurrencyIDR("4500000")}
                        onChange={handleNameChange}
                    />
                    <InputLabel
                        label="Diskon"
                        icon={<PercentCircle className='input-icon' />}
                        value={"3%"}
                        onChange={handleNameChange}
                    />
                </div>

                <div className='add-container-input-area'>
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
                        value={"550"}
                        onChange={handleNameChange}
                    />
                    <InputLabel
                        label="Harga"
                        icon={<BadgeDollarSign className='input-icon' />}
                        value={Formatting.formatCurrencyIDR("17655000")}
                        onChange={handleNameChange}
                    />
                    <InputLabel
                        label="Diskon"
                        icon={<PercentCircle className='input-icon' />}
                        value={"5%"}
                        onChange={handleNameChange}
                    />
                </div>
            </div>

            <div className='add-container-actions'>
                <ActionButton
                    title="Hapus"
                    background="linear-gradient(to top right,rgb(241, 66, 66),rgb(245, 51, 51))"
                    color="white"
                    onclick={() => setIsModalOpen(true)}
                />

                <ActionButton
                    title={loading ? "Memperbarui..." : "Proses"}
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

export default DetailInvoice;