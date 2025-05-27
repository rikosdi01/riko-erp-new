import { useState } from 'react';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './AddSalesOrder.css';
import { LayoutGrid, Computer, Sheet, KeyRound, ClipboardPen, BadgeDollarSign, PercentCircle } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';
import Formatting from '../../../../../../utils/format/Formatting';
import Dropdown from '../../../../../../components/select/Dropdown';

const AddSalesOrder = () => {
    const { showToast } = useToast();

    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [codeError, setCodeError] = useState("");
    const [nameError, setNameError] = useState("");
    const [loading, setLoading] = useState(false);

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

    return (
        <div className="main-container">
            <ContentHeader title="Tambah Pesanan" enablePrint={true}/>

            <div className='add-container-input'>
                <InputLabel
                    label="Nomor Pesanan"
                    icon={<KeyRound className='input-icon' />}
                    value={name}
                    onChange={handleNameChange}
                />
                {codeError && <div className="error-message">{codeError}</div>}
            </div>

            <div className='add-container-input'>
                <InputLabel
                    label="Keterangan"
                    icon={<ClipboardPen className='input-icon' />}
                    value={name}
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
                <div className='list-item-header'>List Pesanan</div>

                <div className='add-container-input-area'>
                    <Dropdown
                        values={[]}
                        label="Pilih Kategori"
                        icon={<LayoutGrid className="input-icon" />}
                    />
                    <Dropdown
                        values={[]}
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
                        label="Harga"
                        icon={<BadgeDollarSign className='input-icon' />}
                        value={name}
                        onChange={handleNameChange}
                    />
                    <InputLabel
                        label="Diskon"
                        icon={<PercentCircle className='input-icon' />}
                        value={name}
                        onChange={handleNameChange}
                    />
                </div>
            </div>

            <div className='add-container-actions'>
                <ActionButton
                    title="Reset"
                    background="linear-gradient(to top right,rgb(241, 66, 66),rgb(245, 51, 51))"
                    color="white"
                    onclick={handleReset}
                />

                {/* <div className='add-container-actions-right'>
                    <ActionButton title="Simpan & Tutup"
                        background="linear-gradient(to top right,rgb(51, 231, 117),rgb(35, 255, 127))"
                        color="#146A3E"
                    />
                </div> */}
                <ActionButton
                    title={loading ? "Menyimpan..." : "Simpan"}
                    disabled={loading}
                    onclick={() => {}}
                />
            </div>
        </div>
    )
}

export default AddSalesOrder;