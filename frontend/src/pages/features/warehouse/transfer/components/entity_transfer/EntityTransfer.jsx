import { useEffect, useState } from 'react';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './EntityTransfer.css';
import { Computer, Sheet, KeyRound, ClipboardPen } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';
import MerksRepository from '../../../../../../repository/warehouse/MerksRepository';
import { Timestamp } from 'firebase/firestore';
import Dropdown from '../../../../../../components/select/Dropdown';
import Formatting from '../../../../../../utils/format/Formatting';
import { productIndex } from '../../../../../../../config/algoliaConfig';

const EntityTransfer = ({
    mode,
    initialData = {},
    onSubmit,
}) => {
    // Context
    const { showToast } = useToast();

    const [code, setCode] = useState(initialData.code || "");
    const [description, setDescription] = useState(initialData.description || "");
    const [createdAt, setCreatedAt] = useState(initialData.createdAt || Timestamp.now());
    const [items, setItems] = useState(initialData.items || [
        { item: "", qty: "", notes: "" }
    ]);
    const [codeError, setCodeError] = useState("");
    const [nameError, setNameError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...items];
        updatedItems[index][field] = value;
        setItems(updatedItems);
    };

    const handleAddItem = () => {
        setItems([...items, { item: "", qty: "", notes: "" }]);
    };

    useEffect(() => {
        console.log('Items: ', items);
    }, [items])



    const handleCreateMerks = async (e) => { // Tambahkan 'e' di sini
        e.preventDefault();
        setLoading(true);

        let valid = true;

        if (!code.trim()) {
            setCodeError('Kode Merek tidak boleh kosong!');
            valid = false;
        }

        if (!description.trim()) {
            setNameError('Nama Merek tidak boleh kosong!');
            valid = false;
        }

        if (!valid) return setLoading(false);

        try {
            const newMerks = {
                code,
                description,
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
        setDescription(e.target.value);
        if (e.target.value.trim()) setNameError("");
    };

    const handleReset = (e) => {
        setCode("");
        setDescription("");
        setCodeError("");
        setNameError("");
    }

    const loadItemOptions = async (inputValue) => {
        console.log("Searching Algolia with input:", inputValue);
        const searchTerm = inputValue || ""; // pastikan tetap "" jika kosong
        const { hits } = await productIndex.search(searchTerm, {
            hitsPerPage: 10,
        });

        console.log("Algolia search results:", hits);

        return hits.map(hit => ({
            name: hit.category.name + ' - ' + hit.name + ' (' + hit.brand + ')',
            code: hit.category.code + '-' + hit.code,
            id: hit.objectID,
        }));
    };




    return (
        <div className="main-container">
            <ContentHeader title={mode === "create" ? "Tambah Pemindahan Stok" : "Rincian Pemindahan Stok"} />

            <div className='add-container-input'>
                <InputLabel
                    label="Nomor Transferan"
                    icon={<KeyRound className='input-icon' />}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
                {codeError && <div className="error-message">{codeError}</div>}
            </div>

            <div className='add-container-input'>
                <InputLabel
                    label="Keterangan"
                    icon={<ClipboardPen className='input-icon' />}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <InputLabel
                    label="Tanggal"
                    type="datetime-local"
                    icon={<ClipboardPen className='input-icon' />}
                    value={Formatting.getCurrentDateTime()}
                    onChange={(e) => setCreatedAt(e.target.value)}
                />
            </div>

            <div className='divider'></div>

            <div className='list-item-container'>
                <div className='list-item-header'>List Pemindahan</div>

                {items.map((item, index) => (
                    <div key={index} className="add-container-input-area">
                        <Dropdown
                            isAlgoliaDropdown={true}
                            values={loadItemOptions}
                            selectedId={item.item}
                            setSelectedId={(value) => handleItemChange(index, "item", value)}
                            label="Pilih Item"
                            icon={<Computer className="input-icon" />}
                        />
                        <InputLabel
                            label="Kuantitas"
                            icon={<Sheet className='input-icon' />}
                            value={item.qty}
                            onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                        />
                        <InputLabel
                            label="Keterangan"
                            icon={<ClipboardPen className='input-icon' />}
                            value={item.notes}
                            onChange={(e) => handleItemChange(index, "notes", e.target.value)}
                        />
                    </div>
                ))}

            </div>

            <div className='add-container-actions'>
                <ActionButton
                    title="Reset"
                    background="linear-gradient(to top right,rgb(241, 66, 66),rgb(245, 51, 51))"
                    color="white"
                    onclick={handleReset}
                />

                <ActionButton
                    title={loading ? "Menyimpan..." : "Simpan"}
                    disabled={loading}
                    onclick={handleCreateMerks}
                />
            </div>
        </div>
    )
}

export default EntityTransfer;