import RackWarehouseRepository from "../../../../../../repository/warehouse/RackWarehouseRepository";
import EntityWarehouse from "../../components/entity_warehouse/EntityWarehouse";
import './AddWarehouse.css'

const AddWarehouse = () => {
    return (
        <div>
            <EntityWarehouse
                mode={'create'}
                onSubmit={async (data, reset) => {
                    await RackWarehouseRepository.createRacks(data);
                    reset();
                }}
            />
        </div>
    )
}

export default AddWarehouse;