import { useEffect, useState } from 'react';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './EntitySalesOrder.css';
import { Computer, Sheet, KeyRound, ClipboardPen, Warehouse, BadgeDollarSign, PercentCircle, Store } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';
import { Timestamp } from 'firebase/firestore';
import Dropdown from '../../../../../../components/select/Dropdown';
import Formatting from '../../../../../../utils/format/Formatting';
import { ALGOLIA_INDEX_CUSTOMERS, ALGOLIA_INDEX_ITEMS, clientCustomers, clientItems, customerIndex, productIndex, rackIndex } from '../../../../../../../config/algoliaConfig';
import ConfirmationModal from '../../../../../../components/modal/confirmation_modal/ConfirmationModal';
import { useRacks } from '../../../../../../context/warehouse/RackWarehouseContext';
import SalesOrderRepository from '../../../../../../repository/sales/SalesOrderRepository';
import SalesOrderPrintPreview from '../sales_order_print_preview/SalesOrderPrintPreview';
import { useUsers } from '../../../../../../context/auth/UsersContext';
import roleAccess from '../../../../../../utils/helper/roleAccess';
import AccessAlertModal from '../../../../../../components/modal/access_alert_modal/AccessAlertModal';
import { useFormats } from '../../../../../../context/personalization/FormatContext';
import CounterRepository from '../../../../../../repository/personalization/CounterRepository';
import ContainerSearch from '../../../../../../components/container/container_search/ContainerSearch';

const EntitySalesOrder = ({
    mode,
    initialData = {},
    onSubmit,
}) => {
    const { loginUser, accessList } = useUsers();
    console.log('Login User: ', loginUser);
    console.log('Initial Data: ', initialData);
    // Context
    const { showToast } = useToast();
    const { racks } = useRacks();
    const { formats } = useFormats();
    const formatCode = formats.presets?.sales?.code;
    const rackFormat = formats.presets?.sales?.[`rack${loginUser?.location}`] || null;
    const yearFormat = formats.yearFormat;
    const monthFormat = formats.monthFormat;
    const uniqueFormat = formats.uniqueFormat;

    const emptyData = [{
        item: '',
        qty: '',
        price: '',
        discount: '',
    }]
    const [customer, setCustomer] = useState(initialData.customer || []);
    const [code, setCode] = useState(initialData.code || "");
    const [description, setDescription] = useState(initialData.description || "");
    const [items, setItems] = useState(initialData.items || emptyData);
    const [warehouse, setWarehouse] = useState(initialData.warehouse || []);
    const [selectedWarehouse, setSelectedWarehouse] = useState(initialData.warehouse || []);
    const [createdAt, setCreatedAt] = useState(initialData.createdAt || '');
    const [isPrint, setIsPrint] = useState(initialData.isPrint || '');
    const [codeError, setCodeError] = useState("");
    const [itemError, setItemError] = useState("");
    const [warehouseError, setWarehouseError] = useState("");
    const [loading, setLoading] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);

    useEffect(() => {
        console.log('Items: ', items);
    }, [items]);

    useEffect(() => {
        const fetchRack = async () => {
            console.log('Rack Format: ', rackFormat)
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
                    category: rack.category,
                });
            }
        };

        fetchRack();
    }, [rackFormat]);

    useEffect(() => {
        console.log('Rack Format: ', rackFormat);
    }, [rackFormat]);

    useEffect(() => {
        console.log('Selected Warehouse: ', selectedWarehouse);
    }, [selectedWarehouse]);

    useEffect(() => {
        console.log('Customer: ', customer);
    }, [customer]);

    const handleRestricedAction = () => {
        setAccessDenied(true);
    }

    const handleItemChange = (index, field, value) => {
        console.log('index: ', index);
        console.log('field: ', field);
        console.log('value: ', value);

        const updatedItems = [...items];

        if (field === "item") {
            updatedItems[index] = {
                ...updatedItems[index],
                item: value,
                price: value?.price !== undefined ? Formatting.formatCurrencyIDR(value.price) : "",
            };
        } else if (field === "price") {
            const raw = value.toString().replace(/[^0-9]/g, "");
            updatedItems[index] = {
                ...updatedItems[index],
                price: raw ? Formatting.formatCurrencyIDR(raw) : "",
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
            updatedItems.push({ item: "", qty: "", price: "", discount: "" });
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
        if (mode === "create" && formatCode) {
            const generate = async () => {
                const newCode = await CounterRepository.previewNextCode(formatCode, uniqueFormat, monthFormat, yearFormat);
                setCode(newCode);
                setPreviewCode(newCode);
            };

            generate();
        }
    }, []); // ⛔️ Hilangkan dependensi `code` agar tidak dipanggil ulang


    // Hanya jalan sekali saat komponen pertama kali dimount
    useEffect(() => {
        if (!initialData || Object.keys(initialData).length === 0) {
            setCreatedAt(Formatting.formatDateForInput(new Date()));
        }
    }, []); // kosong -> hanya jalan sekali saat mount


    // 🔁 Sinkronkan initialData ke state setiap kali initialData berubah
    useEffect(() => {
        if (!initialData || Object.keys(initialData).length === 0) return;

        setCustomer(initialData.customer || []);
        setCode(initialData.code || "");
        setDescription(initialData.description || "");
        setItems(initialData.items || emptyData);
        setWarehouse(racks);
        setSelectedWarehouse(initialData.warehouse || []);
        setIsPrint(initialData.isPrint || '');
        setCreatedAt(initialData.createdAt
            ? Formatting.formatTimestampToISO(initialData.createdAt)
            : Formatting.formatDateForInput(new Date()));
    }, [initialData]);


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

    useEffect(() => {
        if (mode === "create" && formatCode) {
            const generate = async () => {
                const newCode = await CounterRepository.previewNextCode(formatCode, uniqueFormat, monthFormat, yearFormat);
                setCode(newCode);
            };

            generate();
        }
    }, []);


    const handleSalesOrder = async (e) => { // Tambahkan 'e' di sini
        e.preventDefault();
        setLoading(true);
        console.log('Warehouse: ', warehouse);

        let valid = true;

        if (!code.trim()) {
            setCodeError('Kode Penyesuaian tidak boleh kosong!');
            valid = false;
        }

        if (!selectedWarehouse) {
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
            const cleanedItems = filteredItems.map(item => ({
                item: {
                    id: item.item?.id,
                    code: item.item?.category?.code + '-' + item.item?.code,
                    name: item.item?.category?.name + ' - ' + item.item?.name + (item.item?.brand ? ` (${item.item.brand})` : ''),
                },
                qty: parseInt(item.qty.toString().replace(/[^0-9]/g, ""), 10) || 0,
                price: parseInt(item.price.toString().replace(/[^0-9]/g, ""), 10) || 0,
                discount: parseFloat(
                    (item.discount || "0").toString().replace(/[^0-9.]/g, "")
                ) / 100 || 0,
            }));

            console.log('cleanedItems: ', cleanedItems);

            const exists = await SalesOrderRepository.checkSalesOrderExists(
                code.trim(),
                mode === "detail" ? initialData.id : null
            );

            let finalCode = code;
            let lastValue = 0;

            if (exists) {
                try {
                    const { candidate, nextCandidate, last, formattingCode } = await CounterRepository.getAvailableNextCode(
                        formatCode,
                        uniqueFormat,
                        monthFormat,
                        yearFormat
                    );

                    const confirmed = await confirmAutoCode(candidate);
                    if (confirmed) {
                        await CounterRepository.commitNextCode(formattingCode, last);
                        finalCode = candidate; // simpan untuk langsung dipakai
                        lastValue = last;
                        setCode(nextCandidate); // tetap update state
                    } else {
                        showToast("gagal", "Silakan ubah kode pesanan secara manual.");
                        return setLoading(false);
                    }
                } catch (e) {
                    console.error(e);
                    showToast("gagal", "Gagal mendapatkan kode baru. Silakan ubah manual.");
                    return setLoading(false);
                }
            }

            const newSalesOrder = {
                customer,
                code: finalCode,
                description,
                items: cleanedItems,
                warehouse: selectedWarehouse,
                isPrint: false,
                totalPrice: cleanedItems.reduce((total, item) => {
                    const discountedPrice = item.price * (1 - item.discount); // Harga setelah diskon
                    return total + (discountedPrice * item.qty);
                }, 0),
                status: 'Mengantri',
                createdAt: Timestamp.fromDate(new Date(createdAt)),
                updatedAt: Timestamp.now(),
            };

            console.log('New Sales Order Data: ', newSalesOrder);

            try {
                await onSubmit(newSalesOrder, handleReset); // Eksekusi yang berisiko error
                if (mode === "create" && !exists) {
                    const newCode = await CounterRepository.getNextCode(formatCode, uniqueFormat, monthFormat, yearFormat);
                    console.log('New Code: ', newCode);
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
            showToast('gagal', 'Gagal menambahkan merek baru!');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = (e) => {
        setCustomer([]);
        setCode("");
        setDescription("");
        setItems(emptyData);
        setCodeError("");
        setItemError("");
        setWarehouseError("");
    }

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


    // handler delete
    const handleDeleteSalesOrder = async () => {
        try {
            await SalesOrderRepository.deleteSalesOrder(initialData.id);
            showToast("berhasil", "Pesanan berhasil dihapus!");
            navigate("/inventory/sales-order");
        } catch (error) {
            console.error("Error deleting order: ", error);
            showToast("gagal", "Gagal menghapus pesanan!");
        }
    }


    return (
        <div className="main-container">
            <ContentHeader
                title={mode === "create" ? "Tambah Pesanan" : "Rincian Pesanan"}
                enablePrint={true}
                setShowPreview={setShowPreview}
            />

            <SalesOrderPrintPreview
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                data={{
                    customer,
                    code,
                    description,
                    items,
                    warehouse,
                    createdAt,
                }}
            />

            <div className='add-container-input'>
                <ContainerSearch
                    label={"Pelanggan"}
                    icon={<Computer className='input-icon' />}
                    searchClient={clientCustomers}
                    indexName={ALGOLIA_INDEX_CUSTOMERS}
                    columns={[
                        { header: 'Nama Pelanggan', accessor: 'name' },
                        { header: 'Alamat', accessor: 'address' },
                        { header: 'Kota', accessor: 'city' },
                        { header: 'Provinsi', accessor: 'province' },
                        { header: 'No. Telpon', accessor: 'phone' },
                        { header: 'Sales', accessor: 'salesman.name' },
                    ]}
                    value={
                        customer?.name
                            ? `${customer.name}${customer.salesman ? ` (${customer.salesman})` : ''}`
                            : "Pilih Pelanggan"
                    }
                    setValues={setCustomer}
                    mode="customer"
                />
                <InputLabel
                    label="Nomor Pesanan"
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
                        isAlgoliaDropdown={true}
                        values={loadRackOptions}
                        selectedId={selectedWarehouse}
                        setSelectedId={setSelectedWarehouse}
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
                <div className='list-item-header'>List Pesanan</div>

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
                                item.item?.name
                                    ? `${item.item?.category?.name ? item.item?.category?.name + ' - ' : ''} ${item.item?.name || ''} (${item.item?.brand || ''})`
                                    : "Pilih Item"
                            }
                            setValues={(selectedItem) => handleItemChange(index, "item", selectedItem)}
                            enableStock={true}
                            stocks={racks || []}
                            stockSelectedId={selectedWarehouse}
                            mode="item"
                        />
                        <InputLabel
                            label="Kuantitas"
                            icon={<Sheet className='input-icon' />}
                            value={item.qty}
                            onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                        />
                        <InputLabel
                            label="Harga"
                            icon={<BadgeDollarSign className='input-icon' />}
                            value={item.price}
                            onChange={(e) => handleItemChange(index, "price", e.target.value)}
                        />
                        <InputLabel
                            label="Diskon"
                            icon={<PercentCircle className='input-icon' />}
                            value={item.discount}
                            onChange={(e) => handleItemChange(index, "discount", e.target.value)}
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
                        onclick={handleSalesOrder}
                    />
                </div>
            ) : (
                <div className='add-container-actions'>
                    <ActionButton
                        title={"Hapus"}
                        background="linear-gradient(to top right,rgb(241, 66, 66),rgb(245, 51, 51))"
                        color="white"
                        onclick={() => roleAccess(accessList, 'menghapus-data-sales-order') ? setOpenDeleteModal(true) : handleRestricedAction()}
                    />

                    <ActionButton
                        title={loading ? "Memperbarui..." : "Perbarui"}
                        disabled={loading}
                        onclick={handleSalesOrder}
                    />
                </div>
            )}

            {openDeleteModal && (
                <ConfirmationModal
                    isOpen={openDeleteModal}
                    onClose={() => setOpenDeleteModal(false)}
                    onClick={handleDeleteSalesOrder}
                    title="Pesanan"
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

export default EntitySalesOrder;