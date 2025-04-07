import { useEffect, useState } from 'react';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './DetailCourier.css';
import { PackagePlus, KeyRound, UserCog, Phone } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';
import { Timestamp } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import { useMerks } from '../../../../../../context/warehouse/MerkContext';
import ConfirmationModal from '../../../../../../components/modal/confirmation_modal/ConfirmationModal';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';

const DetailCourier = () => {
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

    return (
        <div className="main-container">
            <ContentHeader title="Rincian Kurir" />

            <div className='add-merk-input'>
                <InputLabel
                    label="Nama Kurir"
                    icon={<UserCog className='input-icon' size={20} />}
                    value={code}
                    onChange={handleCodeChange}
                />
                {codeError && <div className="error-message">{codeError}</div>}
            </div>

            <div className='add-merk-input'>
                <InputLabel
                    label="No. Telpon"
                    icon={<Phone className='input-icon' size={20} />}
                    value={name}
                    onChange={handleNameChange}
                />
                {nameError && <div className="error-message">{nameError}</div>}
            </div>

            <div className='add-merk-checkbox'>
                <input type='checkbox' />
                <label>Status Karyawan: Aktif</label>
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

export default DetailCourier;