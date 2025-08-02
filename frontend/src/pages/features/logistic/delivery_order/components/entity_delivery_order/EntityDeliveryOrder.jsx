import { useEffect, useState } from 'react';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './EntityDeliveryOrder.css';
import { Computer, Sheet, KeyRound, ClipboardPen, Warehouse, BadgeDollarSign, PercentCircle, Store, Ship, UserCog } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import Dropdown from '../../../../../../components/select/Dropdown';
import Formatting from '../../../../../../utils/format/Formatting';
import { ALGOLIA_INDEX_EXPRESS, clientExpress, customerIndex, productIndex, rackIndex, soIndex } from '../../../../../../../config/algoliaConfig';
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
import { useUsers } from '../../../../../../context/auth/UsersContext';
import AccessAlertModal from '../../../../../../components/modal/access_alert_modal/AccessAlertModal';
import ContainerSearch from '../../../../../../components/container/container_search/ContainerSearch';
import roleAccess from '../../../../../../utils/helper/roleAccess';
import { useFormats } from '../../../../../../context/personalization/FormatContext';

const EntityDeliveryOrder = ({
    mode,
    initialData = {},
    onSubmit,
}) => {
    console.log('Initial Data: ', initialData);
    // Context
    const { accessList } = useUsers();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { racks } = useRacks();
    const { couriers } = useCourier();
    const { express } = useExpress();
    const { formats } = useFormats();

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
    const [selectedExpress, setSelectedExpress] = useState(initialData.express || []);
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
    const [status, setStatus] = useState(initialData.status || '');

    const [accessDenied, setAccessDenied] = useState(false);
    const formatCode = formats.presets?.delivery?.code;
    const formatINVCode = formats.presets?.invoice?.code;

    const handleRestricedAction = () => {
        setAccessDenied(true);
    }

    useEffect(() => {
        console.log('Selected Express: ', selectedExpress);
    }, [selectedExpress])

    useEffect(() => {
        console.log('Warehouse: ', warehouse);
    }, [warehouse])

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

    useEffect(() => {
        console.log('Fetching Data...');
        console.log('Warehouse: ', warehouse);
        const fetchRack = async () => {
            if (!warehouse) return;
            console.log('Warehouse-126: ', warehouse);

            const { hits } = await rackIndex.search('', {
                filters: `objectID:${warehouse}`,
            });

            if (hits.length > 0) {
                const rack = hits[0];
                setWarehouse({
                    id: rack.objectID,
                    name: rack.name,
                    location: rack.location,
                    category: rack.category,
                });
            }
        };

        fetchRack();
    }, [warehouse]);

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

        setCustomer(initialData.customer || [])
        setDescription(initialData.description || '')
        setCode(initialData.code || '');
        setWarehouse(initialData.warehouse.id || '');
        setItems(initialData.items || []);
        setSOCode(initialData.soCode || []);
        setDODate(initialData.doDate
            ? Formatting.formatTimestampToISO(initialData.doDate)
            : Formatting.formatDateForInput(new Date()));
        setSelectedExpress(initialData.express || []);
        setStatus(initialData.status || '')
        setSelectedCourier(initialData.courier?.id || '');
        setCreatedAt(initialData.createdAt || '');
    }, [initialData]);

    useEffect(() => {
        console.log('Created At: ', createdAt);
    }, [createdAt]);

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

        try {
            const filteredCourier = couriers.find(courier => courier.id === selectedCourier);
            console.log('Filteed Courier: ', filteredCourier);
            const courierData = {
                id: filteredCourier.id || filteredCourier.objectID,
                name: filteredCourier.name,
                phone: filteredCourier.phone,
            }

            console.log('Filtered Courier: ', filteredCourier);

            const newDeliveryOrder = {
                updatedAt: serverTimestamp(),
                status: 'dikirim',
                express: selectedExpress,
                courier: courierData,
            };
            console.log('Updated Delivery Order Data: ', newDeliveryOrder);

            try {
                await SalesOrderRepository.updateStatusValue(initialData.soId, 'dikirim')
                await onSubmit(newDeliveryOrder, handleReset); // Eksekusi yang berisiko error
            } catch (submitError) {
                console.error("Error during onSubmit: ", submitError);
                showToast("gagal", mode === "create" ? "Gagal menyimpan adj!" : "Gagal memperbarui adj!");
                return;
            }

            showToast('berhasil', 'Pengiriman pesanan berhasil diperbarui!');
        } catch (error) {
            console.error('Terjadi kesalahan: ', error);
            showToast('gagal', 'Gagal memperbarui pengiriman pesanan!');
        } finally {
            setLoading(false);
        }
    };

    const processDeliveryOrder = async () => {
        try {
            console.log('DO Date: ', doDate);
            console.log('SO Date: ', createdAt);
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
            const courierData = {
                id: filteredCourier.id || filteredCourier.objectID,
                name: filteredCourier.name,
                phone: filteredCourier.phone,
            }

            // Ubah Timestamp ke JavaScript Date jika perlu
            const parseToDate = (val) => {
                if (!val) return new Date();
                if (val instanceof Date) return val;
                if (val.seconds) return new Date(val.seconds * 1000);
                return new Date(val);
            };

            const baseDate = parseToDate(doDate);
            const soDate = parseToDate(createdAt);
            const dueDate = new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000);

            const invCode = code.replace(formatCode, formatINVCode);
            const deliveryOrderData = {
                code: invCode,
                doId: initialData.id || initialData.objectID,
                soId: initialData.soId,
                customer,
                description,
                soDate: Timestamp.fromDate(soDate),
                doDate: Timestamp.fromDate(baseDate),
                dueData: Timestamp.fromDate(dueDate),
                express: selectedExpress,
                courier: courierData,
                totalPrice: cleanedItems.reduce((total, item) => total + item.price * item.qty, 0),
                totalDiscount: cleanedItems.reduce((total, item) => total + item.price * item.discount * item.qty, 0),
                totalPayment: cleanedItems.reduce((total, item) => {
                    const discountedPrice = item.price * (1 - item.discount);
                    return total + discountedPrice * item.qty;
                }, 0),
                statusPayment: 'menunggu pembayaran',
            };


            console.log('Delivery Order Data: ', deliveryOrderData);

            await DeliveryOrderRepository.updateStatusDeliveryOrder(initialData.id || initialData.objectID, 'menunggu pembayaran');
            await SalesOrderRepository.updateStatusValue(initialData.soId, 'menunggu pembayaran');
            await InvoiceOrderRepository.createInvoiceOrder(deliveryOrderData);

            setStatus('menunggu pembayaran')
            showToast("berhasil", "Pesanan berhasil diselesaikan!");
            // navigate("/logistic/delivery-order");
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


    // handler delete
    const handleDeleteDelivery = async () => {
        try {
            await SalesOrderRepository.updateStatusValue(initialData.soId, 'mengantri');
            await DeliveryOrderRepository.deleteDeliveryOrder(initialData.id);

            showToast("berhasil", "Transferan berhasil dihapus!");
            navigate("/logistic/delivery-order");
        } catch (error) {
            console.error("Error deleting transfer: ", error);
            showToast("gagal", "Gagal menghapus transfer!");
        }
    }


    return (
        <div className="main-container">
            <ContentHeader
                title={mode === "create" ? "Tambah Pengiriman" : "Rincian Pengiriman"}
                // enablePrint={true}
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

            <InputLabel
                label="No Pengiriman"
                icon={<KeyRound className='input-icon' />}
                value={code}
                onChange={(e) => setCode(e.target.value)}
            />

            <div className='add-container-input-attribute'>
                <ContainerSearch
                    label={"Express"}
                    icon={<Ship className='input-icon' />}
                    searchClient={clientExpress}
                    indexName={ALGOLIA_INDEX_EXPRESS}
                    columns={[
                        { header: "Nama Ekspedisi", accessor: "name" },
                        { header: "Alamat", accessor: "address" },
                        { header: "Nomor Telpon", accessor: "phone" },
                        { header: "Harga", accessor: "price" },
                        { header: "Satuan", accessor: "set" },
                        { header: "Layanan", accessor: "service" },
                    ]}
                    value={
                        selectedExpress?.name
                            ? selectedExpress.name
                            : "Pilih Ekspedisi"
                    }

                    setValues={setSelectedExpress}
                    mode="express"
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
                    value={customer.name}
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
                    value={warehouse.name}
                    onChange={(e) => setWarehouse(e.target.value)}
                    isDisabled={true}
                />
                <InputLabel
                    label="Tanggal"
                    type="datetime-local"
                    icon={<ClipboardPen className='input-icon' />}
                    value={Formatting.formatToDatetimeLocal(createdAt)}
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
                    {status === 'diproses' ? (
                        <ActionButton
                            title={"Hapus"}
                            background="linear-gradient(to top right,rgb(241, 66, 66),rgb(245, 51, 51))"
                            color="white"
                            onclick={() => roleAccess(accessList, 'menghapus-data-pengiriman-pesanan') ? setOpenDeleteModal(true) : handleRestricedAction()}
                        />
                    ) : <div></div>}

                    <div className='action-button-group'>
                        {status === 'dikirim' && (
                            <ActionButton
                                title={loading ? "Menyelesaikan Pesanan..." : "Selesaikan Pesanan"}
                                onclick={processDeliveryOrder}
                            />
                        )}

                        {status === 'diproses' && (
                            <ActionButton
                                title={loading ? "Memperbarui..." : "Perbarui"}
                                disabled={loading}
                                onclick={handleDeliveryOrder}
                            />
                        )}
                    </div>
                </div>
            )}

            {openDeleteModal && (
                <ConfirmationModal
                    isOpen={openDeleteModal}
                    onClose={() => setOpenDeleteModal(false)}
                    onClick={handleDeleteDelivery}
                    title="Pengiriman"
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

export default EntityDeliveryOrder;