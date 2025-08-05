import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../../../../../context/ToastContext';
import InvoiceOrderRepository from '../../../../../../repository/logistic/InvoiceOrderRepository';
import Formatting from '../../../../../../utils/format/Formatting';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import DeliveryOrderRepository from '../../../../../../repository/logistic/DeliveryOrderRepository';
import SalesOrderRepository from '../../../../../../repository/sales/SalesOrderRepository';
import './DetailInvoice.css';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InvoicePrintPreview from '../../components/invoice_print_preview/InvoicePrintPreview';
import { File } from 'lucide-react';

const DetailInvoice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const [invoiceOrder, setInvoiceOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('Invoice Order: ', invoiceOrder);
    }, [invoiceOrder]);

    useEffect(() => {
        console.log('Show Preview: ', showPreview);
    })

    // Effect untuk mengambil data faktur pesanan
    useEffect(() => {
        const fetchInvoiceOrder = async () => {
            try {
                const details = await InvoiceOrderRepository.getInvoiceOrderById(id);
                setInvoiceOrder(details);
            } catch (error) {
                console.error("Error fetching invoice order details: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoiceOrder();
    }, [id]);

    // Hitung total harga dan diskon dari items
    const calculatedTotals = invoiceOrder?.doData?.soData?.items?.reduce((acc, item) => {
        const subtotal = item.qty * item.price;
        const subDiscount = subtotal * (item.discount || 0);
        acc.totalPrice += subtotal;
        acc.totalDiscount += subDiscount;
        return acc;
    }, { totalPrice: 0, totalDiscount: 0 });

    const handleFinishOrder = async () => {
        try {
            await SalesOrderRepository.updateStatusValue(invoiceOrder.doData?.soData?.id, 'selesai');
            await DeliveryOrderRepository.updateStatusDeliveryOrder(invoiceOrder.doData?.id, 'selesai');
            await InvoiceOrderRepository.updateStatusValue(invoiceOrder.id, 'selesai');
            showToast("berhasil", "Faktur berhasil diselesaikan!");
            navigate('/logistic/invoice-order');
        } catch (error) {
            console.error("Gagal memperbarui status:", error);
            showToast("gagal", "Gagal menyelesaikan Faktur!");
        }
    }

    if (loading) {
        return <div className="loading-container">Memuat detail faktur...</div>;
    }

    if (!invoiceOrder) {
        return <div className="loading-container">Faktur tidak ditemukan.</div>;
    }

    return (
        <div className='main-container'>
            <div className="invoice-container">
                <ContentHeader
                    title={'Rincian Faktur Pesanan'}
                    // enablePrint={true}
                    // printerClick={() => {
                    //     setShowPreviewModal(true)
                    //     setShowPreview(true)
                    // }}
                />

                <div style={{ display: 'flex', justifyContent: 'end', marginBottom: '10px' }}>
                    <ActionButton
                        title={'Pratinjau'}
                        icon={<File />}
                        onclick={() => setShowPreviewModal(true)}
                    />
                </div>


                {/* Informasi Umum */}
                <div className="invoice-info-grid">
                    <div className="info-card">
                        <h3 className="card-title">Informasi Pesanan</h3>
                        <div className="info-item"><strong>No. Faktur:</strong><span>{invoiceOrder.code}</span></div>
                        <div className="info-item"><strong>No. SO:</strong><span>{invoiceOrder.doData?.soData?.code}</span></div>
                        <div className="info-item"><strong>No. DO:</strong><span>{invoiceOrder.doData?.code}</span></div>
                    </div>

                    <div className="info-card">
                        <h3 className="card-title">Informasi Pelanggan</h3>
                        <div className="info-item"><strong>Nama:</strong><span>{invoiceOrder.doData?.soData?.customer?.username}</span></div>
                        <div className="info-item"><strong>Telepon:</strong><span>{invoiceOrder.doData?.soData?.customer?.phone}</span></div>
                        <div className="info-item"><strong>Alamat:</strong><span>{invoiceOrder.doData?.soData?.customer?.selectedAddress?.address}</span></div>
                        <div className="info-item"><strong>Kota / Provinsi:</strong><span>{invoiceOrder.doData?.soData?.customer?.selectedAddress?.city}, {invoiceOrder.doData?.soData?.customer?.selectedAddress?.province}</span></div>
                    </div>
                </div>

                {/* Informasi Ekspedisi dan Kurir */}
                <div className="invoice-info-grid">
                    <div className="info-card">
                        <h3 className="card-title">Pengiriman</h3>
                        <div className="info-item"><strong>Ekspedisi:</strong><span>{invoiceOrder.doData?.soData?.express?.name}</span></div>
                        <div className="info-item"><strong>Estimasi:</strong><span>{invoiceOrder.doData?.soData?.express?.estimationStart}-{invoiceOrder.doData?.soData?.express?.estimationEnd} hari</span></div>
                        <div className="info-item"><strong>Keterangan:</strong><span>{invoiceOrder.doData?.soData?.description || '-'}</span></div>
                    </div>

                    <div className="info-card">
                        <h3 className="card-title">Tanggal</h3>
                        <div className="info-item"><strong>Pesanan (SO):</strong><span>{Formatting.formatDateByTimestamp(invoiceOrder.doData?.soData?.createdAt)}</span></div>
                        <div className="info-item"><strong>Pengiriman (DO):</strong><span>{Formatting.formatDateByTimestamp(invoiceOrder.doData?.createdAt)}</span></div>
                        <div className="info-item"><strong>Faktur:</strong><span>{Formatting.formatDateByTimestamp(invoiceOrder.createdAt)}</span></div>
                    </div>
                </div>

                {/* Item yang Dipesan */}
                {invoiceOrder.doData?.soData?.items?.length > 0 && (
                    <div className="invoice-items-card">
                        <h3 className="card-title">Detail Barang</h3>
                        <div className="table-responsive">
                            <table className="invoice-table">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Kode Barang</th>
                                        <th>Nama Barang</th>
                                        <th>Qty</th>
                                        <th>Harga</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceOrder.doData.soData.items.map((item, index) => {
                                        const subtotal = item.qty * item.price * (1 - (item.discount || 0));
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.item?.code}</td>
                                                <td>{item.item?.name}</td>
                                                <td>{item.qty}</td>
                                                <td>{Formatting.formatCurrencyIDR(item.price)}</td>
                                                <td>{Formatting.formatCurrencyIDR(subtotal)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Total dan Status */}
                <div className="invoice-summary-section">
                    <h3 className="card-title">Ringkasan Pembayaran</h3>
                    <div className="summary-details">
                        <div className="summary-item"><strong>Biaya Pesanan:</strong><span>{Formatting.formatCurrencyIDR(calculatedTotals?.totalPrice)}</span></div>
                        <div className="summary-item"><strong>Biaya Pengiriman:</strong><span>{Formatting.formatCurrencyIDR(invoiceOrder?.doData?.soData?.express?.price)}</span></div>
                        <div className="summary-item"><strong>Total Pembayaran:</strong><span>{Formatting.formatCurrencyIDR(invoiceOrder?.doData?.soData?.totalPayment)}</span></div>
                        <div className="summary-item status-item">
                            <strong>Status Pembayaran:</strong>
                            <span className={`status-badge.selesai`}>
                                Lunas
                            </span>
                        </div>
                    </div>
                </div>

                {invoiceOrder.statusPayment === 'menunggu pembayaran' && (
                    <div className="action-button-container">
                        <ActionButton
                            title={'Selesaikan Faktur'}
                            onclick={handleFinishOrder}
                            className={'action-button primary'}
                        />
                    </div>
                )}

                {showPreviewModal && (
                    <div
                        className='modal-overlay'
                        onClick={() => setShowPreviewModal(false)} // Klik di luar modal akan menutup modal
                    >
                        <div
                            className='modal-content'
                            style={{ maxWidth: '800px' }}
                            onClick={(e) => e.stopPropagation()} // Cegah penutupan jika klik di dalam modal
                        >
                            <InvoicePrintPreview
                                key={showPreview}
                                printToggle={showPreview}
                                invoiceOrder={invoiceOrder}
                                onClose={() => setShowPreviewModal(false)}
                                calculatedTotals={calculatedTotals}
                            />
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
};

export default DetailInvoice;
