import { useNavigate, useParams } from 'react-router-dom';
import './DetailListOrder.css';
import { useEffect, useRef, useState } from 'react';
import SalesOrderRepository from '../../../../../repository/sales/SalesOrderRepository';
import ContentHeader from '../../../../../components/content_header/ContentHeader';
import ActionButton from '../../../../../components/button/actionbutton/ActionButton';
import { useToast } from '../../../../../context/ToastContext';
import Formatting from '../../../../../utils/format/Formatting';

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

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    if (!salesOrder) return <div>Loading...</div>;

    const { customer, items, description, status, express, createdAt } = salesOrder;

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
                        <div><strong>Estimasi Pengiriman: </strong>{express ? `${express.estimationStart}-${express.estimationEnd} Hari` : '-'}</div>
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
            </div>

            {salesOrder.status === 'menunggu pembayaran' && (
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
                    onclick={() => {
                        handleUpdateOrderStatus(
                            'mengantri',
                            'Pesanan berhasil dipesan ulang',
                            'Pesanan gagal dipesan ulang'
                        )
                        localStorage.removeItem(`startTime_${id}`);
                    }
                    }
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
                        <div className='modal-title' style={{ marginBottom: '40px', fontSize: '20px' }}>
                            Apakah Anda yakin ingin membatalkan pesanan ini?
                        </div>
                        <div className='modal-actions'>
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
                                onclick={() => {
                                    handleUpdateOrderStatus(
                                        'batal',
                                        'Pesanan berhasil dibatalkan',
                                        'Pesanan gagal dibatalkan'
                                    );
                                    setConfirmationModal(false);
                                }}
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
                            <p><strong>Bank:</strong> BCA</p>
                            <p><strong>No Rek:</strong> 1234567890</p>
                            <p><strong>Atas Nama:</strong> PT. RIKO Parts</p>
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
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setTimerModal(false)}>Tutup</button>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    if (!transferProof) {
                                        showToast("gagal", "Harap upload bukti transfer");
                                        return;
                                    }

                                    console.log("Bukti transfer: ", transferProof);
                                    showToast("berhasil", "Bukti transfer telah diupload!");
                                    setTimerModal(false);
                                }}
                            >
                                Submit Bukti Transfer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailListOrder;
