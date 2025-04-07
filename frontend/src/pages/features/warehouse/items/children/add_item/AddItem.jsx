import { useState } from 'react';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './AddItem.css';
import { PackagePlus, KeyRound, LayoutGrid, CarFront, BadgeDollarSign, Scale } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';
import MerksRepository from '../../../../../../repository/warehouse/MerksRepository';
import { Timestamp } from 'firebase/firestore';
import FilterValue from '../../../../../../components/filter/FilterValue/FilterValue';
import Dropdown from '../../../../../../components/select/Dropdown';

const AddItem = () => {
    const { showToast } = useToast();

    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [category, setCategory] = useState([]);
    const [codeError, setCodeError] = useState("");
    const [nameError, setNameError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreateMerks = async (e) => { // Tambahkan 'e' di sini
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
            const newMerks = {
                code,
                name,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            };

            await MerksRepository.createMerk(newMerks);
            handleReset();
            showToast('berhasil', 'Merek berhasil ditambahkan!');
        } catch (error) {
            console.error('Terjadi kesalahan: ', error);
            showToast('gagal', 'Gagal menambahkan merek baru!');
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

    return (
        <div className="main-container">
            <ContentHeader title="Tambah Item" />

            <div className='add-merk-input'>
                <InputLabel
                    label="Kode Item"
                    icon={<KeyRound className='input-icon' />}
                    value={code}
                    onChange={handleCodeChange}
                />
                {codeError && <div className="error-message">{codeError}</div>}
            </div>

            <div className='add-merk-input'>
                <div>
                    <InputLabel
                        label="Nama Item"
                        icon={<PackagePlus className='input-icon' />}
                        value={name}
                        onChange={handleNameChange}
                    />
                    {nameError && <div className="error-message">{nameError}</div>}
                </div>

                <Dropdown
                    values={category}
                    label="Pilih Motor"
                    icon={<CarFront className="input-icon" />}
                />
            </div>

            <div className='add-merk-input'>
                <Dropdown
                    values={category}
                    label="Pilih Kategori"
                    icon={<LayoutGrid className="input-icon" />}
                />
            </div>

            <div className='add-merk-input'>
                <div>
                    <InputLabel
                        label="Harga Jual"
                        icon={<BadgeDollarSign className='input-icon' />}
                        value={name}
                        onChange={handleNameChange}
                    />
                    {nameError && <div className="error-message">{nameError}</div>}
                </div>

                <div>
                    <InputLabel
                        label="Satuan"
                        icon={<Scale className='input-icon' />}
                        value={name}
                        onChange={handleNameChange}
                    />
                    {nameError && <div className="error-message">{nameError}</div>}
                </div>
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
                    onclick={handleCreateMerks}
                />
            </div>
        </div>
    )
}

export default AddItem;