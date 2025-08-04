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
import CourierRepository from '../../../../../../repository/logistic/CourierRepository';
import { UserCog } from 'lucide-react';
import { useCourier } from '../../../../../../context/logistic/CourierContext';
import InvoiceOrderRepository from '../../../../../../repository/logistic/InvoiceOrderRepository';
import { serverTimestamp } from 'firebase/firestore';


const DetailDeliveryOrder = () => {
    const { loginUser } = useUsers();
    const { id } = useParams();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [deliveryOrder, setDeliveryOrder] = useState(null);
    const [confirmationModal, setConfirmationModal] = useState(false);
    const [paymentModal, setPaymentModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);
    const [paymentCancelDescription, setPaymentCancelDescription] = useState('');

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

    const handleUpdateOrderStatus = async (status, successMessage, failMessage) => {
        try {
            await SalesOrderRepository.updateStatusValue(id, status);
            showToast('berhasil', successMessage);
            const updated = await SalesOrderRepository.getSalesOrderById(id);
            setDeliveryOrder(updated);
            setShowCancelModal(false);
        } catch (error) {
            showToast('gagal', failMessage);
            console.log('Error when cancelling order : ', error);
        }
    };

    const handleCancelOrder = async () => {
        try {
            const dataUpdated = {
                paymentCancelDescription,
                status: 'pembayaran ditolak'
            }

            await SalesOrderRepository.updateSalesOrder(id, dataUpdated);
            showToast('berhasil', 'Berhasil memabatalkan pembayaran');
            const updated = await SalesOrderRepository.getSalesOrderById(id);
            setDeliveryOrder(updated);
            setShowCancelModal(false);
        } catch (error) {
            showToast('gagal', 'Gagal membatalkan pembayaran');
            console.log('Error when cancelling order : ', error);
        }
    };

    const handleDeliveryOrder = async () => {
        try {
            const doCode = code.replace(formatCode, formatDOCode);

            // Langkah 1: Update status SalesOrder ke 'dikemas'
            await SalesOrderRepository.updateStatusValue(id, 'dikemas');

            // Langkah 2: Buat dokumen baru DeliveryOrder
            const newDeliveryOrder = {
                customer,
                code: doCode,
                soData: deliveryOrder,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            await DeliveryOrderRepository.createDeliveryOrder(newDeliveryOrder);

            // Langkah 3: Ambil ulang data SalesOrder terbaru
            const updated = await SalesOrderRepository.getSalesOrderById(id);
            setDeliveryOrder(updated);

            showToast('berhasil', 'Pesanan berhasil diproses dan sedang dikemas.');
        } catch (error) {
            console.error('Error when processing order:', error);
            showToast('gagal', 'Gagal memproses pesanan. Silakan coba lagi.');
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
                        {deliveryOrder.invoiceIsCreate && (
                            <div className='order-detail-invoice'>Faktur Pesanan telah dibuat</div>
                        )}

                    </div>

                    <div className='order-detail-section'>
                        <div className='order-detail-field'>Kode Pesanan: <span>{code}</span></div>
                        <div className='order-detail-field'>Tanggal Pesanan: <span>{Formatting.formatDate(createdAt)}</span></div>
                        <div className='order-detail-field'>Status: <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span></div>
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

            {/* <div className='courier-choice'>
                <Dropdown
                    values={couriers}
                    selectedId={selectedCourier}
                    setSelectedId={setSelectedCourier}
                    label={'Pilih Kurir'}
                    icon={<UserCog className="input-icon" />}
                />
            </div> */}

            {loginUser && (loginUser.role === 'Logistic Admin' || loginUser.role === 'Logistic Supervisor') && status && status === 'dikemas' && deliveryOrder.invoiceIsCreate && (
                <div className='detail-order-button'>
                    <div></div>
                    <ActionButton
                        title={'Kirim Pesanan'}
                        onclick={handleDeliveryOrder}
                    />
                </div>
            )}

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

            {paymentModal && (
                <div className='modal-overlay' onClick={() => setPaymentModal(false)}>
                    <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                        <button className="payment-modal-close-button" onClick={() => setPaymentModal(false)}>x</button>
                        <div className="payment-modal-image-container">
                            <img
                                src={transferProof}
                                onClick={() => setShowFullImage(true)}
                                className="payment-modal-image"
                            />
                        </div>
                        <div className="payment-modal-date">
                            Tanggal Pembayaran: {Formatting.formatDate(paymentDate)}
                        </div>

                        <div>
                            <div className='payment-modal-actions'>
                                <ActionButton
                                    title="Tutup"
                                    classname={'btn btn-secondary'}
                                    onclick={() =>
                                        setPaymentModal(false)} // Ganti dengan fungsi yang relevan}
                                />
                                <ActionButton
                                    title="Pembayaran tidak sah"
                                    onclick={() => {
                                        setPaymentModal(false);
                                        setShowCancelModal(true)
                                    }} // Ganti dengan fungsi yang relevan
                                    color={'white'}
                                    background={'red'}
                                />
                                <ActionButton
                                    type="button"
                                    title="Proses Pesanan"
                                    onclick={() => handleUpdateOrderStatus(
                                        'diproses',
                                        'Pesanan berhasil diproses',
                                        'Pesanan gagal diproses',
                                    )} // Ganti dengan fungsi yang relevan
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            {
                showFullImage && (
                    <div
                        onClick={() => setShowFullImage(false)}
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100vw",
                            height: "100vh",
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 9999,
                        }}
                    >
                        <img
                            src={transferProof}
                            alt="Bukti Transfer Full"
                            style={{
                                maxWidth: "90%",
                                maxHeight: "90%",
                                borderRadius: "8px",
                                boxShadow: "0 0 15px rgba(255,255,255,0.5)"
                            }}
                        />
                    </div>
                )
            }

            {showCancelModal && (
                <div className='modal-overlay'>
                    <div className='modal-content'>
                        <h3 className='cancel-modal-title'>Apa alasan Pembayaran ini tidak sah?</h3>
                        <textarea
                            className='cancel-reason-textarea'
                            value={paymentCancelDescription}
                            onChange={(e) => setPaymentCancelDescription(e.target.value)}
                            placeholder="Tulis alasan pembatalan pembayaran..."
                            rows={4}
                        />

                        <div className='cancel-modal-actions'>
                            <ActionButton
                                title="Tutup"
                                onclick={() => {
                                    setShowCancelModal(false);
                                    setPaymentModal(true);
                                }}
                                classname="btn btn-secondary"
                            />
                            <ActionButton
                                title="Kirimkan"
                                onclick={handleCancelOrder}
                                classname="btn btn-primary"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default DetailDeliveryOrder;
