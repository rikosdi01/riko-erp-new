import { useEffect, useState } from 'react';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './EntityDeliveryOrder.css';
import { Computer, Sheet, KeyRound, ClipboardPen, Warehouse, BadgeDollarSign, PercentCircle, Store, Ship, UserCog } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';
import { Timestamp } from 'firebase/firestore';
import Dropdown from '../../../../../../components/select/Dropdown';
import Formatting from '../../../../../../utils/format/Formatting';
import { customerIndex, productIndex, soIndex } from '../../../../../../../config/algoliaConfig';
import TransferRepository from '../../../../../../repository/warehouse/TransferRepository';
import ConfirmationModal from '../../../../../../components/modal/confirmation_modal/ConfirmationModal';
import { useRacks } from '../../../../../../context/warehouse/RackWarehouseContext';
import SalesOrderRepository from '../../../../../../repository/sales/SalesOrderRepository';
import DeliveryOrderPrintPreview from '../delivery_order_print_preview/DeliveryOrderPrintPreview';
import { useCourier } from '../../../../../../context/logistic/CourierContext';
import { useExpress } from '../../../../../../context/logistic/ExpressContext';

const EntityDeliveryOrder = ({
    mode,
    initialData = {},
    onSubmit,
}) => {
    console.log('Initial Data: ', initialData);
    // Context
    const { showToast } = useToast();
    const { racks } = useRacks();
    const { couriers } = useCourier();
    const { express } = useExpress();

    const emptyData = [{
        item: '',
        qty: '',
        price: '',
        discount: '',
    }]

    const [customer, setCustomer] = useState(initialData.customer || []);
    const [soCode, setSOCode] = useState(initialData.soCode || []);
    const [code, setCode] = useState(initialData.code || "");
    const [description, setDescription] = useState(initialData.description || "");
    const [items, setItems] = useState(initialData.items || emptyData);
    const [warehouse, setWarehouse] = useState(initialData.warehouse?.id || '');
    const [selectedExpress, setSelectedExpress] = useState(initialData.express?.id || '');
    const [selectedCourier, setSelectedCourier] = useState(initialData.courier?.id || '');
    const [createdAt, setCreatedAt] = useState(initialData.createdAt || '');
    const [doDate, setDODate] = useState(initialData.doDate || '');
    const [isPrint, setIsPrint] = useState(initialData.isPrint || '');
    const [codeError, setCodeError] = useState("");
    const [itemError, setItemError] = useState("");
    const [warehouseError, setWarehouseError] = useState("");
    const [loading, setLoading] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...items];
        console.log('Items: ', items);

        if (field === "item") {
            updatedItems[index] = {
                ...updatedItems[index],
                item: value,
                price: value?.price ? Formatting.formatCurrencyIDR(value?.price) : "",
            };
        } else if (field === "price") {
            const raw = value.toString().replace(/[^0-9]/g, ""); // hanya angka
            updatedItems[index] = {
                ...updatedItems[index],
                price: raw ? Formatting.formatCurrencyIDR(raw) : "",
            };
        } else if (field === "discount") {
            const raw = value.toString().replace(/[^0-9]/g, ""); // hanya angka
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

        // Validasi dan tambah baris seperti biasa
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



    // Hanya jalan sekali saat komponen pertama kali dimount
    useEffect(() => {
        if (!initialData || Object.keys(initialData).length === 0) {
            setCreatedAt(Formatting.formatDateForInput(new Date()));
            setDODate(Formatting.formatDateForInput(new Date()));
        }
    }, []); // kosong -> hanya jalan sekali saat mount


    // 🔁 Sinkronkan initialData ke state setiap kali initialData berubah
    useEffect(() => {
        if (!initialData || Object.keys(initialData).length === 0) return;

        setSOCode(initialData.soCode || []);
        setDODate(initialData.doDate
            ? Formatting.formatTimestampToISO(initialData.doDate)
            : Formatting.formatDateForInput(new Date()));
        setSelectedExpress(initialData.express?.id || '');
        setSelectedCourier(initialData.courier?.id || '');
    }, [initialData]);

    useEffect(() => {
        if (!soCode || typeof soCode === 'string' && !soCode.trim()) return;

        const fetchSOData = async () => {
            try {
                const data = await SalesOrderRepository.getSalesOrderById(soCode.id || soCode); // tergantung bentuk soCode
                setCustomer(data.customer?.name || '');
                setDescription(data.description || "");
                setItems(data.items || emptyData);
                setWarehouse(data.warehouse?.name || '');
                setSelectedExpress(data.express?.id || '');
                setSelectedCourier(data.courier?.id || '');
                setIsPrint(data.isPrint || '');
                setCreatedAt(
                    data.createdAt
                        ? Formatting.formatTimestampToISO(data.createdAt)
                        : Formatting.formatDateForInput(new Date())
                );
            } catch (error) {
                console.error("Failed to fetch SO Data:", error);
            }
        };

        fetchSOData();
    }, [soCode]);

    const handleSalesOrder = async (e) => { // Tambahkan 'e' di sini
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
            const cleanedItems = filteredItems.map(item => ({
                item: {
                    id: item.item?.id,
                    code: item.item?.code,
                    name: item.item?.name,
                },
                qty: parseInt(item.qty.toString().replace(/[^0-9]/g, ""), 10) || 0,
                price: parseInt(item.price.toString().replace(/[^0-9]/g, ""), 10) || 0,
                discount: parseFloat(
                    (item.discount || "0").toString().replace(/[^0-9.]/g, "")
                ) / 100 || 0,
            }));

            console.log('cleanedItems: ', cleanedItems);

            const wh = racks.find(wh => wh.id === warehouse);

            const filteredWH = {
                id: wh.id,
                name: wh.name,
                category: wh.category,
            };

            const exists = await SalesOrderRepository.checkSalesOrderExists(
                code.trim(),
                mode === "detail" ? initialData.id : null
            );

            if (exists) {
                showToast("gagal", "Kode Sales Order sudah digunakan!");
                return setLoading(false);
            }

            const newSalesOrder = {
                customer,
                code,
                description,
                items: cleanedItems,
                warehouse: filteredWH,
                isPrint,
                totalPrice: cleanedItems.reduce((total, item) => {
                    const discountedPrice = item.price * (1 - item.discount); // Harga setelah diskon
                    return total + (discountedPrice * item.qty);
                }, 0),
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            };

            console.log('New Sales Order Data: ', newSalesOrder);

            try {
                await onSubmit(newSalesOrder, handleReset); // Eksekusi yang berisiko error
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
            price: hit.salePrice,
            id: hit.objectID,
        }));
    };

    const loadSOOptions = async (inputValue) => {
        const searchTerm = inputValue || ""; // pastikan tetap "" jika kosong
        const { hits } = await soIndex.search(searchTerm, {
            hitsPerPage: 10,
        });

        return hits.map(hit => ({
            name: hit.code,
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
                title={mode === "create" ? "Tambah Pengiriman" : "Rincian Pengiriman"}
                enablePrint={true}
                setShowPreview={setShowPreview}
            />

            <DeliveryOrderPrintPreview
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
                <InputLabel
                    label="No Pengiriman"
                    icon={<KeyRound className='input-icon' />}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
                <Dropdown
                    isAlgoliaDropdown={true}
                    values={loadSOOptions}
                    selectedId={soCode}
                    setSelectedId={setSOCode}
                    label="Pilih Pesanan"
                    icon={<Store className="input-icon" />}
                />
                {codeError && <div className="error-message">{codeError}</div>}
            </div>

            <div className='add-container-input-attribute'>
                <Dropdown
                    values={express}
                    selectedId={selectedExpress}
                    setSelectedId={setSelectedExpress}
                    label="Pilih Express"
                    icon={<Ship className="input-icon" />}
                />

                <Dropdown
                    values={couriers}
                    selectedId={selectedCourier}
                    setSelectedId={setSelectedCourier}
                    label="Pilih Kurir"
                    icon={<UserCog className="input-icon" />}
                />

                <InputLabel
                    label="Tanggal Pengiriman"
                    type="datetime-local"
                    icon={<ClipboardPen className='input-icon' />}
                    value={doDate}
                    onChange={(e) => setDODate(e.target.value)}
                />
            </div>

            <div className='divider' style={{ marginTop: '20px' }}></div>

            <div className='add-container-input'>
                <InputLabel
                    label="Pelanggan"
                    icon={<Store className='input-icon' />}
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    isDisabled={true}
                />
            </div>

            <div className='add-container-input'>
                <InputLabel
                    label="Keterangan"
                    icon={<ClipboardPen className='input-icon' />}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    isDisabled={true}
                />
                <InputLabel
                    label="Gudang"
                    icon={<Warehouse className='input-icon' />}
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                    isDisabled={true}
                />
                <InputLabel
                    label="Tanggal"
                    type="datetime-local"
                    icon={<ClipboardPen className='input-icon' />}
                    value={createdAt}
                    onChange={(e) => setCreatedAt(e.target.value)}
                    isDisabled={true}
                />
            </div>

            <div className='divider'></div>

            <div className='list-item-container'>
                <div className='list-item-header'>List Pesanan</div>

                {items.map((item, index) => (
                    <div key={index} className="add-container-input-area">
                        <InputLabel
                            label="Item"
                            icon={<Sheet className='input-icon' />}
                            value={item.item?.name}
                            onChange={(e) => handleItemChange(index, "item", e.target.value)}
                            isDisabled={true}
                        />
                        <InputLabel
                            label="Kuantitas"
                            icon={<Sheet className='input-icon' />}
                            value={item.qty}
                            onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                            isDisabled={true}
                        />
                        <InputLabel
                            label="Harga"
                            icon={<BadgeDollarSign className='input-icon' />}
                            value={item.price}
                            onChange={(e) => handleItemChange(index, "price", e.target.value)}
                            isDisabled={true}
                        />
                        <InputLabel
                            label="Diskon"
                            icon={<PercentCircle className='input-icon' />}
                            value={item.discount}
                            onChange={(e) => handleItemChange(index, "discount", e.target.value)}
                            isDisabled={true}
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
                        onclick={() => setOpenDeleteModal(true)}
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
                    onClick={handleDeleteTransfer}
                    title="Transfer"
                    itemDelete={initialData?.code}
                />
            )}
        </div>
    )
}

export default EntityDeliveryOrder;