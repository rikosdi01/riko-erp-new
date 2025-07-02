import { useParams } from 'react-router-dom';
import './DetailDeliveryOrder.css'
import { useEffect, useState } from 'react';
import SalesOrderRepository from '../../../../../../repository/sales/SalesOrderRepository';
import EntityDeliveryOrder from '../../components/entity_delivery_order/EntityDeliveryOrder';
import DeliveryOrderRepository from '../../../../../../repository/logistic/DeliveryOrderRepository';

const DetailDeliveryOrder = () => {
    // Hooks
    const { id } = useParams();

    // Variables
    const [deliveryOrder, setDeliveryOrder] = useState([]);

    // Fetch the deliveryOrder details using the id from the URL
    useEffect(() => {
        const fetchSalesOrderDetails = async () => {
            try {
                const salesOrderDetails = await DeliveryOrderRepository.getDeliveryOrderById(id);
                setDeliveryOrder(salesOrderDetails);
            } catch (error) {
                console.error("Error fetching sales order details: ", error);
            }
        };

        fetchSalesOrderDetails();
    }, [id]);

    return (
        <div>
            <EntityDeliveryOrder
                mode={'detail'}
                initialData={deliveryOrder}
                onSubmit={async (data) => {
                    await SalesOrderRepository.updateSalesOrder(id, data);
                }}
            />
        </div>
    )
}

export default DetailDeliveryOrder;