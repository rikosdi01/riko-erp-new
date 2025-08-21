import { useEffect, useState } from 'react';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './EntityPO.css';
import { Computer, Sheet, KeyRound, ClipboardPen, Users2, AlignHorizontalJustifyCenter, BadgeDollarSign, PercentCircle } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';
import { Timestamp } from 'firebase/firestore';
import Formatting from '../../../../../../utils/format/Formatting';
import { ALGOLIA_INDEX_ITEMS, ALGOLIA_INDEX_PR, ALGOLIA_INDEX_SUPPLIER, clientItems, clientPR, clientSupplier, rackIndex } from '../../../../../../../config/algoliaConfig';
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
import PurchaseRequestRepository from '../../../../../../repository/purchasing/PurchaseRequestRepository';
import PurchaseOrderRepository from '../../../../../../repository/purchasing/PurchaseOrderRepository';

const EntityPO = ({
    mode,
    initialData = {},
    onSubmit,
}) => {
    console.log('Initial Data PO: ', initialData);
    // Context
    const navigate = useNavigate();
    const { loginUser, accessList } = useUsers();
    const { showToast } = useToast();

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
    const [oldItems, setOldItems] = useState(initialData?.purchaseRequest?.items || []);
    const [changes, setChanges] = useState(initialData.itemChanges || []); // daftar perubahan item
    const [warehouse, setWarehouse] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [purchaseRequest, setPurchaseRequest] = useState(initialData.purchaseRequest || null);
    const [finishModal, setFinishModal] = useState(false);
    const [logisticFinishModal, setLogisticFinishModel] = useState(false);


    const [createdAt, setCreatedAt] = useState(initialData.createdAt || '');
    const [codeError, setCodeError] = useState("");
    const [itemError, setItemError] = useState("");
    const [warehouseError, setWarehouseError] = useState("");
    const [supplierError, setSupplierError] = useState('');
    const [loading, setLoading] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const [accessDenied, setAccessDenied] = useState(false);

    useEffect(() => {
        console.log('Warehouse List: ', warehouse);
    }, [warehouse]);

    useEffect(() => {
        console.log('Selected Warehouse: ', selectedWarehouse);
    }, [selectedWarehouse])

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
    }, []);

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
        } else if (field === "discount") {
            const raw = value.toString().replace(/[^0-9]/g, "");
            updatedItems[index] = {
                ...updatedItems[index],
                discount: raw ? `${raw}%` : "",
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
        setItems(
            (initialData.items || emptyData).map(i => ({
                ...i,
                discount: i.discount
                    ? `${i.discount.toString().replace(/[^0-9]/g, "")}%`
                    : "",
            }))
        );
        setChanges(initialData.itemChanges || []);
        setPurchaseRequest(initialData.purchaseRequest || []);
        setOldItems(initialData?.purchaseRequest?.items || [])
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

    useEffect(() => {
        // console.log('Purchase Request: ',)
    })

    const handleAdjustment = async (status) => { // Tambahkan 'e' di sini
        setLoading(true);

        console.log('Warehouse: ', selectedWarehouse);
        console.log('Supplier Value: ', purchaseRequest);

        let valid = true;

        if (!code.trim()) {
            setCodeError('Kode Penyesuaian tidak boleh kosong!');
            valid = false;
        }

        if (!selectedWarehouse) {
            setWarehouseError('Gudang tidak boleh kosong!');
            valid = false;
        }

        if (!purchaseRequest || purchaseRequest.length === 0) {
            setSupplierError('Supplier tidak boleh kosong!');
            valid = false;
        }


        if (JSON.stringify(items) === JSON.stringify(emptyData)) {
            valid = false;
            setItemError('List Item Penyesuaian tidak boleh kosong!');
        }

        if (!valid) return setLoading(false);

        try {
            const filteredItems = items
                .filter(item => item.item && item.qty)
                .map(item => {
                    let discount = 0;
                    if (typeof item.discount === "string") {
                        discount = Number(item.discount.replace("%", "").trim()) || 0;
                    } else {
                        discount = Number(item.discount) || 0;
                    }

                    return {
                        ...item,
                        discount // simpan dalam bentuk angka (misalnya 50)
                        // kalau mau persentase desimal (misalnya 0.5), ubah jadi: discount / 100
                    };
                });
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
                purchaseRequest,
                description,
                warehouse: selectedWarehouse,
                items: filteredItems,
                itemChanges: changes,
                location: loginUser?.location || 'unknown',
                status: status,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            };

            console.log('New PO Data: ', newAdj);

            try {
                await onSubmit(newAdj, handleReset); // Eksekusi yang berisiko error
                if (mode === "create" && !exists) {
                    const newCode = await CounterRepository.getNextCode(formatCode, uniqueFormat, monthFormat, yearFormat);
                    // console.log('New Code: ', newCode);
                    setCode(newCode);
                }

                await PurchaseRequestRepository.updatePRStatusValue(purchaseRequest.id || purchaseRequest.objectID, 'diproses')
            } catch (submitError) {
                console.error("Error during onSubmit: ", submitError);
                showToast("gagal", mode === "create" ? "Gagal menyimpan penerimaan!" : "Gagal memperbarui penerimaan!");
                return;
            }

            setFinishModal(false);

            if (status === 'diterima') {
                showToast('berhasil', 'Penerimaan berhasil ditambahkan!');
            }
            else {
                showToast('berhasil', 'Penerimaan berhasil diselesaikan!');
            }
        } catch (error) {
            console.error('Terjadi kesalahan: ', error);
            showToast('gagal', 'Gagal menambahkan Penerimaan baru!');
        } finally {
            setLoading(false);
        }
    };

    const handlePurchasingFinish = async () => {
        setLoading(true);
        try {
            const filteredItems = items
                .filter(item => item.item && item.qty)
                .map(item => {
                    let discount = 0;
                    if (typeof item.discount === "string") {
                        discount = Number(item.discount.replace("%", "").trim()) || 0;
                    } else {
                        discount = Number(item.discount) || 0;
                    }

                    return {
                        ...item,
                        discount // simpan dalam bentuk angka (misalnya 50)
                        // kalau mau persentase desimal (misalnya 0.5), ubah jadi: discount / 100
                    };
                });

            const updatedPurchasing = {
                itemAccept: filteredItems,
                status: 'selesai',
                updatedAt: Timestamp.now(),
            };

            console.log('Updated PR Data: ', updatedPurchasing);

            await PurchaseRequestRepository.updatePR(purchaseRequest.id || purchaseRequest.objectID, updatedPurchasing)
            await PurchaseOrderRepository.updatePOStatusValue(initialData.id, 'selesai')
            setLogisticFinishModel(false);

            showToast('berhasil', 'Penerimaan berhasil diselesaikan!');
        } catch (error) {
            console.error('Terjadi kesalahan: ', error);
            showToast('gagal', 'Gagal menyelsaikan Penerimaan baru!');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = (e) => {
        setPurchaseRequest(null);
        setDescription("");
        setItems(emptyData);
        setSupplierError('');
        setChanges([]);
        setOldItems([]);
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

        const rackValues = hits.map(hit => ({
            name: hit.name,
            id: hit.objectID || hit.id,
            location: hit.location,
        }));
        setWarehouse(rackValues);

        return rackValues;
    };

    const columns = [
        { header: "Supplier", accessor: "supplier.name" },
        { header: "No. Pembelian", accessor: "code" },
        {
            header: "Tanggal Pembelian",
            accessor: "createdAt",
            renderCell: (value) => Formatting.formatDateByTimestamp(value)
        },
    ]

    useEffect(() => {
        if (!purchaseRequest) return;

        const prevPR = initialData.purchaseRequest;
        if (!prevPR || JSON.stringify(prevPR) !== JSON.stringify(purchaseRequest)) {
            setDescription(purchaseRequest.description || "");
            setItems(purchaseRequest.items || []);
            setOldItems(purchaseRequest.items || []);
        }
    }, [purchaseRequest, initialData.purchaseRequest]);


    // fungsi untuk tracking perubahan
    const trackChanges = (newItems, oldItems) => {
        console.log('New Items: ', newItems);
        const changes = [];

        // buat map untuk akses cepat item lama berdasarkan id
        const oldMap = new Map(oldItems.map(i => [i.item?.id, i]));

        // cek perubahan & penambahan
        newItems.forEach(newItem => {
            const id = newItem.item?.id;
            const newQty = Number(newItem.qty) || 0;

            if (!id) return;

            if (oldMap.has(id)) {
                const oldQty = Number(oldMap.get(id).qty) || 0;
                if (newQty !== oldQty) {
                    changes.push({
                        item: newItem.item,
                        changeQty: newQty - oldQty // positif kalau nambah, negatif kalau berkurang
                    });
                }
                oldMap.delete(id); // sudah diproses
            } else {
                // item baru
                changes.push({
                    item: newItem.item,
                    changeQty: newQty
                });
            }
        });

        // sisanya di oldMap = item yang dihapus
        oldMap.forEach(oldItem => {
            changes.push({
                item: oldItem.item,
                changeQty: -(Number(oldItem.qty) || 0) // qty negatif
            });
        });

        return changes;
    };

    // jalankan tiap kali items berubah
    useEffect(() => {
        if (!oldItems) return;

        const diff = trackChanges(items, oldItems);
        setChanges(diff);
    }, [items, oldItems]);

    const totalQty = items.reduce((acc, curr) => {
        return acc + (Number(curr.qty) || 0);
    }, 0);

    const totalBiaya = items.reduce((acc, curr) => {
        let harga = 0;
        if (typeof curr.purchasePrice === "string") {
            harga = Number(curr.purchasePrice.replace(/[^\d]/g, "")) || 0;
        } else {
            harga = Number(curr.purchasePrice) || 0;
        }

        return acc + (harga * (Number(curr.qty) || 0));
    }, 0);

    const totalDiskon = items.reduce((acc, curr) => {
        let harga = 0;
        if (typeof curr.purchasePrice === "string") {
            harga = Number(curr.purchasePrice.replace(/[^\d]/g, "")) || 0;
        } else {
            harga = Number(curr.purchasePrice) || 0;
        }

        const qty = Number(curr.qty) || 0;

        // parse discount -> hilangkan '%' kalau ada
        let discount = 0;
        if (typeof curr.discount === "string") {
            discount = Number(curr.discount.replace("%", "").trim()) || 0;
        } else {
            discount = Number(curr.discount) || 0;
        }

        const diskonItem = (harga * qty) * (discount / 100);

        return acc + diskonItem;
    }, 0);

    const totalPembayaran = totalBiaya - totalDiskon;

    return (
        <div className="main-container">
            <ContentHeader title={mode === "create" ? "Tambah Penerimaan Barang" : "Rincian Penerimaan Barang"} />

            <div className='add-container-input'>
                <div>
                    <ContainerSearch
                        label={"Pembelian Barang"}
                        icon={<KeyRound className='input-icon' />}
                        searchClient={clientPR}
                        indexName={ALGOLIA_INDEX_PR}
                        columns={columns}
                        value={
                            purchaseRequest?.code
                                ? purchaseRequest.code + ' (' + purchaseRequest.supplier.name + ')'
                                : "Pilih Pembelian Barang"
                        }

                        setValues={setPurchaseRequest}
                        mode="purchaseRequest"
                        filters={'status: dipesan'}
                    />
                    {supplierError && <div className="error-message" style={{ marginTop: '-10px' }}>{supplierError}</div>}
                </div>

                <div className='add-container-input'>
                    <InputLabel
                        label="Nomor Pembelian"
                        isDisabled={loginUser && loginUser.role === 'Purchasing'}
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
                    isDisabled={loginUser && loginUser.role === 'Purchasing'}
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
                <div className='list-item-header'>List Penerimaan Barang</div>

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
                            stocks={warehouse}
                            stockSelectedId={selectedWarehouse}
                            mode="item"
                        />
                        <InputLabel
                            label="Kuantitas"
                            isDisabled={loginUser && loginUser.role === 'Purchasing'}
                            icon={<Sheet className='input-icon' />}
                            value={item.qty}
                            onChange={(e) => {
                                const onlyNums = e.target.value.replace(/\D/g, ""); // buang semua selain angka
                                handleItemChange(index, "qty", onlyNums);
                            }} />
                        {loginUser && loginUser.role === 'Purchasing' && (
                            <InputLabel
                                label="Harga"
                                icon={<BadgeDollarSign className='input-icon' />}
                                value={item.purchasePrice}
                                onChange={(e) => handleItemChange(index, "purchasePrice", e.target.value)}
                            />
                        )}
                        {loginUser && loginUser.role === 'Purchasing' && (
                            <InputLabel
                                label="Diskon (%)"
                                icon={<PercentCircle className='input-icon' />}
                                value={item.discount}
                                onChange={(e) => handleItemChange(index, "discount", e.target.value)}
                            />
                        )}
                    </div>
                ))}
                {itemError && <div className="error-message">{itemError}</div>}
            </div>

            {changes && changes.length > 0 && (
                <div className="changes-list-container">
                    <div className="changes-list-header">List Perubahan Item</div>
                    <ul className="changes-list">
                        {changes.map((c, idx) => (
                            <li key={idx} className="changes-list-item">
                                <span className="item-name">
                                    {c.item?.category.name} - {c.item?.name} ({c.item?.brand})
                                </span>
                                <span className={`change-qty ${c.changeQty > 0 ? 'positive' : 'negative'}`}>
                                    {c.changeQty > 0 ? `+${c.changeQty}` : c.changeQty}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="purchase-totals">
                <div className="total-item">
                    <span className="total-label">Total Item</span>
                    <span className="total-value">{totalQty}</span>
                </div>
                <div className="total-cost">
                    <span className="total-label">Total Biaya Item</span>
                    <span className="total-value">{Formatting.formatCurrencyIDR(totalBiaya)}</span>
                </div>
                <div className="total-discount">
                    <span className="total-label">Total Diskon</span>
                    <span className="total-value">{Formatting.formatCurrencyIDR(totalDiskon)}</span>
                </div>
                <div className="total-payment">
                    <span className="total-label">Total Pembayaran</span>
                    <span className="total-value">{Formatting.formatCurrencyIDR(totalPembayaran)}</span>
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

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <ActionButton
                            title={loading ? "Menyelesaikan..." : "Selesai"}
                            disabled={loading}
                            onclick={() => setFinishModal(true)}
                        />

                        <ActionButton
                            title={loading ? "Menyimpan..." : "Simpan"}
                            disabled={loading}
                            onclick={() => handleAdjustment('diterima')}
                        />
                    </div>
                </div>
            ) : (
                initialData.status === 'diterima' && loginUser && (loginUser.role === 'Stock Controller' || loginUser.role === 'Stock Controller Supervisor') && (
                    <div className='add-container-actions'>
                        <ActionButton
                            title={"Hapus"}
                            background="linear-gradient(to top right,rgb(241, 66, 66),rgb(245, 51, 51))"
                            color="white"
                            onclick={() => roleAccess(accessList, 'menghapus-data-penyesuaian-pesanan') ? setOpenDeleteModal(true) : handleRestricedAction()}
                        />

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <ActionButton
                                title={loading ? "Menyelesaikan..." : "Selesai"}
                                disabled={loading}
                                onclick={() => setFinishModal(true)}
                            />
                            <ActionButton
                                title={loading ? "Memperbarui..." : "Perbarui"}
                                disabled={loading}
                                onclick={() => handleAdjustment('diterima')}
                            />
                        </div>
                    </div>
                )
            )}

            {initialData.status === 'selesai' && initialData?.purchaseRequest?.status !== 'selesai' && loginUser && loginUser.role === 'Purchasing' && (
                <div className='add-container-actions'>
                    <ActionButton
                        title={"Hapus"}
                        background="linear-gradient(to top right,rgb(241, 66, 66),rgb(245, 51, 51))"
                        color="white"
                        onclick={() => roleAccess(accessList, 'menghapus-data-penyesuaian-pesanan') ? setOpenDeleteModal(true) : handleRestricedAction()}
                    />

                    <ActionButton
                        title={loading ? "Menyelesaikan..." : "Selesai"}
                        disabled={loading}
                        onclick={() => setLogisticFinishModel(true)}
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

            {finishModal && (
                <div className='modal-overlay'>
                    <div className='modal-content'>
                        <div className='modal-confirmation-title'>Apakah kamu yakin ingin menyelesaikan penerimaan ini?</div>
                        <div className='modal-confirmation-subtitle'>Pastikan semua item telah sesuai!</div>
                        <div className='modal-confirmation-actions'>
                            <ActionButton
                                title={'Tidak'}
                                onclick={() => setFinishModal(false)}
                                classname={'btn btn-secondary'}
                            />
                            <ActionButton
                                title={'Ya'}
                                onclick={() => handleAdjustment('selesai')}
                                padding='10px 30px'
                            />
                        </div>
                    </div>
                </div>
            )}

            {logisticFinishModal && (
                <div className='modal-overlay'>
                    <div className='modal-content'>
                        <div className='modal-confirmation-title'>Apakah kamu yakin ingin menyelesaikan penerimaan ini?</div>
                        <div className='modal-confirmation-subtitle'>Pastikan semua item telah sesuai!</div>
                        <div className='modal-confirmation-actions'>
                            <ActionButton
                                title={'Tidak'}
                                onclick={() => setLogisticFinishModel(false)}
                                classname={'btn btn-secondary'}
                            />
                            <ActionButton
                                title={'Ya'}
                                onclick={() => handlePurchasingFinish('selesai')}
                                padding='10px 30px'
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default EntityPO;