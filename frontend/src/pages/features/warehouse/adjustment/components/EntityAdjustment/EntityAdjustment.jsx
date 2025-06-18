import { useEffect, useState } from 'react';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './EntityAdjustment.css';
import { Computer, Sheet, KeyRound, ClipboardPen, Warehouse } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';
import { Timestamp } from 'firebase/firestore';
import Dropdown from '../../../../../../components/select/Dropdown';
import Formatting from '../../../../../../utils/format/Formatting';
import { productIndex } from '../../../../../../../config/algoliaConfig';
import TransferRepository from '../../../../../../repository/warehouse/TransferRepository';
import ConfirmationModal from '../../../../../../components/modal/confirmation_modal/ConfirmationModal';
import { useRacks } from '../../../../../../context/warehouse/RackWarehouseContext';
import AdjustmentRepository from '../../../../../../repository/warehouse/AdjustmentRepository';

const EntityAdjustment = ({
    mode,
    initialData = {},
    onSubmit,
}) => {
    console.log('Initial Data: ', initialData);
    // Context
    const { showToast } = useToast();
    const { racks } = useRacks();

    const emptyData = [{ item: '', qty: '' }]
    const [code, setCode] = useState(initialData.code || "");
    const [description, setDescription] = useState(initialData.description || "");
    const [items, setItems] = useState(initialData.items || emptyData);
    const [warehouse, setWarehouse] = useState(initialData.warehouse?.id || '');
    const [createdAt, setCreatedAt] = useState(initialData.createdAt || '');
    const [codeError, setCodeError] = useState("");
    const [itemError, setItemError] = useState("");
    const [warehouseError, setWarehouseError] = useState("");
    const [loading, setLoading] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...items];

        // Update field yang diubah
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value ?? "",
        };

        // Row dianggap lengkap jika 'item' dan 'qty' terisi
        const isRowComplete = (row) =>
            row.item && row.qty;

        // Row dianggap berisi jika ada salah satu field terisi
        const isRowFilled = (row) =>
            row.item || row.qty;

        // Tambahkan row kosong baru jika row terakhir lengkap
        if (isRowComplete(updatedItems[updatedItems.length - 1])) {
            updatedItems.push({ item: "", qty: "" });
        }

        // Temukan index terakhir yang masih berisi data
        let lastFilledIndex = -1;
        for (let i = 0; i < updatedItems.length; i++) {
            if (isRowFilled(updatedItems[i])) {
                lastFilledIndex = i;
            }
        }

        // Sisakan 1 row kosong setelah baris terakhir yang berisi
        const cleanedItems = updatedItems.slice(0, lastFilledIndex + 2);
        setItems(cleanedItems);
    };

    // Hanya jalan sekali saat komponen pertama kali dimount
    useEffect(() => {
        if (!initialData || Object.keys(initialData).length === 0) {
            setCreatedAt(Formatting.formatDateForInput(new Date()));
        }
    }, []); // kosong -> hanya jalan sekali saat mount


    // 🔁 Sinkronkan initialData ke state setiap kali initialData berubah
    useEffect(() => {
        if (!initialData || Object.keys(initialData).length === 0) return;

        setCode(initialData.code || "");
        setDescription(initialData.description || "");
        setItems(initialData.items || emptyData);
        setWarehouse(initialData.warehouse?.id || '');
        setCreatedAt(initialData.createdAt
            ? Formatting.formatTimestampToISO(initialData.createdAt)
            : Formatting.formatDateForInput(new Date()));
    }, [initialData]);


    const handleAdjustment = async (e) => { // Tambahkan 'e' di sini
        e.preventDefault();
        setLoading(true);

        let valid = true;

        if (!code.trim()) {
            setCodeError('Kode Penyesuaian tidak boleh kosong!');
            valid = false;
        }

        if (!warehouse.trim()) {
            setWarehouseError('Gudang tidak boleh kosong!');
            valid = false;
        }

        if (JSON.stringify(items) === JSON.stringify(emptyData)) {
            valid = false;
            setItemError('List Item Penyesuaian tidak boleh kosong!');
        }

        if (!valid) return setLoading(false);

        try {
            const filteredItems = items.filter(item => item.item && item.qty);
            const wh = racks.find(wh => wh.id === warehouse);

            const filteredWH = {
                id: wh.id,
                code: wh.code,
                name: wh.name,
            };

            const exists = await AdjustmentRepository.checkAdjExists(
                code.trim(),
                mode === "detail" ? initialData.id : null
            );

            if (exists) {
                showToast("gagal", "Kode Penyesuaian sudah digunakan!");
                return setLoading(false);
            }

            const newAdj = {
                code,
                description,
                items: filteredItems,
                warehouse: filteredWH,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            };

            try {
                await onSubmit(newAdj, handleReset); // Eksekusi yang berisiko error
            } catch (submitError) {
                console.error("Error during onSubmit: ", submitError);
                showToast("gagal", mode === "create" ? "Gagal menyimpan adj!" : "Gagal memperbarui adj!");
                return;
            }

            showToast('berhasil', 'Penyesuaian berhasil ditambahkan!');
        } catch (error) {
            console.error('Terjadi kesalahan: ', error);
            showToast('gagal', 'Gagal menambahkan merek baru!');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = (e) => {
        setCode("");
        setDescription("");
        setItems(emptyData);
        setWarehouse("");
        setCodeError("");
        setItemError("");
        setWarehouseError("");
    }

    const loadItemOptions = async (inputValue) => {
        const searchTerm = inputValue || ""; // pastikan tetap "" jika kosong
        const { hits } = await productIndex.search(searchTerm, {
            hitsPerPage: 10,
        });

        return hits.map(hit => ({
            name: hit.category.name + ' - ' + hit.name + ' (' + hit.brand + ')',
            code: hit.category.code + '-' + hit.code,
            id: hit.objectID,
        }));
    };


    // handler delete
    const handleDeleteTransfer = async () => {
        try {
            await TransferRepository.deleteTransfer(initialData.id);
            showToast("berhasil", "Transferan berhasil dihapus!");
            navigate("/inventory/transfer");
        } catch (error) {
            console.error("Error deleting transfer: ", error);
            showToast("gagal", "Gagal menghapus transfer!");
        }
    }



    return (
        <div className="main-container">
            <ContentHeader title={mode === "create" ? "Tambah Penyesuaian Stok" : "Rincian Penyesuaian Stok"} />

            <div className='add-container-input'>
                <InputLabel
                    label="Nomor Penyesuaian"
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
                <div>
                <Dropdown
                    values={racks}
                    selectedId={warehouse}
                    setSelectedId={setWarehouse}
                    label="Gudang"
                    icon={<Warehouse className="input-icon" />}
                />
                {warehouseError && <div className="error-message">{warehouseError}</div>}
                </div>
                <InputLabel
                    label="Tanggal"
                    type="datetime-local"
                    icon={<ClipboardPen className='input-icon' />}
                    value={createdAt}
                    onChange={(e) => setCreatedAt(e.target.value)}
                />
            </div>

            <div className='divider'></div>

            <div className='list-item-container'>
                <div className='list-item-header'>List Penyesuaian</div>

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
                    </div>
                ))}
                {itemError && <div className="error-message">{itemError}</div>}
            </div>

            {mode === "create" ? (
                <div className='add-container-actions'>
                    <ActionButton
                        title={"Reset"}
                        background="linear-gradient(to top right,rgb(241, 66, 66),rgb(245, 51, 51))"
                        color="white"
                        onclick={handleReset}
                    />

                    <ActionButton
                        title={loading ? "Menyimpan..." : "Simpan"}
                        disabled={loading}
                        onclick={handleAdjustment}
                    />
                </div>
            ) : (
                <div className='add-container-actions'>
                    <ActionButton
                        title={"Hapus"}
                        background="linear-gradient(to top right,rgb(241, 66, 66),rgb(245, 51, 51))"
                        color="white"
                        onclick={() => setOpenDeleteModal(true)}
                    />

                    <ActionButton
                        title={loading ? "Memperbarui..." : "Perbarui"}
                        disabled={loading}
                        onclick={handleAdjustment}
                    />
                </div>
            )}

            {openDeleteModal && (
                <ConfirmationModal
                    isOpen={openDeleteModal}
                    onClose={() => setOpenDeleteModal(false)}
                    onClick={handleDeleteTransfer}
                    title="Transfer"
                    itemDelete={initialData?.code}
                />
            )}
        </div>
    )
}

export default EntityAdjustment;