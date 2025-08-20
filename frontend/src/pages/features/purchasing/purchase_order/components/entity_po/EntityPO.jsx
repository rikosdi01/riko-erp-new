import { useEffect, useState } from 'react';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './EntityPO.css';
import { Computer, Sheet, KeyRound, ClipboardPen, Users2, AlignHorizontalJustifyCenter, BadgeDollarSign } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';
import { Timestamp } from 'firebase/firestore';
import Formatting from '../../../../../../utils/format/Formatting';
import { ALGOLIA_INDEX_ITEMS, ALGOLIA_INDEX_SUPPLIER, clientItems, clientSupplier, rackIndex } from '../../../../../../../config/algoliaConfig';
import ConfirmationModal from '../../../../../../components/modal/confirmation_modal/ConfirmationModal';
import { useRacks } from '../../../../../../context/warehouse/RackWarehouseContext';
import AdjustmentRepository from '../../../../../../repository/warehouse/AdjustmentRepository';
import ItemsRepository from '../../../../../../repository/warehouse/ItemsRepository';
import { useNavigate } from 'react-router-dom';
import { useFormats } from '../../../../../../context/personalization/FormatContext';
import CounterRepository from '../../../../../../repository/personalization/CounterRepository';
import roleAccess from '../../../../../../utils/helper/roleAccess';
import { useUsers } from '../../../../../../context/auth/UsersContext';
import AccessAlertModal from '../../../../../../components/modal/access_alert_modal/AccessAlertModal';
import ContainerSearch from '../../../../../../components/container/container_search/ContainerSearch';
import Dropdown from '../../../../../../components/select/Dropdown';

const EntityPO = ({
    mode,
    initialData = {},
    onSubmit,
}) => {
    // Context
    const navigate = useNavigate();
    const { loginUser, accessList } = useUsers();
    const { showToast } = useToast();
    const { racks } = useRacks();

    const { formats } = useFormats();
    const formatCode = formats.presets?.purchaseOrder?.code;
    const rackFormat = formats.presets?.purchaseOrder?.[`rack${loginUser?.location}`] || null;
    const yearFormat = formats.yearFormat;
    const monthFormat = formats.monthFormat;
    const uniqueFormat = formats.uniqueFormat;

    const emptyData = [{ item: '', qty: '' }]
    const [code, setCode] = useState(initialData.code || "");
    const [description, setDescription] = useState(initialData.description || "");
    const [items, setItems] = useState(initialData.items || emptyData);
    // const [stock, setStock] = useState(initialData.description || "");
    const [warehouse, setWarehouse] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [supplier, setSupplier] = useState(initialData.supplier || []);

    const [createdAt, setCreatedAt] = useState(initialData.createdAt || '');
    const [codeError, setCodeError] = useState("");
    const [itemError, setItemError] = useState("");
    const [warehouseError, setWarehouseError] = useState("");
    const [supplierError, setSupplierError] = useState('');
    const [loading, setLoading] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const [accessDenied, setAccessDenied] = useState(false);

    const handleRestricedAction = () => {
        setAccessDenied(true);
    }

    useEffect(() => {
        const fetchRack = async () => {
            let locationDefault = loginUser?.location === 'medan' ? 'DgBEKD7U3UJNyQpF31ly' : 'ysbvQlNaWJgWJLPafXCj'

            const { hits } = await rackIndex.search('', {
                filters: `objectID:${locationDefault}`,
            });

            if (hits.length > 0) {
                const rack = hits[0];
                setSelectedWarehouse({
                    id: rack.objectID,
                    name: rack.name,
                    location: rack.location,
                });
            }
        };

        fetchRack();
    }, [rackFormat]);

    useEffect(() => {
        const fetchRack = async () => {
            if (!rackFormat) return;

            const { hits } = await rackIndex.search('', {
                filters: `objectID:${rackFormat}`,
            });

            if (hits.length > 0) {
                const rack = hits[0];
                setSelectedWarehouse({
                    id: rack.objectID,
                    name: rack.name,
                    location: rack.location,
                    category: rack.category || 'Sales', // Tambahkan kategori jika ada
                });
            }
        };

        fetchRack();
    }, [rackFormat]);

    const handleItemChange = (index, field, value) => {
        console.log('index: ', index);
        console.log('field: ', field);
        console.log('value: ', value);

        const updatedItems = [...items];

        if (field === "item") {
            updatedItems[index] = {
                ...updatedItems[index],
                item: value,
                purchasePrice: value?.purchasePrice !== undefined
                    ? Formatting.formatCurrencyIDR(value.purchasePrice)
                    : "",
            }
        } else if (field === "purchasePrice") {
            const raw = value.toString().replace(/[^0-9]/g, "");
            updatedItems[index] = {
                ...updatedItems[index],
                purchasePrice: raw ? Formatting.formatCurrencyIDR(raw) : "",
            };
        } else if (field === "qty") {
            updatedItems[index] = {
                ...updatedItems[index],
                qty: value,
            };
        } else {
            updatedItems[index] = {
                ...updatedItems[index],
                [field]: value ?? "",
            };
        }

        // Tambah baris baru jika baris terakhir sudah lengkap
        const isRowComplete = (row) => row.item && row.qty;
        const isRowFilled = (row) => row.item || row.qty;

        if (isRowComplete(updatedItems[updatedItems.length - 1])) {
            updatedItems.push({ item: "", qty: "", purchasePrice: "" });
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


    useEffect(() => {
        console.log('Racks: ', racks);
        if (racks.length > 0) {
            const racksDropdown = racks.map(rack => ({
                id: rack.id,
                name: rack.name + ' - ' + rack.location,
                category: rack.category,
            }));
            setWarehouse(racksDropdown);
            setSelectedWarehouse(initialData.warehouse?.id || racks[0]?.id || 1);
        }
    }, [racks]);

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
        setWarehouse(racks);
        setSupplier(initialData.supplier || []);
        setSelectedWarehouse(initialData.warehouse?.id || warehouse[0]?.id);
        setCreatedAt(initialData.createdAt
            ? Formatting.formatTimestampToISO(initialData.createdAt)
            : Formatting.formatDateForInput(new Date()));
    }, [initialData]);

    useEffect(() => {
        if (mode === "create" && formatCode) {
            const generate = async () => {
                const newCode = await CounterRepository.previewNextCode(formatCode, uniqueFormat, monthFormat, yearFormat);
                setCode(newCode);
            };

            generate();
        }
    }, []);

    useEffect(() => {
        console.log('Updated Code: ', code);
    }, [code])

    const confirmAutoCode = async (nextCode) => {
        return new Promise((resolve) => {
            const confirmed = window.confirm(`Kode sudah digunakan. Gunakan kode otomatis: ${nextCode}?`);
            resolve(confirmed);
        });
    };

    useEffect(() => {
        console.log('Updated Items: ', items);
    }, [items]);

    const handleAdjustment = async (e) => { // Tambahkan 'e' di sini
        e.preventDefault();
        setLoading(true);

        console.log('Warehouse: ', selectedWarehouse);
        console.log('Supplier Value: ', supplier);

        let valid = true;

        if (!code.trim()) {
            setCodeError('Kode Penyesuaian tidak boleh kosong!');
            valid = false;
        }

        if (!selectedWarehouse) {
            setWarehouseError('Gudang tidak boleh kosong!');
            valid = false;
        }

        if (!supplier || supplier.length === 0) {
            setSupplierError('Supplier tidak boleh kosong!');
            valid = false;
        }


        if (JSON.stringify(items) === JSON.stringify(emptyData)) {
            valid = false;
            setItemError('List Item Penyesuaian tidak boleh kosong!');
        }

        if (!valid) return setLoading(false);

        try {
            const filteredItems = items.filter(item => item.item && item.qty);

            const exists = await AdjustmentRepository.checkAdjExists(
                code.trim(),
                mode === "detail" ? initialData.id : null
            );

            let finalCode = code;

            if (exists) {
                try {
                    const { candidate, nextCandidate, last, formattingCode } = await CounterRepository.getAvailableNextCode(
                        formatCode,
                        uniqueFormat,
                        monthFormat,
                        yearFormat
                    );

                    console.log('Candidate: ', candidate);
                    console.log('Next Candidate: ', nextCandidate);
                    console.log('Last: ', last);
                    console.log('Formatting Code: ', formattingCode);

                    const confirmed = await confirmAutoCode(candidate);
                    if (confirmed) {
                        await CounterRepository.commitNextCode(formattingCode, last);
                        finalCode = candidate; // simpan untuk langsung dipakai
                        lastValue = last;
                        setCode(nextCandidate); // tetap update state
                    } else {
                        showToast("gagal", "Silakan ubah kode penyesuaian secara manual.");
                        return setLoading(false);
                    }
                } catch (e) {
                    console.error(e);
                    showToast("gagal", "Gagal mendapatkan kode baru. Silakan ubah manual.");
                    return setLoading(false);
                }
            }

            const newAdj = {
                code: finalCode,
                supplier,
                description,
                warehouse: selectedWarehouse,
                items: filteredItems,
                totalPrice: totalBiaya,
                location: loginUser?.location || 'unknown',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            };

            console.log('New Adjustment Data: ', newAdj);

            console.log('Login User: ', loginUser);

            try {
                await onSubmit(newAdj, handleReset); // Eksekusi yang berisiko error
                if (mode === "create" && !exists) {
                    const newCode = await CounterRepository.getNextCode(formatCode, uniqueFormat, monthFormat, yearFormat);
                    // console.log('New Code: ', newCode);
                    setCode(newCode);
                }
            } catch (submitError) {
                console.error("Error during onSubmit: ", submitError);
                showToast("gagal", mode === "create" ? "Gagal menyimpan adj!" : "Gagal memperbarui adj!");
                return;
            }

            showToast('berhasil', 'Penyesuaian berhasil ditambahkan!');
        } catch (error) {
            console.error('Terjadi kesalahan: ', error);
            showToast('gagal', 'Gagal menambahkan penyesuaian baru!');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = (e) => {
        setSupplier([]);
        setDescription("");
        setItems(emptyData);
        setSupplierError('');
        setWarehouse('');
        setCodeError("");
        setItemError("");
    }

    // handler delete
    const handleDeleteAdjustment = async () => {
        try {
            const rackName = initialData.warehouse?.name ?? 'Unknown Rack';
            const itemsToRollback = initialData.items || [];

            for (const adjItem of itemsToRollback) {
                const itemId = adjItem.item.id;
                const qty = parseInt(adjItem.qty);

                if (!isNaN(qty) && qty > 0) {
                    // Rollback qty
                    await ItemsRepository.adjustItemStock(itemId, -qty, rackName);
                }
            }

            // Setelah semua stok dikurangi, hapus dokumen adjustment
            await AdjustmentRepository.deleteAdj(initialData.id);
            showToast("berhasil", "Penyesuaian berhasil dihapus!");
            navigate("/inventory/adjustment");
        } catch (error) {
            console.error("Error deleting adjustment: ", error);
            showToast("gagal", "Gagal menghapus Penyesuaian!");
        }
    };

    const loadRackOptions = async (inputValue) => {
        const searchTerm = inputValue || ""; // pastikan tetap "" jika kosong
        const { hits } = await rackIndex.search(searchTerm, {
            hitsPerPage: 10,
            filters: `location: ${loginUser?.location || "Medan"}`,
        });

        return hits.map(hit => ({
            name: hit.name,
            id: hit.objectID || hit.id,
            location: hit.location,
        }));
    };

    const columns = [
        { header: "Nama Supplier", accessor: "name" },
        { header: "No. Telpon", accessor: "phone" },
        { header: "Email", accessor: "email" },
        { header: "Negara", accessor: "state" },
    ]

    useEffect(() => {
        console.log('Items Purchase: ', items);
    }, [items]);

    const totalQty = items.reduce((acc, curr) => {
        return acc + (Number(curr.qty) || 0);
    }, 0);

    const totalBiaya = items.reduce((acc, curr) => {
        // normalisasi harga ke number
        let harga = 0;
        if (typeof curr.purchasePrice === "string") {
            harga = Number(curr.purchasePrice.replace(/[^\d]/g, "")) || 0;
        } else {
            harga = Number(curr.purchasePrice) || 0;
        }

        return acc + (harga * (Number(curr.qty) || 0));
    }, 0);


    return (
        <div className="main-container">
            <ContentHeader title={mode === "create" ? "Tambah Penerimaan Barang" : "Rincian Penerimaan Barang"} />

            <div className='add-container-input'>
                <div>
                    <ContainerSearch
                        label={"Supplier"}
                        icon={<Users2 className='input-icon' />}
                        searchClient={clientSupplier}
                        indexName={ALGOLIA_INDEX_SUPPLIER}
                        columns={columns}
                        value={
                            supplier?.name
                                ? supplier.name
                                : "Pilih Supplier"
                        }

                        setValues={setSupplier}
                        mode="supplier"
                    />
                    {supplierError && <div className="error-message" style={{ marginTop: '-10px' }}>{supplierError}</div>}
                </div>

                <div className='add-container-input'>
                    <InputLabel
                        label="Nomor Pembelian"
                        icon={<KeyRound className='input-icon' />}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                    {codeError && <div className="error-message">{codeError}</div>}
                </div>
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
                        label={'Gudang'}
                        icon={<AlignHorizontalJustifyCenter className='input-icon' />}
                        isAlgoliaDropdown={true}
                        values={loadRackOptions}
                        selectedId={selectedWarehouse}
                        setSelectedId={setSelectedWarehouse}
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
                <div className='list-item-header'>List Pembelian Barang</div>

                {items.map((item, index) => (
                    <div key={index} className="add-container-input-area">
                        <ContainerSearch
                            label={"Item"}
                            icon={<Computer className='input-icon' />}
                            searchClient={clientItems}
                            indexName={ALGOLIA_INDEX_ITEMS}
                            columns={[
                                {
                                    header: 'Kode Item',
                                    accessor: 'itemCode',
                                    renderCell: (_, item) => {
                                        const code = item?.code ?? "";
                                        const categoryCode = item?.category?.code ?? "";
                                        return categoryCode + '-' + code;
                                    }
                                },
                                {
                                    header: 'Nama Item',
                                    accessor: 'category.name',
                                    renderCell: (_, item) => {
                                        const itemName = item?.name ?? "";
                                        const categoryName = item?.category?.name ?? "";
                                        return categoryName + ' - ' + itemName;
                                    }
                                },
                            ]}
                            value={
                                item.item?.category?.name && item.item?.name && item.item?.brand
                                    ? `${item.item.category.name} - ${item.item.name} (${item.item.brand})`
                                    : "Pilih Item"
                            }
                            setValues={(selectedItem) => handleItemChange(index, "item", selectedItem)}
                            enableStock={true}
                            location={loginUser?.location || 'medan'}
                            mode="item"
                        />
                        <InputLabel
                            label="Kuantitas"
                            icon={<Sheet className='input-icon' />}
                            value={item.qty}
                            onChange={(e) => {
                                const onlyNums = e.target.value.replace(/\D/g, ""); // buang semua selain angka
                                handleItemChange(index, "qty", onlyNums);
                            }} />
                        <InputLabel
                            label="Harga"
                            icon={<BadgeDollarSign className='input-icon' />}
                            value={item.purchasePrice}
                            onChange={(e) => handleItemChange(index, "purchasePrice", e.target.value)}
                        />
                    </div>
                ))}
                {itemError && <div className="error-message">{itemError}</div>}
            </div>

            <div className="purchase-totals">
                <div className="total-item">Total Item: {totalQty}</div>
                <div className="total-cost">Total Biaya: {Formatting.formatCurrencyIDR(totalBiaya)}</div>
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
                        onclick={() => roleAccess(accessList, 'menghapus-data-penyesuaian-pesanan') ? setOpenDeleteModal(true) : handleRestricedAction()}
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
                    onClick={handleDeleteAdjustment}
                    title="Penyesuaian"
                    itemDelete={initialData?.code}
                />
            )}

            <AccessAlertModal
                isOpen={accessDenied}
                onClose={() => setAccessDenied(false)}
            />
        </div>
    )
}

export default EntityPO;