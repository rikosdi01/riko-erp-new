import DeliveryOrderRepository from "../../../../../../repository/logistic/DeliveryOrderRepository";
import SalesOrderRepository from "../../../../../../repository/sales/SalesOrderRepository";
import EntityDeliveryOrder from "../../components/entity_delivery_order/EntityDeliveryOrder";
import './AddDeliveryOrder.css'

const AddDeliveryOrder = () => {
    return (
        <div>
            <EntityDeliveryOrder
                mode={'create'}
                onSubmit={async (data, reset) => {
                    try {
                        if (data.soData?.id) {
                            await SalesOrderRepository.updateStatusValue(data.soData.id, 'Diproses');
                            data.soData.status = 'Diproses'; // <- update status lokal juga
                        }

                        await DeliveryOrderRepository.createDeliveryOrder(data);
                        reset();
                    } catch (error) {
                        console.error("Gagal menyimpan Delivery Order:", error);
                    }
                }}


            />
        </div>
    )
}

export default AddDeliveryOrder;