import './AddItem.css';
import EntityItems from '../../components/entity_items/EntityItems';
import ItemsRepository from '../../../../../../repository/warehouse/ItemsRepository';

const AddItem = () => {
    return (
        <EntityItems
            mode={'create'}
            onSubmit={async (data, reset) => {
                await ItemsRepository.createItem(data);
                reset();
            }}
        />
    )
}

export default AddItem;