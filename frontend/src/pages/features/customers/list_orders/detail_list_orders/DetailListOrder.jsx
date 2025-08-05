import { useNavigate, useParams } from 'react-router-dom';
import './DetailListOrder.css';
import { useEffect, useRef, useState } from 'react';
import SalesOrderRepository from '../../../../../repository/sales/SalesOrderRepository';
import ContentHeader from '../../../../../components/content_header/ContentHeader';
import ActionButton from '../../../../../components/button/actionbutton/ActionButton';
import { useToast } from '../../../../../context/ToastContext';
import Formatting from '../../../../../utils/format/Formatting';
import uploadFileAndGetURL from '../../../../../utils/helper/uploadImage';
import TransferRepository from '../../../../../repository/warehouse/TransferRepository';
import ItemsRepository from '../../../../../repository/warehouse/ItemsRepository';
import { serverTimestamp } from 'firebase/firestore';

const DEFAULT_TIMER_SECONDS = 24 * 60 * 60;

const DetailListOrder = () => {
    const { id } = useParams();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [salesOrder, setSalesOrder] = useState(null);
    const [confirmationModal, setConfirmationModal] = useState(false);
    const [timerModal, setTimerModal] = useState(false);

    const orderIdRef = useRef(null);
    const [timers, setTimers] = useState({});
    const [transferProof, setTransferProof] = useState(null);
    const [transferProofPreview, setTransferProofPreview] = useState(null);
    const [showFullImage, setShowFullImage] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log('List Order || Sales Order: ', salesOrder);
    }, [salesOrder]);

    const handleOpenTimerModal = () => {
        const existingStartTime = localStorage.getItem(`startTime_${id}`);

        if (!existingStartTime) {
            // Cek apakah data order sudah punya createdAt
            if (salesOrder?.createdAt?.toDate) {
                const createdAtTimestamp = salesOrder.createdAt.toDate().getTime(); // ms
                localStorage.setItem(`startTime_${id}`, createdAtTimestamp.toString());
            } else {
                // fallback kalau createdAt belum bisa diakses
                const now = Date.now();
                localStorage.setItem(`startTime_${id}`, now.toString());
            }
        }

        setTimerModal(true);
    };

    useEffect(() => {
        if (transferProof) {
            const objectUrl = URL.createObjectURL(transferProof);
            setTransferProofPreview(objectUrl);

            // Cleanup
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setTransferProofPreview(null);
        }
    }, [transferProof]);


    useEffect(() => {
        if (!id || !timerModal) return;

        orderIdRef.current = id;

        const startTime = parseInt(localStorage.getItem(`startTime_${id}`), 10);
        if (!startTime) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - startTime) / 1000);
            const timeLeft = Math.max(DEFAULT_TIMER_SECONDS - elapsedSeconds, 0);

            setTimers((prev) => ({ ...prev, [id]: timeLeft }));

            if (timeLeft === 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [id, timerModal]);

    const currentTime = id && timers[id] !== undefined
        ? timers[id]
        : DEFAULT_TIMER_SECONDS;

    useEffect(() => {
        const fetchSalesOrderDetails = async () => {
            try {
                const details = await SalesOrderRepository.getSalesOrderById(id);
                setSalesOrder(details);
            } catch (error) {
                console.error("Error fetching sales order details: ", error);
            }
        };
        fetchSalesOrderDetails();
    }, [id]);

    const handleUpdateOrderStatus = async (status, successMessage, failMessage) => {
        try {
            await SalesOrderRepository.updateStatusValue(id, status);
            showToast('berhasil', successMessage);
            const updated = await SalesOrderRepository.getSalesOrderById(id);
            setSalesOrder(updated);
        } catch (error) {
            showToast('gagal', failMessage);
            console.log('Error when cancelling order : ', error);
        }
    };


    const handleUpdateTransferProof = async () => {
        if (!transferProof) {
            showToast("gagal", "Harap upload bukti transfer");
            return;
        }

        try {
            const path = `bukti_transfer/${id}/${transferProof.name}`;
            const url = await uploadFileAndGetURL(transferProof, path);

            // Update field di Firestore
            await SalesOrderRepository.updateSalesOrder(id, {
                transferProof: url,
                status: "mengantri",
                paymentDate: serverTimestamp(),
            });

            showToast("berhasil", "Bukti transfer berhasil diupload!");
            setTimerModal(false);
            setSalesOrder((prev) => ({
                ...prev,
                transferProof: url,
                paymentDate: serverTimestamp(),
                status: "mengantri",
            }));


        } catch (err) {
            showToast("gagal", "Upload bukti transfer gagal");
            console.error("Upload error: ", err);
        }
    }

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    if (!salesOrder) return <div>Loading...</div>;

    const { customer, items, description, status, express, createdAt, code } = salesOrder;

    const handleCancelOrder = async () => {
        setLoading(true);
        console.log('Itemss: ', items);

        try {
            const transfer = await TransferRepository.getTransferBySOCode(code);
            const transferItems = transfer?.items || [];
            const location = salesOrder.customer?.selectedAddress?.city?.toLowerCase();

            const processedIds = new Set();

            // Step 1: Proses transfer item jika ada
            if (transfer) {
                const { locationFrom, locationTo } = transfer;

                for (const item of transferItems) {
                    const itemData = await ItemsRepository.getItemsById(item.id);
                    const stock = itemData.stock || {};

                    // Tambah kembali ke asal
                    stock[locationFrom] = (stock[locationFrom] || 0) + item.qty;

                    // Kurangi dari tujuan
                    stock[locationTo] = Math.max((stock[locationTo] || 0) - item.qty, 0);

                    console.log('Transfer item:', item.id);
                    console.log('Stock:', stock);

                    await ItemsRepository.updateStockOrder(item.id, stock);
                    processedIds.add(item.id); // tandai item sudah diproses
                }
            }

            // Step 2: Proses sisa item yang tidak ada di transfer
            for (const item of items) {
                const itemId = item.item.id;

                if (processedIds.has(itemId)) continue; // sudah diproses via transfer

                const itemData = await ItemsRepository.getItemsById(itemId);
                const stock = itemData.stock || {};

                stock[location] = (stock[location] || 0) + item.qty;

                console.log('Non-transfer item:', itemId);
                console.log('Stock:', stock);

                await ItemsRepository.updateStockOrder(itemId, stock);
            }

            setConfirmationModal(false);

            if (transfer?.id) {
                await TransferRepository.deleteTransfer(transfer.id);
            }

            await SalesOrderRepository.deleteSalesOrder(id);
            navigate('/customer/list-orders');
            showToast("berhasil", "Stok berhasil dikembalikan dari pembatalan pesanan.");
        } catch (error) {
            console.error("Gagal melakukan pengembalian stok: ", error);
            showToast("gagal", "Terjadi kesalahan saat mengembalikan stok.");
        } finally {
            setLoading(false);
        }
    };



    const totalItemPrice = items.reduce((sum, { price, qty }) => sum + price * qty, 0);
    const shippingCost = express?.price || 0;
    const totalPayment = totalItemPrice + shippingCost;

    return (
        <div className='main-container'>
            <ContentHeader title="Rincian Pesanan" />

            <div className="order-detail-container">
                <div className='order-detail-info'>
                    <div className='order-detail-section'>
                        <div className='order-detail-field'>Alamat Pelanggan: <span>{customer?.selectedAddress?.address || '-'}</span></div>
                        <div className='order-detail-field'>Kota: <span>{customer?.selectedAddress?.city || '-'}</span></div>
                        <div className='order-detail-field'>Provinsi: <span>{customer?.selectedAddress?.province || '-'}</span></div>
                    </div>

                    <div className='order-detail-section'>
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
                            <th>Harga Satuan</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(({ item, qty, price }, index) => (
                            <tr key={index}>
                                <td>{item.name}</td>
                                <td>{qty}</td>
                                <td>Rp {price.toLocaleString('id-ID')}</td>
                                <td>Rp {(price * qty).toLocaleString('id-ID')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="order-total">
                    <div><strong>Total Harga Barang: </strong>Rp {totalItemPrice.toLocaleString('id-ID')}</div>
                    <div><strong>Biaya Pengiriman: </strong>Rp {shippingCost.toLocaleString('id-ID')}</div>
                    <div style={{ marginTop: '10px', fontSize: '18px' }}>
                        <strong>Total Pembayaran: Rp {totalPayment.toLocaleString('id-ID')}</strong>
                    </div>
                </div>

                {salesOrder.status === 'pembayaran ditolak' && <div className='payment-declined-description'>Alasan pembayaran ditolak: <span>{salesOrder.paymentCancelDescription}</span></div>}
                
                {salesOrder.status === 'dalam perjalanan' && (
                    <div>
                    <div>No. Resi <strong>{salesOrder?.expeditionResi || ''}</strong></div>
                    <div>Pesanan anda dalam perjalanan</div>
                    <div>Anda dapat memasukkan nomor resi di link berikut.</div>
                    <a href='https://jne.co.id/tracking-package'>Website JNE</a>
                </div>
                )}
            </div>

            {(salesOrder.status === 'menunggu pembayaran' || salesOrder.status === 'pembayaran ditolak') && (
                <div className='detail-order-button'>
                    <ActionButton
                        title={'Batalkan Pesanan'}
                        background={'red'}
                        onclick={() => setConfirmationModal(true)}
                    />
                    <ActionButton title={'Lakukan Pembayaran'} onclick={handleOpenTimerModal} />
                </div>
            )}

            {salesOrder.status === 'batal' && (
                <ActionButton
                    title={'Lakukan Pemesanan Ulang'}
                    onclick={handleDeleteSalesOrder}
                />
            )}

            {salesOrder.status === 'tertunda' && (
                <div>Pesanan anda menunggu barang masuk...</div>
            )}

            {salesOrder.status === 'pending' && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'end', flexDirection: 'column' }}>
                    <div className='customer-order-pending'>Pesanan anda telah tersedia</div>
                    <div className='customer-order-pending-button'>
                        <ActionButton
                            title={'Batalkan'}
                            onclick={() =>
                                handleUpdateOrderStatus(
                                    'batal',
                                    'Pesanan berhasil dibatalkan',
                                    'Pesanan gagal dibatalkan'
                                )
                            }
                            background={'red'}
                        />
                        <ActionButton
                            title={'Pesan Sekarang'}
                            onclick={() =>
                                handleUpdateOrderStatus(
                                    'mengantri',
                                    'Pesanan berhasil dipesan',
                                    'Pesanan gagal dipesan'
                                )
                            }
                        />
                    </div>
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

            {timerModal && (
                <div className="modal-overlay" onClick={() => setTimerModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Silakan Lakukan Pembayaran</h2>
                        <p className="modal-subtitle">Waktu tersisa untuk melakukan pembayaran:</p>
                        <h3 className="countdown-timer">{formatTime(currentTime)}</h3>

                        <div className="bank-info">
                            <h4>Transfer ke Rekening:</h4>
                            <div><strong>Bank:</strong> BCA</div>
                            <div><strong>No Rek:</strong> 1234567890</div>
                            <div><strong>Atas Nama:</strong> PT. RIKO Parts</div>
                        </div>

                        <div className="upload-proof">
                            <label htmlFor="proof">Upload Bukti Transfer:</label><br />
                            <input
                                type="file"
                                id="proof"
                                accept="image/*,application/pdf"
                                onChange={(e) => setTransferProof(e.target.files[0])}
                            />

                            {transferProof && <p className="uploaded-file">File: {transferProof.name}</p>}

                            {transferProofPreview && (
                                <div style={{ marginTop: "10px" }}>
                                    <img
                                        src={transferProofPreview}
                                        alt="Preview Bukti Transfer"
                                        style={{
                                            maxWidth: "200px",
                                            maxHeight: "200px",
                                            borderRadius: "8px",
                                            border: "1px solid #ccc",
                                            cursor: "pointer",
                                            transition: "transform 0.2s ease-in-out"
                                        }}
                                        title="Klik untuk lihat ukuran penuh"
                                        onClick={() => setShowFullImage(true)}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setTimerModal(false)}>Tutup</button>
                            <button
                                className="btn btn-primary"
                                onClick={handleUpdateTransferProof}
                            >
                                Submit Bukti Transfer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showFullImage && (
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
                        src={transferProofPreview}
                        alt="Bukti Transfer Full"
                        style={{
                            maxWidth: "90%",
                            maxHeight: "90%",
                            borderRadius: "8px",
                            boxShadow: "0 0 15px rgba(255,255,255,0.5)"
                        }}
                    />
                </div>
            )}

        </div>
    );
};

export default DetailListOrder;
