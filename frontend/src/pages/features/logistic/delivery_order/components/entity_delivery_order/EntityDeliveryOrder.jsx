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
import DeliveryOrderRepository from '../../../../../../repository/logistic/DeliveryOrderRepository';
import InvoiceOrderRepository from '../../../../../../repository/logistic/InvoiceOrderRepository';
import { useNavigate } from 'react-router-dom';

const EntityDeliveryOrder = ({
    mode,
    initialData = {},
    onSubmit,
}) => {
    console.log('Initial Data: ', initialData);
    // Context
    const navigate = useNavigate();
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
    const [soData, setSoData] = useState(initialData.soData || {});
    const [code, setCode] = useState(initialData.code || "");
    const [description, setDescription] = useState(initialData.description || "");
    const [items, setItems] = useState(initialData.items || emptyData);
    const [warehouse, setWarehouse] = useState(initialData.warehouse?.id || '');
    const [selectedExpress, setSelectedExpress] = useState(initialData.express?.id || '');
    const [selectedCourier, setSelectedCourier] = useState(initialData.courier?.id || '');
    const [createdAt, setCreatedAt] = useState(initialData.createdAt || '');
    const [doDate, setDODate] = useState(initialData.doDate || '');
    const [isPrint, setIsPrint] = useState(initialData.isPrint || '');
    const [reloadSO, setReloadSO] = useState(0);
    const [codeError, setCodeError] = useState("");
    const [soCodeError, setSoCodeError] = useState('');
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

        setCode(initialData.code || '');
        setSOCode(initialData.soCode || []);
        setDODate(initialData.doDate
            ? Formatting.formatTimestampToISO(initialData.doDate)
            : Formatting.formatDateForInput(new Date()));
        setSelectedExpress(initialData.express?.id || '');
        setSelectedCourier(initialData.courier?.id || '');
    }, [initialData]);

    useEffect(() => {
        // Skip jika kosong, string kosong, atau array kosong
        if (
            !soCode ||
            (Array.isArray(soCode) && soCode.length === 0) ||
            (typeof soCode === 'string' && !soCode.trim())
        ) return;

        console.log('SO Code : ', soCode);

        const fetchSOData = async () => {
            try {
                const data = await SalesOrderRepository.getSalesOrderById(soCode.id);
                setSoData(data || {});
                setCustomer(data.customer?.name || '');
                setDescription(data.description || "");
                setItems(data.items || emptyData);
                setWarehouse(data.warehouse?.name || '');
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

    useEffect(() => {
        console.log('SO Data : ', soData);
    }, [soData])


    const handleDeliveryOrder = async (e) => { // Tambahkan 'e' di sini
        e.preventDefault();
        setLoading(true);
        console.log('SO Code: ', soCode);

        let valid = true;

        if (!code.trim()) {
            setCodeError('Kode Penyesuaian tidak boleh kosong!');
            valid = false;
        }

        if (!soCode || typeof soCode !== 'object' || !soCode.id) {
            setSoCodeError('Pesanan harus dipilih!');
            valid = false;
        }

        if (!valid) return setLoading(false);

        try {
            const filteredCourier = couriers.find(courier => courier.id === selectedCourier);
            const FilteredExpress = express.find(express => express.id === selectedExpress);

            console.log('Filtered Courier: ', filteredCourier);
            console.log('Filtered Express: ', FilteredExpress);
            const exists = await DeliveryOrderRepository.checkDeliveryOrderExists(
                code.trim(),
                mode === "detail" ? initialData.id : null
            );

            if (exists) {
                showToast("gagal", "Kode Sales Order sudah digunakan!");
                return setLoading(false);
            }

            console.log('DO Date: ', doDate);

            const newDeliveryOrder = {
                code,
                soData,
                soCode,
                doDate: Timestamp.fromDate(new Date(doDate)),
                express: FilteredExpress,
                courier: filteredCourier,
            };


            console.log('New Delivery Order Data: ', newDeliveryOrder);

            try {
                await onSubmit(newDeliveryOrder, handleReset); // Eksekusi yang berisiko error
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

    const processDeliveryOrder = async () => {
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
            const filteredCourier = couriers.find(courier => courier.id === selectedCourier);
            const FilteredExpress = express.find(express => express.id === selectedExpress);

            const baseDate = new Date(doDate); // pastikan doDate adalah Date atau ISO string
            const dueDate = new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 hari

            const deliveryOrderData = {
                code,
                soData,
                soCode,
                doDate: Timestamp.fromDate(baseDate),
                express: FilteredExpress,
                courier: filteredCourier,
                totalPrice: cleanedItems.reduce((total, item) => total + item.price * item.qty, 0),
                totalDiscount: cleanedItems.reduce((total, item) => total + item.price * item.discount * item.qty, 0),
                totalPayment: cleanedItems.reduce((total, item) => {
                    const discountedPrice = item.price * (1 - item.discount);
                    return total + discountedPrice * item.qty;
                }, 0),
                statusPayment: 'Belum Dibayar',
                dueData: Timestamp.fromDate(dueDate),
            };


            console.log('Delivery Order Data: ', deliveryOrderData);

            await DeliveryOrderRepository.updateStatusDeliveryOrder(initialData.id, 'Selesai');
            await InvoiceOrderRepository.createInvoiceOrder(deliveryOrderData);
            showToast("berhasil", "Pesanan berhasil diselesaikan!");
            navigate("/delivery-order");
        } catch (error) {
            console.error("Error finish the order: ", error);
            showToast("gagal", "Gagal menyelesaikan pesanan!");
        }
    };

    const handleReset = (e) => {
        setSOCode([]);
        setCustomer([]);
        setCode("");
        setDescription("");
        setItems(emptyData);
        setWarehouse("");
        setCodeError("");
        setReloadSO(prev => prev + 1); // ⬅️ trigger ulang pencarian SO
    }

    const loadSOOptions = async (inputValue) => {
        const searchTerm = inputValue || "";

        const { hits } = await soIndex.search(searchTerm, {
            hitsPerPage: 10,
            filters: 'status: "Mengantri"',
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
                    key={reloadSO}
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
                    </div>
                ))}
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
                        onclick={handleDeliveryOrder}
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

                    <div className='action-button-group'>
                        <ActionButton
                            title={loading ? "Menyelesaikan Pesanan..." : "Selesaikan Pesanan"}
                            onclick={processDeliveryOrder}
                        />

                        <ActionButton
                            title={loading ? "Memperbarui..." : "Perbarui"}
                            disabled={loading}
                            onclick={handleDeliveryOrder}
                        />
                    </div>
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