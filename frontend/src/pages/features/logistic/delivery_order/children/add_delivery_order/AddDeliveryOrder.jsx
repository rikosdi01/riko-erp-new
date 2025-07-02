import DeliveryOrderRepository from "../../../../../../repository/logistic/DeliveryOrderRepository";
import EntityDeliveryOrder from "../../components/entity_delivery_order/EntityDeliveryOrder";
import './AddDeliveryOrder.css'

const AddDeliveryOrder = () => {
    return (
        <div>
            <EntityDeliveryOrder
                mode={'create'}
                onSubmit={async (data, reset) => {
                    await DeliveryOrderRepository.createDeliveryOrder(data);
                    reset();
                }}
            />
        </div>
    )
}

export default AddDeliveryOrder;