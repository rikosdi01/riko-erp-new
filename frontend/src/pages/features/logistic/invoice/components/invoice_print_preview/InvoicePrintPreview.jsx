import React, { useEffect, useRef } from 'react';
import './InvoicePrintPreview.css';
import Formatting from '../../../../../../utils/format/Formatting';
import { Printer } from 'lucide-react';

const InvoicePrintPreview = ({
    invoiceOrder,
    printToggle,
    onClose,
    calculatedTotals,
}) => {
    const printRef = useRef(null);

    useEffect(() => {
        if (!printToggle) return;
        window.print();

        const handleAfterPrint = () => {
            setTimeout(() => {
                onClose(); // delay kecil agar komponen bisa me-remount di klik berikutnya
            }, 200); // delay 200ms
        };

        window.addEventListener('afterprint', handleAfterPrint);
        return () => {
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, [onClose]);


    // Data dari invoiceOrder
    const doData = invoiceOrder?.doData || {};
    const soData = doData.soData || {};
    const customer = soData.customer || {};

    return (
        <div className="print-preview" ref={printRef}>
            <header className="invoice-header">
                <div className="company-info">
                    <h1>RIKO Parts</h1>
                    <p>Jl. Wahidin No. 52M, Medan, Sumatera Utara</p>
                    <p>Phone: 0812-3456-7890 | Email: info@rikoparts.com</p>
                </div>
                <div className="invoice-title-box">
                    <h2>FAKTUR PESANAN</h2>
                    <p>No. Faktur: <strong>{invoiceOrder.code}</strong></p>
                    <p>Tanggal: <strong>{Formatting.formatDateByTimestamp(invoiceOrder.createdAt)}</strong></p>
                </div>
            </header>

            <section className="invoice-details">
                <div className="customer-info">
                    <p><strong>Ditujukan Kepada:</strong></p>
                    <p>Nama: {customer.username}</p>
                    <p>Alamat: {customer.selectedAddress?.address}, {customer.selectedAddress?.city}, {customer.selectedAddress?.province}</p>
                    <p>Telepon: {customer.phone}</p>
                </div>
                <div className="order-info">
                    <p><strong>Informasi Pesanan:</strong></p>
                    <p>Kode SO: {soData.code}</p>
                    <p>Kode DO: {doData.code}</p>
                    <p>Ekspedisi: {invoiceOrder.doData?.soData?.express?.name} - {invoiceOrder.express?.service}</p>
                </div>
            </section>

            <section className="invoice-items-table">
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Barang</th>
                            <th>Qty</th>
                            <th>Harga Satuan</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {doData.soData?.items?.map((item, i) => {
                            const subtotal = item.qty * item.price * (1 - (item.discount || 0));
                            return (
                                <tr key={i}>
                                    <td>{i + 1}</td>
                                    <td>{item.item?.name}</td>
                                    <td>{item.qty}</td>
                                    <td>{Formatting.formatCurrencyIDR(item.price)}</td>
                                    <td>{Formatting.formatCurrencyIDR(subtotal)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </section>

            <section className="invoice-summary-and-signature">
                <div className="invoice-summary">
                    <div className="summary-row">
                        <span>Total Harga:</span>
                        <span>{Formatting.formatCurrencyIDR(calculatedTotals.totalPrice)}</span>
                    </div>
                    <div className="summary-row">
                        <span>Total Pengiriman:</span>
                        <span>{Formatting.formatCurrencyIDR(invoiceOrder.doData.soData.express.price)}</span>
                    </div>
                    <div className="summary-row grand-total">
                        <span>Grand Total:</span>
                        <span>{Formatting.formatCurrencyIDR(invoiceOrder.doData.soData.totalPayment)}</span>
                    </div>
                </div>
                <div className="invoice-signature">
                    <p>Hormat Kami,</p>
                    <br /><br />
                    <p>_________________________</p>
                    <p>Manajer Penjualan</p>
                </div>
            </section>

            <footer className="invoice-footer">
                <p>Terima kasih atas pesanan Anda!</p>
            </footer>
        </div>
    );
};

export default InvoicePrintPreview;
