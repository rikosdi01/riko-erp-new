import { useState } from 'react';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './AddExpress.css';
import { Phone, Ship, MapPin, HandPlatter, Receipt, Scale } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';

const AddExpress = () => {
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
            <ContentHeader title="Tambah Pengangkutan" />

            <div className='add-merk-input'>
                <InputLabel
                    label="Nama Pengangkutan"
                    icon={<Ship className='input-icon' size={20}/>}
                    value={code}
                    onChange={handleCodeChange}
                />
                {codeError && <div className="error-message">{codeError}</div>}
            </div>

            <div className='add-merk-input'>
                <InputLabel
                    label="Alamat Pengangkutan"
                    icon={<MapPin className='input-icon' size={20}/>}
                    value={name}
                    onChange={handleNameChange}
                />
                <InputLabel
                    label="No. Telpon"
                    icon={<Phone className='input-icon' size={20}/>}
                    value={name}
                    onChange={handleNameChange}
                />
            </div>

            <div className='add-merk-input'>
                <InputLabel
                    label="Jasa"
                    icon={<HandPlatter className='input-icon' size={20}/>}
                    value={name}
                    onChange={handleNameChange}
                />
                <InputLabel
                    label="Harga"
                    icon={<Receipt className='input-icon' size={20}/>}
                    value={name}
                    onChange={handleNameChange}
                />
                <InputLabel
                    label="Satuan"
                    icon={<Scale className='input-icon' size={20}/>}
                    value={name}
                    onChange={handleNameChange}
                />
            </div>

            <div className='add-merk-actions'>
                <ActionButton
                    title="Reset"
                    background="linear-gradient(to top right,rgb(241, 66, 66),rgb(245, 51, 51))"
                    color="white"
                    onclick={handleReset}
                />

                {/* <div className='add-merk-actions-right'>
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

export default AddExpress;