import RackWarehouseRepository from "../../../../../../repository/warehouse/RackWarehouseRepository";
import EntityRacks from "../../components/entity_racks/EntityRacks";
import './AddRacks.css'

const AddRacks = () => {
    return (
        <div>
            <EntityRacks
                mode={'create'}
                onSubmit={async (data, reset) => {
                    await RackWarehouseRepository.createRacks(data);
                    reset();
                }}
            />
        </div>
    )
}

export default AddRacks;