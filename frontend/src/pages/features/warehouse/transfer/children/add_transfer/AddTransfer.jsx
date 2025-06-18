import EntityTransfer from "../../components/entity_transfer/EntityTransfer";
import './AddTransfer.css'

const AddTransfer = () => {
    return (
        <div>
            <EntityTransfer
                mode={'create'}
                onSubmit={async (data, reset) => {
                    // await MerksRepository.createMerk(data);
                    reset();
                }}
            />
        </div>
    )
}

export default AddTransfer;