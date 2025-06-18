import TransferRepository from "../../../../../../repository/warehouse/TransferRepository";
import EntityTransfer from "../../components/entity_transfer/EntityTransfer";
import './AddTransfer.css'

const AddTransfer = () => {
    return (
        <div>
            <EntityTransfer
                mode={'create'}
                onSubmit={async (data, reset) => {
                    await TransferRepository.createTransfer(data);
                    reset();
                }}
            />
        </div>
    )
}

export default AddTransfer;