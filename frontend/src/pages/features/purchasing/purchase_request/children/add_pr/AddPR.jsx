import AdjustmentRepository from "../../../../../../repository/warehouse/AdjustmentRepository";
import TransferRepository from "../../../../../../repository/warehouse/TransferRepository";
import EntityAdjustment from "../../components/EntityAdjustment/EntityAdjustment";
import './AddAdjustment.css'

const AddAdjustment = () => {
    return (
        <div>
            <EntityAdjustment
                mode={'create'}
                onSubmit={async (data, reset) => {
                    await AdjustmentRepository.createAdj(data);
                    reset();
                }}
            />
        </div>
    )
}

export default AddAdjustment;