import { useNavigate, useParams } from 'react-router-dom';
import './DetailInvoice.css'
import { useEffect, useState } from 'react';
import InvoiceOrderRepository from '../../../../../../repository/logistic/InvoiceOrderRepository';
import EntityInvoice from '../../components/entity_invoice/EntityInvoice';

const DetailInvoice = () => {
    // Hooks
    const { id } = useParams();
    const navigate = useNavigate();

    // Variables
    const [invoiceOrder, setInvoiceOrder] = useState([]);

    // Fetch the invoiceOrder details using the id from the URL
    useEffect(() => {
        const fetchInvoiceOrderDetails = async () => {
            try {
                const invoiceOrderDetails = await InvoiceOrderRepository.getInvoiceOrderById(id);
                setInvoiceOrder(invoiceOrderDetails);
            } catch (error) {
                console.error("Error fetching invoice order details: ", error);
            }
        };

        fetchInvoiceOrderDetails();
    }, [id]);

    return (
        <div>
            <EntityInvoice
                mode={'detail'}
                initialData={invoiceOrder}
                onSubmit={async (data) => {
                    await InvoiceOrderRepository.updateInvoiceOrder(id, data);
                    navigate('/logistic/invoice')
                }}
            />
        </div>
    )
}

export default DetailInvoice;