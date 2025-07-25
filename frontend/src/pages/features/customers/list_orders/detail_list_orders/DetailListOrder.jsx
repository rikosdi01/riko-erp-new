import { useNavigate, useParams } from 'react-router-dom';
import './DetailListOrder.css';
import { useEffect, useState } from 'react';
import SalesOrderRepository from '../../../../../repository/sales/SalesOrderRepository';
import ContentHeader from '../../../../../components/content_header/ContentHeader';
import ActionButton from '../../../../../components/button/actionbutton/ActionButton';
import { useToast } from '../../../../../context/ToastContext';

const DetailListOrder = () => {
    const { id } = useParams();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [salesOrder, setSalesOrder] = useState(null);
    const [confirmationModal, setConfirmationModal] = useState(false);

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

    const handleUpdateOrderStatus = async (
        status,
        successMessage,
        failMessage,
    ) => {
        try {
            await SalesOrderRepository.updateStatusValue(id, status);
            showToast('berhasil', successMessage);
            navigate('/customer/list-orders');
        } catch (error) {
            showToast('gagal', failMessage)
            console.log('Error when cancelling order : ', error);
        }
    }

    if (!salesOrder) return <div>Loading...</div>;

    const { customer, items, description, status, totalPrice, createdAt } = salesOrder;

    return (
        <div className='main-container'>
            <ContentHeader title="Rincian Pesanan" />

            <div className="order-detail-container">
                <h3>Informasi Pemesanan</h3>
                <p><strong>Nama Pelanggan:</strong> {customer?.name}</p>
                <p><strong>Tanggal Pesanan:</strong> {new Date(createdAt.seconds * 1000).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {status.charAt(0).toUpperCase() + status.slice(1)}</p>
                <p><strong>Catatan:</strong> {description || '-'}</p>

                <h3>Daftar Produk</h3>
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
                        {items.map((itemObj, index) => {
                            const { item, qty, price } = itemObj;
                            return (
                                <tr key={index}>
                                    <td>{item.name}</td>
                                    <td>{qty}</td>
                                    <td>Rp {price.toLocaleString()}</td>
                                    <td>Rp {(price * qty).toLocaleString()}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <div className="order-total">
                    <strong>Total Harga: Rp {totalPrice.toLocaleString()}</strong>
                </div>
            </div>

            {salesOrder.status === 'mengantri' ? (
                <ActionButton
                    title={'Batalkan Pesanan'}
                    background={'red'}
                    onclick={() => setConfirmationModal(true)}
                />
            ) : (
                <ActionButton
                    title={'Lakukan Pemesanan Ulang'}
                    onclick={() =>
                        handleUpdateOrderStatus(
                            'mengantri',
                            'Pesanan berhasil dipesan ulang',
                            'Pesanan gagal dipesan ulang'
                        )}
                />
            )}

            {confirmationModal && (
                <div className='modal-overlay'>
                    <div className="modal">
                        <div className='modal-title' style={{ marginBottom: '40px', fontSize: '20px' }}>Apakah Anda yakin ingin membatalkan pesanan ini?</div>
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
        </div>
    );
};

export default DetailListOrder;
