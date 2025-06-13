import './AddStorage.css';
import EntityStorage from '../../components/entity_storage/EntityStorage';
import InventoryRepository from '../../../../../../repository/warehouse/InventoryRepository';

const AddStorage = () => {
    return (
        <EntityStorage
            mode={'create'}
            onSubmit={async (data, reset) => {
                await InventoryRepository.createInventory(data);
                reset();
            }}
        />
    )
}

export default AddStorage;