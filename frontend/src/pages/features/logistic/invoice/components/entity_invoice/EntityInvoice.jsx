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
    const {
        code,
        customer,
        salesman,
        courier,
        express,
        description,
        totalPrice,
        totalDiscount,
        totalPayment,
        statusPayment,
        soDate,
        doDate,
        dueData,
        doId,
    } = initialData;
    console.log('Initial Data: ', initialData);

    const [customerData, setCustomerData] = useState(null);
    const [doDataFetched, setDoDataFetched] = useState(null);
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        const fetchCustomer = async () => {
            if (customer?.id) {
                const data = await CustomersRepository.getCustomersById(customer.id);
                setCustomerData(data);
            }
        };
        fetchCustomer();
    }, [customer]);

    useEffect(() => {
        const fetchDoData = async () => {
            if (doId) {
                const data = await DeliveryOrderRepository.getDeliveryOrderById(doId);
                setDoDataFetched(data);
            }
        };
        fetchDoData();
    }, [doId]);

    useEffect(() => {
        console.log('Customer Data: ', customerData);
    }, [customerData]);



    useEffect(() => {
        console.log('Delivery Data: ', doDataFetched);
    }, [doDataFetched]);


    const handleFinishOrder = async () => {
        try {
            await SalesOrderRepository.updateStatusValue(initialData.soId, 'selesai');
            await DeliveryOrderRepository.updateStatusDeliveryOrder(initialData.doId, 'selesai');
            await InvoiceRepository.updateStatusValue(initialData.id || initialData.objectID, 'selesai');
            showToast("berhasil", "Faktur berhasil diselesaikan!");
            navigate('/logistic/invoice-order')
        } catch (error) {
            console.error("Gagal memperbarui status:", error);
            showToast("gagal", "Gagal menyelesaikan Faktur!");
        }
    }


    return (
        <div className="main-container">
            <h2 className="invoice-title">Detail Faktur Pembelian</h2>

            {/* Informasi Umum */}
            <div className="invoice-section">
                <div>
                    <h3>Informasi Pesanan</h3>
                    <div><strong>No. Faktur:</strong> {code}</div>
                    <div><strong>Kode DO:</strong> {doDataFetched?.code}</div>
                    <div><strong>Gudang:</strong> {doDataFetched?.warehouse?.name} - {doDataFetched?.warehouse?.location}</div>
                </div>
                <div>
                    <h3>Informasi Pelanggan</h3>
                    <div><strong>Nama:</strong> {customerData?.name}</div>
                    <div><strong>Telepon:</strong> {customerData?.phone}</div>
                    <div><strong>Alamat:</strong> {customerData?.address}</div>
                    <div><strong>Kota / Provinsi:</strong> {customerData?.city}, {customerData?.province}</div>
                </div>
            </div>

            {/* Informasi Ekspedisi dan Kurir */}
            <div className="invoice-section">
                <div>
                    <h3>Pengiriman</h3>
                    <div><strong>Kurir:</strong> {courier?.name} ({courier?.phone})</div>
                    <div><strong>Ekspedisi:</strong> {express?.name} - {express?.service} ({express?.set})</div>
                    <div><strong>Telepon Ekspedisi:</strong> {express?.phone}</div>
                    <div><strong>Keterangan:</strong> {description}</div>
                </div>
                {/* Tanggal */}
                <div>
                    <h3>Tanggal</h3>
                    <div><strong>Pesanan (SO):</strong> {Formatting.formatDateByTimestamp(soDate)}</div>
                    <div><strong>Pengiriman (DO):</strong> {Formatting.formatDateByTimestamp(doDate)}</div>
                    <div><strong>Jatuh Tempo:</strong> {Formatting.formatDateByTimestamp(dueData)}</div>
                </div>
            </div>


            {/* Item yang Dipesan */}
            {doDataFetched?.items?.length > 0 && (
                <div className="invoice-section">
                    <div>
                        <h3>Detail Barang</h3>
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
                                    const subtotal = item.qty * item.price * (1 - item.discount);
                                    return (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.item?.code}</td>
                                            <td>{item.item?.name}</td>
                                            <td>{item.qty}</td>
                                            <td>{Formatting.formatCurrencyIDR(item.price)}</td>
                                            <td>{item.discount * 100}%</td>
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
            <div className="invoice-section">
                <div>
                    <h3>Ringkasan Pembayaran</h3>
                    <div><strong>Total Harga:</strong> {Formatting.formatCurrencyIDR(totalPrice)}</div>
                    <div><strong>Total Diskon:</strong> {Formatting.formatCurrencyIDR(totalDiscount)}</div>
                    <div><strong>Total Pembayaran:</strong> {Formatting.formatCurrencyIDR(totalPayment)}</div>
                    <div><strong>Status Pembayaran:</strong> {statusPayment ? statusPayment.charAt(0).toUpperCase() + statusPayment.slice(1) : '-'}</div>
                </div>
            </div>

            {statusPayment === 'menunggu pembayaran' && (
                <ActionButton
                    title={'Selesaikan Faktur'}
                    onclick={handleFinishOrder}
                />
            )}
        </div>
    );
};

export default EntityInvoice;
