import SalesOrderRepository from "../../../../../../repository/sales/SalesOrderRepository";
import EntitySalesOrder from "../../components/entity_sales_order/EntitySalesOrder";
import './AddSalesOrder.css'

const AddSalesOrder = () => {
    return (
        <div>
            <EntitySalesOrder
                mode={'create'}
                onSubmit={async (data, reset) => {
                    await SalesOrderRepository.createSalesOrder(data);
                    reset();
                }}
            />
        </div>
    )
}

export default AddSalesOrder;