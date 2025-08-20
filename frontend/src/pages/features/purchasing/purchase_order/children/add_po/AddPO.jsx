import PurchaseOrderRepository from "../../../../../../repository/purchasing/PurchaseOrderRepository";
import EntityPO from "../../components/entity_po/EntityPO";
import './AddPO.css'

const AddPO = () => {
    return (
        <div>
            <EntityPO
                mode={'create'}
                onSubmit={async (data, reset) => {
                    await PurchaseOrderRepository.createPO(data);
                    reset();
                }}
            />
        </div>
    )
}

export default AddPO;