// import { useNavigate, useParams } from 'react-router-dom';
// import './DetailDeliveryOrder.css'
// import { useEffect, useState } from 'react';
// import SalesOrderRepository from '../../../../../../repository/sales/SalesOrderRepository';
// import EntityDeliveryOrder from '../../components/entity_delivery_order/EntityDeliveryOrder';
// import DeliveryOrderRepository from '../../../../../../repository/logistic/DeliveryOrderRepository';

// const DetailDeliveryOrder = () => {
//     // Hooks
//     const { id } = useParams();
//     const navigate = useNavigate();

//     // Variables
//     const [deliveryOrder, setDeliveryOrder] = useState([]);

//     // Fetch the deliveryOrder details using the id from the URL
//     useEffect(() => {
//         const fetchDeliveryOrderDetails = async () => {
//             try {
//                 const deliverOrderDetails = await DeliveryOrderRepository.getDeliveryOrderById(id);
//                 setDeliveryOrder(deliverOrderDetails);
//             } catch (error) {
//                 console.error("Error fetching delivery order details: ", error);
//             }
//         };

//         fetchDeliveryOrderDetails();
//     }, [id]);

//     return (
//         <div>
//             <EntityDeliveryOrder
//                 mode={'detail'}
//                 initialData={deliveryOrder}
//                 onSubmit={async (data) => {
//                     await DeliveryOrderRepository.updateDeliveryOrder(id, data);
//                     navigate('/logistic/delivery-order')
//                 }}
//             />
//         </div>
//     )
// }

// export default DetailDeliveryOrder;


import { useNavigate, useParams } from 'react-router-dom';
import './DetailDeliveryOrder.css';
import { useEffect, useState } from 'react';
import { useUsers } from '../../../../../../context/auth/UsersContext';
import { useToast } from '../../../../../../context/ToastContext';
import { useFormats } from '../../../../../../context/personalization/FormatContext';
import SalesOrderRepository from '../../../../../../repository/sales/SalesOrderRepository';
import DeliveryOrderRepository from '../../../../../../repository/logistic/DeliveryOrderRepository';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import Formatting from '../../../../../../utils/format/Formatting';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import Dropdown from '../../../../../../components/select/Dropdown';
import { Ship, UserCog } from 'lucide-react';
import InvoiceOrderRepository from '../../../../../../repository/logistic/InvoiceOrderRepository';
import { serverTimestamp } from 'firebase/firestore';
import { useCourier } from '../../../../../../context/logistic/CourierContext';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';


const DetailDeliveryOrder = () => {
    const { loginUser } = useUsers();
    const { id } = useParams();
    const { showToast } = useToast();
    const { couriers } = useCourier();
    const navigate = useNavigate();
    const [deliveryOrder, setDeliveryOrder] = useState(null);
    const [confirmationModal, setConfirmationModal] = useState(false);
    const [selectedCourier, setSelectedCourier] = useState('');
    const [expeditionResi, setExpeditionResi] = useState('');
    const [courierError, setCourierError] = useState('');
    const [expeditionResiError, setExpeditionResiError] = useState('');

    const { formats } = useFormats();
    const formatCode = formats.presets?.sales?.code;
    const formatDOCode = formats.presets?.delivery?.code;
    const formatInvCode = formats.presets?.invoice?.code;

    useEffect(() => {
        console.log('List Order || Sales Order: ', deliveryOrder);
    }, [deliveryOrder]);


    useEffect(() => {
        const fetchDeliveryOrderDetails = async () => {
            try {
                const details = await DeliveryOrderRepository.getDeliveryOrderById(id);
                setDeliveryOrder(details);
            } catch (error) {
                console.error("Error fetching sales order details: ", error);
            }
        };
        fetchDeliveryOrderDetails();
    }, [id]);

    useEffect(() => {
        if (deliveryOrder) {
            setSelectedCourier(deliveryOrder.courier);
        }
    }, [deliveryOrder])

    const handleDeliveryOrder = async (e) => {
        e.preventDefault();
        console.log('Courier:', selectedCourier);

        let valid = true;

        if (!selectedCourier || !selectedCourier.trim()) {
            setCourierError('Kurir tidak boleh kosong!');
            valid = false;
        } else {
            setCourierError('');
        }

        if (!valid) return;

        try {
            const filteredCourier = couriers.find(courier => courier.id === selectedCourier);
            console.log('Filteed Courier: ', filteredCourier);
            const courierData = {
                id: filteredCourier.id,
                name: filteredCourier.name,
                phone: filteredCourier.phone,
            }

            const soUpdated = await SalesOrderRepository.updateStatusValue(deliveryOrder.soData?.id, 'dikirim');
            console.log('SO Updated: ', soUpdated);
            console.log('Delivery SO Data: ', deliveryOrder.soData);

            // Langkah 1: Update status SalesOrder ke 'dikemas'
            const doData = {
                courier: courierData,
                soData: soUpdated,
                shippingDate: serverTimestamp(),
                updatedAt: serverTimestamp(),
            }

            await DeliveryOrderRepository.updateDeliveryOrder(id, doData)

            // Langkah 3: Ambil ulang data SalesOrder terbaru
            const updated = await DeliveryOrderRepository.getDeliveryOrderById(id);
            setDeliveryOrder(updated);

            showToast('berhasil', 'Status Pesanan berhasil diubah menjadi "dikirim".');
        } catch (error) {
            console.error('Error when processing order:', error);
            showToast('gagal', 'Gagal mengubah status pesanan.');
        }
    };

    const handleCreateInvoice = async () => {
        try {
            const invCode = deliveryOrder.code.replace(formatDOCode, formatInvCode);

            // Step 1: Update delivery order, tandai bahwa invoice sudah dibuat
            await DeliveryOrderRepository.updateDeliveryOrder(id, {
                invoiceIsCreate: true
            });

            // Step 2: Ambil data terbaru delivery order setelah update
            const updated = await DeliveryOrderRepository.getDeliveryOrderById(id);
            setDeliveryOrder(updated); // update state juga

            // Step 3: Buat invoice dengan data terbaru
            const newInvoiceData = {
                code: invCode,
                doData: updated, // ← sekarang sudah pakai data terbaru
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            await InvoiceOrderRepository.createInvoiceOrder(newInvoiceData);

            showToast('berhasil', 'Faktur pesanan berhasil dibuat.');
        } catch (error) {
            console.error('Error when processing order:', error);
            showToast('gagal', 'Gagal membuat faktur pesanan.');
        }
    };

    const handleOnTheWayInvoice = async (e) => {
        e.preventDefault();
        console.log('Courier:', selectedCourier);

        let valid = true;

        if (!expeditionResi.trim()) {
            setExpeditionResiError('Nomor Resi Ekspedisi tidak boleh kosong!');
            valid = false;
        } else {
            setExpeditionResiError('');
        }

        if (!valid) return;

        try {
            const soUpdated = await SalesOrderRepository.updateStatusValue(deliveryOrder.soData?.id, 'dalam perjalanan');

            // Langkah 1: Update status SalesOrder ke 'dikemas'
            const doData = {
                expeditionResi,
                soData: soUpdated,
                deliverDate: serverTimestamp(),
                updatedAt: serverTimestamp(),
            }

            await DeliveryOrderRepository.updateDeliveryOrder(id, doData)

            // Langkah 3: Ambil ulang data SalesOrder terbaru
            const updated = await DeliveryOrderRepository.getDeliveryOrderById(id);
            setDeliveryOrder(updated);

            showToast('berhasil', 'Status Pesanan berhasil diubah menjadi "dalam perjalanan".');
        } catch (error) {
            console.error('Error when processing order:', error);
            showToast('gagal', 'Gagal mengubah status pesanan.');
        }
    };

    const handleFinishOrder = async () => {
        try {
            const soUpdated = await SalesOrderRepository.updateStatusValue(deliveryOrder.soData?.id, 'selesai');

            // Langkah 1: Update status SalesOrder ke 'dikemas'
            const doData = {
                soData: soUpdated,
                finishDate: serverTimestamp(),
                updatedAt: serverTimestamp(),
            }

            await DeliveryOrderRepository.updateDeliveryOrder(id, doData)

            // Langkah 3: Ambil ulang data SalesOrder terbaru
            const updated = await DeliveryOrderRepository.getDeliveryOrderById(id);
            setDeliveryOrder(updated);

            showToast('berhasil', 'Status Pesanan berhasil diselesaikan.');
        } catch (error) {
            console.error('Error when processing order:', error);
            showToast('gagal', 'Gagal menyelesaikan pesanan.');
        }
    };


    if (!deliveryOrder) return <div>Loading...</div>;

    const { customer, items, description, status, express, createdAt, paymentDate, code, transferProof } = deliveryOrder.soData;

    return (
        <div className='main-container'>
            <ContentHeader title="Rincian Pengiriman" />

            <div className="order-detail-container">
                <div className='order-detail-info'>
                    <div className='order-detail-section'>
                        <div className='order-detail-field'>Alamat Pelanggan: <span>{customer?.selectedAddress?.address || '-'}</span></div>
                        <div className='order-detail-field'>Kota: <span>{customer?.selectedAddress?.city || '-'}</span></div>
                        <div className='order-detail-field'>Provinsi: <span>{customer?.selectedAddress?.province || '-'}</span></div>
                        <div className='order-detail-field'>Ekspedisi: <span>{express.name || '-'}</span></div>
                        {deliveryOrder.expeditionResi && (
                            <div className='order-detail-field'>
                                No. Resi Ekspedisi: <span>{deliveryOrder?.expeditionResi || '-'}</span>
                            </div>
                        )}
                        {deliveryOrder.invoiceIsCreate && (
                            <div className='order-detail-invoice'>Faktur Pesanan telah dibuat</div>
                        )}

                    </div>

                    <div className='order-detail-section'>
                        <div className='order-detail-field'>Kode Pesanan: <span>{code}</span></div>
                        <div className='order-detail-field'>Tanggal Pesanan: <span>{Formatting.formatDate(createdAt)}</span></div>
                        <div className='order-detail-field'>Status: <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span></div>
                        {deliveryOrder?.courier && Object.keys(deliveryOrder.courier).length > 0 && (
                            <div className='order-detail-field'>
                                Kurir: <span>{deliveryOrder?.courier?.name || '-'}</span>
                            </div>
                        )}
                        <div className='order-detail-field'>Estimasi Pengiriman: <span>{express ? `${express.estimationStart}-${express.estimationEnd} Hari` : '-'}</span></div>
                        <div className='order-detail-field'>Catatan: <span>{description || '-'}</span></div>
                    </div>
                </div>

                <div className='table-header'>Daftar Pesanan:</div>
                <table className="order-items-table">
                    <thead>
                        <tr>
                            <th>Nama Produk</th>
                            <th>Jumlah</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(({ item, qty, price }, index) => (
                            <tr key={index}>
                                <td>{item.name}</td>
                                <td>{qty}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {loginUser && (loginUser.role === 'Logistic Admin' || loginUser.role === 'Logistic Supervisor') && status && status === 'dikemas' && !deliveryOrder.invoiceIsCreate && (
                <div className='detail-order-button'>
                    <div></div>
                    <ActionButton
                        title={'Buat Faktur'}
                        onclick={handleCreateInvoice}
                    />
                </div>
            )}

            {loginUser && (loginUser.role === 'Logistic Admin' || loginUser.role === 'Logistic Supervisor') && status && status === 'dikemas' && deliveryOrder.invoiceIsCreate && (
                <div>
                    <div className='divider'></div>
                    <div className='courier-choice'>
                        <Dropdown
                            values={couriers}
                            selectedId={selectedCourier}
                            setSelectedId={setSelectedCourier}
                            label={'Pilih Kurir'}
                            icon={<UserCog className="input-icon" />}
                        />
                        {courierError && <div className="error-message">{courierError}</div>}
                    </div>
                </div>
            )}

            {loginUser && (loginUser.role === 'Logistic Admin' || loginUser.role === 'Logistic Supervisor') && status && status === 'dikirim' && (
                <div>
                    <div className='divider'></div>
                    <div className='courier-choice'>
                        <InputLabel
                            label={'Nomor Resi Ekspedisi'}
                            icon={<Ship className='input-icon' />}
                            value={expeditionResi}
                            onChange={(e) => setExpeditionResi(e.target.value)}
                        />
                        {expeditionResiError && <div className="error-message" style={{ marginTop: '-10px' }}>{expeditionResiError}</div>}
                    </div>
                </div>
            )}

            {loginUser && (loginUser.role === 'Logistic Admin' || loginUser.role === 'Logistic Supervisor') && status && status === 'dikemas' && deliveryOrder.invoiceIsCreate && (
                <div className='detail-order-button'>
                    <div></div>
                    <ActionButton
                        title={'Kirim Pesanan'}
                        onclick={handleDeliveryOrder}
                    />
                </div>
            )}

            {loginUser && (loginUser.role === 'Logistic Admin' || loginUser.role === 'Logistic Supervisor') && status && status === 'dikirim' && (
                <div className='detail-order-button'>
                    <div></div>
                    <ActionButton
                        title={'Simpan Resi'}
                        onclick={handleOnTheWayInvoice}
                    />
                </div>
            )}

            {loginUser && (loginUser.role === 'Logistic Admin' || loginUser.role === 'Logistic Supervisor') && status && status === 'dalam perjalanan' && (
                <div className='detail-order-button'>
                    <div></div>
                    <ActionButton
                        title={'Selesaikan Pesanan'}
                        onclick={handleFinishOrder}
                    />
                </div>
            )}

            {/* <div style={{
                fontSize: '24px',
                color: 'green',
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'end',
                alignItems: 'end',
                marginRight: '40px',
                marginTop: '20px'
            }}>
                SELESAI
            </div> */}

            {confirmationModal && (
                <div className='modal-overlay'>
                    <div className="modal-content">
                        <div className='confirmation-modal-title'>
                            Batal Pesanan
                        </div>
                        <div className='confirmation-modal-subtitle'>
                            Apakah Anda yakin ingin membatalkan pesanan ini?
                        </div>
                        <div className='confirmation-modal-actions'>
                            <ActionButton
                                type="button"
                                title="Tidak"
                                onclick={() => setConfirmationModal(false)}
                                background="linear-gradient(to top right,rgb(226, 229, 87),rgb(238, 241, 51))"
                                color="#9C5700"
                                padding='10px 30px'
                            />
                            <ActionButton
                                type="button"
                                title="Iya, batalkan pesanan"
                                onclick={handleCancelOrder}
                                background="linear-gradient(to top right,rgb(241, 66, 66),rgb(245, 51, 51))"
                                color="white"
                                padding='10px 30px'
                            />
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default DetailDeliveryOrder;
