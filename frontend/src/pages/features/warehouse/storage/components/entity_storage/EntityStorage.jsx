import { useEffect, useState } from 'react';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './EntityStorage.css';
import { PackagePlus, KeyRound, LayoutGrid, CarFront, BadgeDollarSign, Scale, Computer, Binary, Sheet, MapPinHouse, ListEnd, PackageOpenIcon, PackageOpen, Warehouse } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';
import { Timestamp } from 'firebase/firestore';
import Dropdown from '../../../../../../components/select/Dropdown';
import { categoryIndex, productIndex } from '../../../../../../../config/algoliaConfig';
import Formatting from '../../../../../../utils/format/Formatting';
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
    const { showToast } = useToast();
    const navigate = useNavigate();
    const racksData = useRacks();

    const packingStatusOptions = [
        { id: 1, name: "Sudah Kemas" },
        { id: 2, name: "Belum Kemas" },
    ]

    const filterPackingStatus = packingStatusOptions.find((packingStatus) => packingStatus.name === initialData.packingStatus);
    const defaultPackingStatus = filterPackingStatus?.id || packingStatusOptions[0]?.id || 1;

    const [code, setCode] = useState(initialData.code || "");
    const [items, setItems] = useState(initialData.items || []);
    const [quantity, setQuantity] = useState(initialData.quantity || 0);
    const [rack, setRack] = useState(initialData.rack || "");
    const [rackLines, setRackLines] = useState(initialData.rackLines || "");
    const [boxNumber, setBoxNumber] = useState(initialData.boxNumber || "");
    const [trip, setTrip] = useState(initialData.trip || "");
    const [packingStatus, setPackingStatus] = useState(defaultPackingStatus);
    const [warehouse, setWarehouse] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState("");
    const [createdAt, setCreatedAt] = useState(initialData.createdAt || Timestamp.now());
    const [userId, setUserId] = useState(initialData.userId || `guest-${Date.now()}`);
    const [codeError, setCodeError] = useState("");
    const [itemsError, setItemsError] = useState("");
    const [quantityError, setQuantityError] = useState("");
    const [rackError, setRackError] = useState("");
    const [loading, setLoading] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    useEffect(() => {
        if (racksData.racks.length > 0) {
            const racksDropdown = racksData.racks.map(rack => ({
                id: rack.id,
                name: rack.name,
            }));
            setWarehouse(racksDropdown);
            setSelectedWarehouse(initialData.warehouse?.id || racksDropdown[0]?.id || 1);
        }
    }, [racksData]);

    // Fetch Initial Data
    useEffect(() => {
        if (!initialData || Object.keys(initialData).length === 0) return;

        setCode(initialData.code || "");
        setItems(initialData.items || []);
        setQuantity(initialData.quantity || 0);
        setRack(initialData.rack || "");
        setRackLines(initialData.rackLines || "");
        setBoxNumber(initialData.boxNumber || "");
        setTrip(initialData.trip || "");
        setPackingStatus(defaultPackingStatus);
        setWarehouse(warehouse);
        setSelectedWarehouse(initialData.warehouse?.id || racks[0].id || 1);
        setCreatedAt(initialData.createdAt || Timestamp.now());
        setUserId(initialData.userId || `guest-${Date.now()}`);
    }, [initialData]);

    const loadItemOptions = async (inputValue) => {
        const searchTerm = inputValue || ""; // pastikan tetap "" jika kosong
        const { hits } = await productIndex.search(searchTerm, {
            hitsPerPage: 10,
        });

        console.log(hits);

        return hits.map(hit => ({
            name: hit.category.name + ' - ' + hit.name + ' (' + hit.brand + ')',
            code: hit.category.code + '-' + hit.code,
            id: hit.objectID,
        }));
    };

    const handleStorage = async (e) => { // Tambahkan 'e' di sini
        e.preventDefault();
        setLoading(true);

        let valid = true;

        if (!code.trim()) {
            setCodeError('Kode Penyimpanan tidak boleh kosong!');
            valid = false;
        }

        if (!items || items.length === 0) {
            setItemsError('Item tidak boleh kosong!');
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
        setItems([]);
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
                <Dropdown
                    isAlgoliaDropdown={true}
                    values={loadItemOptions}
                    selectedId={items}
                    setSelectedId={setItems}
                    label="Pilih Item"
                    icon={<Computer className="input-icon" />}
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

                <Dropdown
                    values={packingStatusOptions}
                    selectedId={packingStatus}
                    setSelectedId={setPackingStatus}
                    label="Pilih Status Paking"
                    icon={<PackageOpen className="input-icon" />}
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
                <Dropdown
                    values={warehouse}
                    selectedId={selectedWarehouse}
                    setSelectedId={setSelectedWarehouse}
                    label="Pilih Gudang"
                    icon={<Warehouse className="input-icon" />}
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