import { useNavigate, useParams } from 'react-router-dom';
import './DetailDeliveryOrder.css'
import { useEffect, useState } from 'react';
import SalesOrderRepository from '../../../../../../repository/sales/SalesOrderRepository';
import EntityDeliveryOrder from '../../components/entity_delivery_order/EntityDeliveryOrder';
import DeliveryOrderRepository from '../../../../../../repository/logistic/DeliveryOrderRepository';

const DetailDeliveryOrder = () => {
    // Hooks
    const { id } = useParams();
    const navigate = useNavigate();

    // Variables
    const [deliveryOrder, setDeliveryOrder] = useState([]);

    // Fetch the deliveryOrder details using the id from the URL
    useEffect(() => {
        const fetchDeliveryOrderDetails = async () => {
            try {
                const deliverOrderDetails = await DeliveryOrderRepository.getDeliveryOrderById(id);
                setDeliveryOrder(deliverOrderDetails);
            } catch (error) {
                console.error("Error fetching delivery order details: ", error);
            }
        };

        fetchDeliveryOrderDetails();
    }, [id]);

    return (
        <div>
            <EntityDeliveryOrder
                mode={'detail'}
                initialData={deliveryOrder}
                onSubmit={async (data) => {
                    await DeliveryOrderRepository.updateDeliveryOrder(id, data);
                    navigate('/logistic/delivery-order')
                }}
            />
        </div>
    )
}

export default DetailDeliveryOrder;