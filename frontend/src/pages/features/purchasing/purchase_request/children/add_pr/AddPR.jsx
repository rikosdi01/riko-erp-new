import PurchaseRequestRepository from "../../../../../../repository/purchasing/PurchaseRequestRepository";
import AdjustmentRepository from "../../../../../../repository/warehouse/AdjustmentRepository";
import EntityPR from "../../components/entity_pr/EntityPR";
import './AddPR.css'

const AddPR = () => {
    return (
        <div>
            <EntityPR
                mode={'create'}
                onSubmit={async (data, reset) => {
                    await PurchaseRequestRepository.createPR(data);
                    reset();
                }}
            />
        </div>
    )
}

export default AddPR;