import React, { useState } from 'react';
import './EntityInvoice.css';
import Formatting from '../../../../../../utils/format/Formatting';
import { useEffect } from 'react';
import CustomersRepository from '../../../../../../repository/sales/CustomersRepository';
import DeliveryOrderRepository from '../../../../../../repository/logistic/DeliveryOrderRepository';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import SalesOrderRepository from '../../../../../../repository/sales/SalesOrderRepository';
import InvoiceRepository from '../../../../../../repository/sales/InvoiceRepository';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../../../../context/ToastContext';

const EntityInvoice = ({ mode, initialData = {}, onSubmit }) => {
    // Destrukturisasi data dari initialData. Gunakan optional chaining untuk menghindari error
    const {
        code,
        statusPayment,
        courier,
        express,
        description,
        totalPayment,
        doId,
        soId,
    } = initialData;

    const navigate = useNavigate();
    const { showToast } = useToast();

    // State untuk data yang perlu diambil dari API
    const [customerData, setCustomerData] = useState(null);
    const [doDataFetched, setDoDataFetched] = useState(null);
    const [loading, setLoading] = useState(true);

    // Effect untuk mengambil data pelanggan
    useEffect(() => {
        const fetchCustomer = async () => {
            if (initialData.doData?.soData?.customer?.uid) {
                try {
                    const data = await CustomersRepository.getCustomersById(initialData.doData.soData.customer.id);
                    setCustomerData(data);
                } catch (error) {
                    console.error("Gagal mengambil data pelanggan:", error);
                }
            }
        };
        fetchCustomer();
    }, [initialData]);

    // Effect untuk mengambil data Delivery Order
    useEffect(() => {
        const fetchDoData = async () => {
            if (doId) {
                try {
                    const data = await DeliveryOrderRepository.getDeliveryOrderById(doId);
                    setDoDataFetched(data);
                } catch (error) {
                    console.error("Gagal mengambil data DO:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        fetchDoData();
    }, [doId]);


    // Hitung total harga dan diskon
    const calculatedTotals = doDataFetched?.items?.reduce((acc, item) => {
        const subtotal = item.qty * item.price;
        const subDiscount = subtotal * (item.discount || 0);
        acc.totalPrice += subtotal;
        acc.totalDiscount += subDiscount;
        return acc;
    }, { totalPrice: 0, totalDiscount: 0 });


    const handleFinishOrder = async () => {
        try {
            await SalesOrderRepository.updateStatusValue(soId, 'selesai');
            await DeliveryOrderRepository.updateStatusDeliveryOrder(doId, 'selesai');
            await InvoiceRepository.updateStatusValue(initialData.id, 'selesai');
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

    return (
        <div className='main-container'>
            <div className="invoice-container">
                {/* Judul diubah dari "Faktur Pembelian" menjadi "Faktur Pesanan" */}
                <h2 className="invoice-title">Detail Faktur Pesanan</h2>

                {/* Informasi Umum */}
                <div className="invoice-info-grid">
                    <div className="info-card">
                        <h3 className="card-title">Informasi Pesanan</h3>
                        <div className="info-item"><strong>No. Faktur:</strong><span>{code}</span></div>
                        <div className="info-item"><strong>Kode DO:</strong><span>{doDataFetched?.code}</span></div>
                        <div className="info-item"><strong>Gudang:</strong><span>{doDataFetched?.warehouse?.name} - {doDataFetched?.warehouse?.location}</span></div>
                    </div>

                    <div className="info-card">
                        <h3 className="card-title">Informasi Pelanggan</h3>
                        <div className="info-item"><strong>Nama:</strong><span>{customerData?.username}</span></div>
                        <div className="info-item"><strong>Telepon:</strong><span>{customerData?.phone}</span></div>
                        <div className="info-item"><strong>Alamat:</strong><span>{customerData?.selectedAddress?.address}</span></div>
                        <div className="info-item"><strong>Kota / Provinsi:</strong><span>{customerData?.selectedAddress?.city}, {customerData?.selectedAddress?.province}</span></div>
                    </div>
                </div>

                {/* Informasi Ekspedisi dan Kurir */}
                <div className="invoice-info-grid">
                    <div className="info-card">
                        <h3 className="card-title">Pengiriman</h3>
                        <div className="info-item"><strong>Kurir:</strong><span>{courier?.name} ({courier?.phone})</span></div>
                        <div className="info-item"><strong>Ekspedisi:</strong><span>{express?.name} - {express?.service} ({express?.set})</span></div>
                        <div className="info-item"><strong>Telepon Ekspedisi:</strong><span>{express?.phone}</span></div>
                        <div className="info-item"><strong>Keterangan:</strong><span>{description || '-'}</span></div>
                    </div>

                    <div className="info-card">
                        <h3 className="card-title">Tanggal</h3>
                        <div className="info-item"><strong>Pesanan (SO):</strong><span>{Formatting.formatDateByTimestamp(doDataFetched?.soData?.createdAt)}</span></div>
                        <div className="info-item"><strong>Pengiriman (DO):</strong><span>{Formatting.formatDateByTimestamp(doDataFetched?.createdAt)}</span></div>
                        <div className="info-item"><strong>Pembayaran:</strong><span>{Formatting.formatDateByTimestamp(doDataFetched?.paymentDate)}</span></div>
                    </div>
                </div>

                {/* Item yang Dipesan */}
                {doDataFetched?.items?.length > 0 && (
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
                                        <th>Diskon</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {doDataFetched.items.map((item, index) => {
                                        const subtotal = item.qty * item.price * (1 - (item.discount || 0));
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.item?.code}</td>
                                                <td>{item.item?.name}</td>
                                                <td>{item.qty}</td>
                                                <td>{Formatting.formatCurrencyIDR(item.price)}</td>
                                                <td>{item.discount ? `${item.discount * 100}%` : '0%'}</td>
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
                        <div className="summary-item"><strong>Total Harga:</strong><span>{Formatting.formatCurrencyIDR(calculatedTotals?.totalPrice)}</span></div>
                        <div className="summary-item"><strong>Total Diskon:</strong><span>{Formatting.formatCurrencyIDR(calculatedTotals?.totalDiscount)}</span></div>
                        <div className="summary-item"><strong>Total Pembayaran:</strong><span>{Formatting.formatCurrencyIDR(totalPayment)}</span></div>
                        <div className="summary-item status-item">
                            <strong>Status Pembayaran:</strong>
                            <span className={`status-badge ${statusPayment ? statusPayment.toLowerCase().replace(/\s/g, '-') : ''}`}>
                                {statusPayment ? statusPayment.charAt(0).toUpperCase() + statusPayment.slice(1) : '-'}
                            </span>
                        </div>
                    </div>
                </div>

                {statusPayment === 'menunggu pembayaran' && (
                    <div className="action-button-container">
                        <ActionButton
                            title={'Selesaikan Faktur'}
                            onclick={handleFinishOrder}
                            className={'action-button primary'}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default EntityInvoice;
