import MerksRepository from "../../../../../../repository/warehouse/MerksRepository";
import EntityMerk from "../../components/enitity_merks/EntityMerk";
import './AddMerk.css'

const AddMerk = () => {
    return (
        <div>
            <EntityMerk
                mode={'create'}
                onSubmit={async (data, reset) => {
                    await MerksRepository.createMerk(data);
                    reset();
                }}
            />
        </div>
    )
}

export default AddMerk;