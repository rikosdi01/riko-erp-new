import { useParams } from 'react-router-dom';
import './DetailSalesOrder.css'
import { useEffect, useState } from 'react';
import EntitySalesOrder from '../../components/entity_sales_order/EntitySalesOrder';
import SalesOrderRepository from '../../../../../../repository/sales/SalesOrderRepository';

const DetailSalesOrder = () => {
    // Hooks
    const { id } = useParams();

    // Variables
    const [transfer, setTransfer] = useState([]);

    // Fetch the transfer details using the id from the URL
    useEffect(() => {
        const fetchSalesOrderDetails = async () => {
            try {
                const salesOrderDetails = await SalesOrderRepository.getSalesOrderById(id);
                setTransfer(salesOrderDetails);
            } catch (error) {
                console.error("Error fetching sales order details: ", error);
            }
        };

        fetchSalesOrderDetails();
    }, [id]);

    return (
        <div>
            <EntitySalesOrder
                mode={'detail'}
                initialData={transfer}
                onSubmit={async (data) => {
                    await SalesOrderRepository.updateSalesOrder(id, data);
                }}
            />
        </div>
    )
}

export default DetailSalesOrder;