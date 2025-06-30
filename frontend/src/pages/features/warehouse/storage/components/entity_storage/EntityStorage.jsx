import { useEffect, useState } from 'react';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './EntityStorage.css';
import { KeyRound, Scale, Computer, Binary, Sheet, MapPinHouse, ListEnd, PackageOpen, Warehouse } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';
import { Timestamp } from 'firebase/firestore';
import Dropdown from '../../../../../../components/select/Dropdown';
import ItemsRepository from '../../../../../../repository/warehouse/ItemsRepository';
import ConfirmationModal from '../../../../../../components/modal/confirmation_modal/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { useRacks } from '../../../../../../context/warehouse/RackWarehouseContext';
import InventoryRepository from '../../../../../../repository/warehouse/InventoryRepository';

const EntityStorage = ({
    mode,
    initialData = {},
    onSubmit,
}) => {
    console.log('Initial Data: ', initialData);
    const { showToast } = useToast();
    const navigate = useNavigate();
    const racksData = useRacks();

    console.log('Rack Data: ', racksData);
    console.log('Warehouse: ', initialData?.warehouseTo?.category);

    const [code, setCode] = useState(initialData.transferCode || "");
    const [item, setItem] = useState(initialData?.item?.name || '');
    const [quantity, setQuantity] = useState(initialData.qty || 0);
    const [rack, setRack] = useState(initialData.rack || "");
    const [rackLines, setRackLines] = useState(initialData.rackLines || "");
    const [boxNumber, setBoxNumber] = useState(initialData.boxNumber || "");
    const [trip, setTrip] = useState(initialData.trip || "");
    const [packingStatus, setPackingStatus] = useState(initialData.packingStatus || '');
    const [warehouse, setWarehouse] = useState(initialData?.warehouseTo?.category || '');
    const [selectedWarehouse, setSelectedWarehouse] = useState("");
    const [createdAt, setCreatedAt] = useState(initialData.createdAt || Timestamp.now());
    const [userId, setUserId] = useState(initialData.userId || `guest-${Date.now()}`);
    const [codeError, setCodeError] = useState("");
    const [itemsError, setItemsError] = useState("");
    const [quantityError, setQuantityError] = useState("");
    const [rackError, setRackError] = useState("");
    const [loading, setLoading] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    
    // Fetch Initial Data
    useEffect(() => {
        if (!initialData || Object.keys(initialData).length === 0) return;

        setCode(initialData.transferCode || "");
        setItem(initialData?.item?.name || '');
        setQuantity(initialData.qty || 0);
        setRack(initialData.rack || "");
        setRackLines(initialData.rackLines || "");
        setBoxNumber(initialData.boxNumber || "");
        setTrip(initialData.trip || "");
        setPackingStatus(initialData.packingStatus || '');
        setWarehouse(initialData?.warehouseTo?.category || '');
        setSelectedWarehouse(initialData?.warehouseTo?.category || '');
        setCreatedAt(initialData.createdAt || Timestamp.now());
        setUserId(initialData.userId || `guest-${Date.now()}`);
    }, [initialData]);

    const handleStorage = async (e) => { // Tambahkan 'e' di sini
        e.preventDefault();
        setLoading(true);

        let valid = true;

        if (!code.trim()) {
            setCodeError('Kode Penyimpanan tidak boleh kosong!');
            valid = false;
        }

        if (quantity <= 0) {
            setQuantityError('Quantitas tidak boleh kosong atau lebih kecil dari 0!');
            valid = false;
        }

        if (!rack.trim()) {
            setRackError('Rak tidak boleh kosong!');
            valid = false;
        }

        if (!valid) return setLoading(false);

        try {
            const selectedWarehouseData = racksData.racks.find(rack => rack.id === selectedWarehouse);
            const selectedPackingStatus = packingStatusOptions.find(packing => packing.id === packingStatus);

            const exists = await InventoryRepository.checkInventoryCodeExists(
                code.trim(),
                mode === "detail" ? initialData.id : null
            );

            if (exists) {
                showToast("gagal", "Kode Penyimpanan sudah digunakan!");
                return setLoading(false);
            }

            const newInventory = {
                code,
                items,
                quantity: parseInt(quantity) || 0,
                rack,
                rackLines,
                boxNumber,
                trip,
                packingStatus: selectedPackingStatus.name,
                warehouse: selectedWarehouseData,
                createdAt: createdAt,
                updatedAt: Timestamp.now(),
                userId
            };

            console.log('New Inventory: ', newInventory);

            try {
                await onSubmit(newInventory, handleReset);
            } catch (submitError) {
                console.error('Error during submit: ', submitError);
                showToast('gagal', mode === "create" ? 'Gagal menambahkan Penyimpanan!' : 'Gagal memperbarui Penyimpanan!');
                return setLoading(false);
            }

            showToast('berhasil', mode === "create" ? 'Penyimpanan berhasil ditambahkan!' : 'Penyimpanan berhasil diperbarui!');
        } catch (error) {
            console.error('Terjadi kesalahan: ', error);
            showToast('gagal', mode === "create" ? 'Gagal menambahkan Penyimpanan!' : 'Gagal memperbarui Penyimpanan!');
        } finally {
            setLoading(false);
        }
    };


    const handleReset = () => {
        setCode("");
        setItem([]);
        setQuantity(0);
        setRack("");
        setRackLines("");
        setBoxNumber("");
        setTrip("");
        setCodeError("");
        setItemsError("");
        setQuantityError("");
        setRackError("");
    }

    // handler delete
    const handleDeleteItem = async () => {
        try {
            await ItemsRepository.deleteItem(initialData.id);
            showToast("berhasil", "Penyimpanan berhasil dihapus!");
            navigate("/inventory/items");
        } catch (error) {
            console.error("Error deleting item: ", error);
            showToast("gagal", "Gagal menghapus Penyimpanan!");
        }
    }


    return (
        <div className="main-container">
            <ContentHeader title={mode === "create" ? "Tambah Penyimpanan" : "Rincian Penyimpanan"} />

            <div className='add-container-input'>
                <InputLabel
                    label="Kode Penyimpanan"
                    icon={<KeyRound className='input-icon' />}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
                {codeError && <div className="error-message">{codeError}</div>}
            </div>

            <div className='add-container-input'>
                <InputLabel
                    label="Pilih Item"
                    icon={<Computer className='input-icon' />}
                    value={item}
                    onChange={(e) => setItem(e.target.value)}
                />
                {itemsError && <div className="error-message">{itemsError}</div>}
            </div>

            <div className='add-container-input-attribute'>
                <div>
                    <InputLabel
                        label="Kuantitas"
                        icon={<Sheet className='input-icon' />}
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                    />
                    {quantityError && <div className="error-message">{quantityError}</div>}
                </div>

                <InputLabel
                    label="Status Barang"
                    icon={<PackageOpen className='input-icon' />}
                    value={packingStatus}
                    onChange={(e) => setPackingStatus(e.target.value)}
                />
            </div>

            <div className='add-container-input-attribute'>
                <div>
                    <InputLabel
                        label="Rak"
                        icon={<MapPinHouse className='input-icon' />}
                        value={rack}
                        onChange={(e) => setRack(e.target.value)}
                    />
                    {rackError && <div className="error-message">{rackError}</div>}
                </div>

                <InputLabel
                    label="Baris Rak"
                    icon={<ListEnd className='input-icon' />}
                    value={rackLines}
                    onChange={(e) => setRackLines(e.target.value)}
                />
            </div>

            <div className='add-container-input-attribute'>
                <InputLabel
                    label="Nomor Kotak"
                    icon={<Binary className='input-icon' />}
                    value={boxNumber}
                    onChange={(e) => setBoxNumber(e.target.value)}
                />

                <InputLabel
                    label="Partai"
                    icon={<Scale className='input-icon' />}
                    value={trip}
                    onChange={(e) => setTrip(e.target.value)}
                />
            </div>

            <div className='add-container-input'>
                <InputLabel
                    label="Gudang"
                    icon={<Warehouse className='input-icon' />}
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                />
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
                        onclick={handleStorage}
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
                        onclick={handleStorage}
                    />
                </div>
            )}

            {openDeleteModal && (
                <ConfirmationModal
                    isOpen={openDeleteModal}
                    onClose={() => setOpenDeleteModal(false)}
                    onClick={handleDeleteItem}
                    title="Kategori"
                    itemDelete={initialData.category?.name + ' - ' + name}
                />
            )}
        </div>
    )
}

export default EntityStorage;