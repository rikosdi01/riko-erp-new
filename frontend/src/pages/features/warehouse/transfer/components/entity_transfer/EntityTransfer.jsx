import { useEffect, useState } from 'react';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './EntityTransfer.css';
import { Computer, Sheet, KeyRound, ClipboardPen, Warehouse, PackageOpen, Search } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';
import { Timestamp } from 'firebase/firestore';
import Dropdown from '../../../../../../components/select/Dropdown';
import Formatting from '../../../../../../utils/format/Formatting';
import { productIndex } from '../../../../../../../config/algoliaConfig';
import TransferRepository from '../../../../../../repository/warehouse/TransferRepository';
import ConfirmationModal from '../../../../../../components/modal/confirmation_modal/ConfirmationModal';
import { useRacks } from '../../../../../../context/warehouse/RackWarehouseContext';
import ItemsRepository from '../../../../../../repository/warehouse/ItemsRepository';

const EntityTransfer = ({
    mode,
    initialData = {},
    onSubmit,
}) => {
    console.log('Initial Data: ', initialData);
    // Context
    const { showToast } = useToast();
    const { racks } = useRacks();

    const packingStatusOptions = [
        { id: 1, name: "Sudah Kemas" },
        { id: 2, name: "Belum Kemas" },
    ]

    const filterPackingStatus = packingStatusOptions.find((packingStatus) => packingStatus.name === initialData.packingStatus);
    const defaultPackingStatus = filterPackingStatus?.id || packingStatusOptions[0]?.id || 1;

    const emptyData =
        [{
            item: '',
            qty: '',
            packingStatus: defaultPackingStatus,
            rack: '',
            rackLines: '',
            boxNumber: '',
            trip: '',
            isTaken: false,
        }]

    const [code, setCode] = useState(initialData.code || "");
    const [description, setDescription] = useState(initialData.description || "");
    const [items, setItems] = useState(initialData.items || emptyData);
    const [warehouseFrom, setWarehouseFrom] = useState(initialData.warehouseFrom?.id || '');
    const [warehouseTo, setWarehouseTo] = useState(initialData.warehouseTo?.id || '');
    const [createdAt, setCreatedAt] = useState(initialData.createdAt || Timestamp.now());
    const [codeError, setCodeError] = useState("");
    const [itemError, setItemError] = useState("");
    const [warehouseError, setWarehouseError] = useState("");
    const [loading, setLoading] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [typeList, setTypeList] = useState('in');

    useEffect(() => {
        if (warehouseTo) {
            const racksData = racks.find(wh => wh.id === warehouseTo);
            if (racksData.category === 'Sales Department') {
                setTypeList('out');
            } else {
                setTypeList('in');
            }
        }
    }, [warehouseTo]);

    useEffect(() => {
        console.log('Type List Updated: ', typeList);
    }, [typeList]);

    const handleItemChange = (index, field, value) => {

        const updatedItems = [...items];
        const selectedWarehouseName = racks.find(r => r.id === warehouseFrom)?.name;
        console.log('Racks: ', racks);


        if (field === "item") {
            const racksArray = value?.rack || []; // atau ganti nama jadi value?.racks untuk lebih benar secara grammar

            // Fix: pakai `rack.rack`, bukan `rack.name`
            const matchedRack = racksArray.find(rack => rack.rack === selectedWarehouseName);
            const stockFromThisWarehouse = matchedRack?.stock ?? 0;

            updatedItems[index] = {
                ...updatedItems[index],
                item: value,
                stock: stockFromThisWarehouse,
            };

        } else if (field === "stock") {
            const raw = value.toString().replace(/[^0-9]/g, ""); // hanya angka
            updatedItems[index] = {
                ...updatedItems[index],
                stock: raw ? parseInt(raw) : "",
            };
        } else {
            updatedItems[index] = {
                ...updatedItems[index],
                [field]: value ?? "",
            };
        }

        // Row dianggap lengkap jika 'item' dan 'qty' dan 'rack' terisi
        const isRowComplete = (row) =>
            row.item && row.qty && row.rack;

        // Row dianggap berisi jika ada salah satu field terisi
        const isRowFilled = (row) =>
            row.item || row.qty || row.packingStatus || row.rack || row.rackLines || row.boxNumber || row.trip;

        if (isRowComplete(updatedItems[updatedItems.length - 1])) {
            updatedItems.push({
                item: "", qty: "", stock: "", packingStatus: "", rack: "", rackLines: "", boxNumber: "", trip: ""
            });
        }

        let lastFilledIndex = -1;
        for (let i = 0; i < updatedItems.length; i++) {
            if (isRowFilled(updatedItems[i])) {
                lastFilledIndex = i;
            }
        }

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
        console.log('Updating state with initialData: ', initialData);

        setCode(initialData.code || "");
        setDescription(initialData.description || "");
        setItems(initialData.items || emptyData);
        setWarehouseFrom(initialData.warehouseFrom?.id || '');
        setWarehouseTo(initialData.warehouseTo?.id || '');
        setCreatedAt(initialData.createdAt
            ? Formatting.formatTimestampToISO(initialData.createdAt)
            : Formatting.formatDateForInput(new Date()));
    }, [initialData]);

    const handleWarehouseFromChange = (value) => {
        setWarehouseFrom(value);
        if (value && value === warehouseTo) {
            setWarehouseError("Gudang asal dan tujuan tidak boleh sama!");
        } else {
            setWarehouseError("");
        }
    };

    const handleWarehouseToChange = (value) => {
        setWarehouseTo(value);
        if (value && value === warehouseFrom) {
            setWarehouseError("Gudang asal dan tujuan tidak boleh sama!");
        } else {
            setWarehouseError("");
        }
    };


    const handleTransfer = async (e) => { // Tambahkan 'e' di sini
        e.preventDefault();
        setLoading(true);

        let valid = true;

        if (!code.trim()) {
            setCodeError('Kode Merek tidak boleh kosong!');
            valid = false;
        }

        if (JSON.stringify(items) === JSON.stringify(emptyData)) {
            valid = false;
            setItemError('List Item Transfer tidak boleh kosong!');
        }

        if (!valid) return setLoading(false);

        try {
            const whFrom = racks.find(wh => wh.id === warehouseFrom);
            const whTo = racks.find(wh => wh.id === warehouseTo);

            const filteredWHFrom = {
                id: whFrom.id,
                name: whFrom.name,
                category: whFrom.category,
            };

            const filteredWHTo = {
                id: whTo.id,
                name: whTo.name,
                category: whTo.category,
            };

            // Tambahkan isTaken hanya jika kondisi terpenuhi
            const shouldAddIsTaken = ["F7", "Depo"].includes(whTo.category);
            console.log("shouldAddIsTaken:", shouldAddIsTaken, "| whTo.name:", whTo.category);

            const filteredItems = items
                .filter(item => item?.item != null && Number(item.qty) > 0)
                .map((item, i) => {
                    const packingStatusName = packingStatusOptions.find(
                        (ps) => ps.id === item.packingStatus
                    )?.name || "Sudah Kemas";

                    const result = {
                        ...item,
                        packingStatus: packingStatusName,
                        ...(shouldAddIsTaken && { isTaken: false }),
                        ...(shouldAddIsTaken && { hasIsTaken: true }),
                    };

                    console.log(`Item #${i + 1}:`, result);

                    if (shouldAddIsTaken && !('isTaken' in result)) {
                        console.warn("isTaken tidak berhasil ditambahkan!", result);
                    }

                    return result;
                });


            const exists = await TransferRepository.checkTransferExists(
                code.trim(),
                mode === "detail" ? initialData.id : null
            );

            if (exists) {
                showToast("gagal", "Kode Transferan sudah digunakan!");
                return setLoading(false);
            }

            const createdAtDate = createdAt ? new Date(createdAt) : new Date();

            const newTransfers = {
                code,
                description,
                items: filteredItems,
                warehouseFrom: filteredWHFrom,
                warehouseTo: filteredWHTo,
                createdAt: Timestamp.fromDate(createdAtDate),
                updatedAt: Timestamp.now(),
            };

            console.log('New Transfer: ', newTransfers);

            try {
                await onSubmit(newTransfers, resetForm); // Eksekusi yang berisiko error
                for (const item of filteredItems) {
                    const itemId = item.item.id;
                    const fromRack = filteredWHFrom.name;
                    const toRack = filteredWHTo.name; // nama rak tujuan di input user
                    const qty = parseInt(item.qty);

                    if (!isNaN(qty) && qty > 0) {
                        try {
                            await ItemsRepository.transferItemStock(itemId, fromRack, toRack, qty);
                        } catch (err) {
                            console.error(`Gagal mentransfer stok untuk item ${itemId}:`, err);
                        }
                    }
                }

            } catch (submitError) {
                console.error("Error during onSubmit: ", submitError);
                showToast("gagal", mode === "create" ? "Gagal menyimpan transfer!" : "Gagal memperbarui transfer!");
                return;
            }

            showToast('berhasil', 'Transferan berhasil ditambahkan!');
        } catch (error) {
            console.error('Terjadi kesalahan: ', error);
            showToast('gagal', 'Gagal menambahkan transferan baru!');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {

    }

    const handleReset = (e) => {
        setCode("");
        setDescription("");
        setItems(emptyData);
        setWarehouseFrom("");
        setWarehouseTo("");
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
            rack: hit.racks,
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
            <ContentHeader
                title={mode === "create" ? "Tambah Pemindahan Stok" : "Rincian Pemindahan Stok"}
                enablePrint={true}
            />

            <div className='add-container-input'>
                <InputLabel
                    label="Nomor Transferan"
                    icon={<KeyRound className='input-icon' />}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
                {codeError && <div className="error-message">{codeError}</div>}
            </div>

            <div className='add-container-input-attribute'>
                <Dropdown
                    values={racks}
                    selectedId={warehouseFrom}
                    setSelectedId={handleWarehouseFromChange}
                    label="Gudang Asal"
                    icon={<Warehouse className="input-icon" />}
                />

                <Dropdown
                    values={racks}
                    selectedId={warehouseTo}
                    setSelectedId={handleWarehouseToChange}
                    label="Gudang Tujuan"
                    icon={<Warehouse className="input-icon" />}
                />
                {warehouseError && <div className="error-message">{warehouseError}</div>}
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
                    value={createdAt}
                    onChange={(e) => setCreatedAt(e.target.value)}
                />
            </div>

            <div className='divider'></div>

            <div className='list-item-container'>
                <div className='list-item-wrapper'>
                    <div className='list-item-header'>List Pemindahan</div>

                    {typeList === 'in' ? (
                        items.map((item, index) => (
                            <div key={index} className="add-container-input-area-horizontal">
                                <Dropdown
                                    isAlgoliaDropdown={true}
                                    values={loadItemOptions}
                                    selectedId={item.item}
                                    setSelectedId={(value) => handleItemChange(index, "item", value)}
                                    label="Pilih Item"
                                    icon={<Computer className="input-icon" />}
                                />
                                <InputLabel
                                    label="Total Stok"
                                    icon={<Computer className='input-icon' />}
                                    value={item.stock}
                                    isDisabled={true}
                                    onChange={(e) => handleItemChange(index, "stock", e.target.value)}
                                />
                                <InputLabel
                                    label="Kuantitas"
                                    icon={<Sheet className='input-icon' />}
                                    value={item.qty}
                                    onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                                />
                                <Dropdown
                                    values={packingStatusOptions}
                                    selectedId={item.packingStatus}
                                    setSelectedId={(value) => handleItemChange(index, "packingStatus", value)}
                                    label="Status Paking"
                                    icon={<PackageOpen className="input-icon" />}
                                />
                                <InputLabel
                                    label="Rak"
                                    icon={<ClipboardPen className='input-icon' />}
                                    value={item.rack}
                                    onChange={(e) => handleItemChange(index, "rack", e.target.value)}
                                />
                                <InputLabel
                                    label="Baris Rak"
                                    icon={<ClipboardPen className='input-icon' />}
                                    value={item.rackLines}
                                    onChange={(e) => handleItemChange(index, "rackLines", e.target.value)}
                                />
                                <InputLabel
                                    label="Nomor Kotak"
                                    icon={<ClipboardPen className='input-icon' />}
                                    value={item.boxNumber}
                                    onChange={(e) => handleItemChange(index, "boxNumber", e.target.value)}
                                />
                                <InputLabel
                                    label="Partai"
                                    icon={<ClipboardPen className='input-icon' />}
                                    value={item.trip}
                                    onChange={(e) => handleItemChange(index, "trip", e.target.value)}
                                />
                                {/* {itemError && <div className="error-message">{itemError}</div>} */}
                            </div>
                        ))
                    ) : (
                        items.map((item, index) => (
                            <div key={index} className="add-container-input-area-horizontal">
                                <InputLabel
                                    label="Cari Item"
                                    icon={<Computer className='input-icon' />}
                                    value={item.stock}
                                    isDisabled={true}
                                    onChange={(e) => handleItemChange(index, "stock", e.target.value)}
                                />
                                <InputLabel
                                    label="Total Stok"
                                    icon={<Computer className='input-icon' />}
                                    value={item.stock}
                                    isDisabled={true}
                                    onChange={(e) => handleItemChange(index, "stock", e.target.value)}
                                />
                                <InputLabel
                                    label="Kuantitas"
                                    icon={<Sheet className='input-icon' />}
                                    value={item.qty}
                                    onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                                />
                                <Dropdown
                                    values={packingStatusOptions}
                                    selectedId={item.packingStatus}
                                    setSelectedId={(value) => handleItemChange(index, "packingStatus", value)}
                                    label="Status Paking"
                                    icon={<PackageOpen className="input-icon" />}
                                />
                                <InputLabel
                                    label="Rak"
                                    icon={<ClipboardPen className='input-icon' />}
                                    value={item.rack}
                                    onChange={(e) => handleItemChange(index, "rack", e.target.value)}
                                />
                                <InputLabel
                                    label="Baris Rak"
                                    icon={<ClipboardPen className='input-icon' />}
                                    value={item.rackLines}
                                    onChange={(e) => handleItemChange(index, "rackLines", e.target.value)}
                                />
                                <InputLabel
                                    label="Nomor Kotak"
                                    icon={<ClipboardPen className='input-icon' />}
                                    value={item.boxNumber}
                                    onChange={(e) => handleItemChange(index, "boxNumber", e.target.value)}
                                />
                                <InputLabel
                                    label="Partai"
                                    icon={<ClipboardPen className='input-icon' />}
                                    value={item.trip}
                                    onChange={(e) => handleItemChange(index, "trip", e.target.value)}
                                />
                                {/* {itemError && <div className="error-message">{itemError}</div>} */}
                            </div>
                        ))
                    )}
                </div>
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
                        onclick={handleTransfer}
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
                        onclick={handleTransfer}
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

export default EntityTransfer;