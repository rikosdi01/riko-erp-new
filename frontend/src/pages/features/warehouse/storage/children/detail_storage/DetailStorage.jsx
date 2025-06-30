import { useParams } from "react-router-dom";
import './DetailStorage.css'
import { useEffect, useState } from "react";
import EntityStorage from "../../components/entity_storage/EntityStorage";
import InventoryRepository from "../../../../../../repository/warehouse/InventoryRepository";

const DetailStorage = () => {
    // Hooks
    const { id } = useParams();

    const [item, setItem] = useState([]);

    // Fetch the item details using the id from the URL
    useEffect(() => {
        const fetchInventoryDetails = async () => {
            try {
                const [itemId, parentId] = id.split(' - ');
                console.log('Item ID: ', itemId);
                console.log('Parent ID: ', parentId);
                const inventoryDetails = await InventoryRepository.getInventoryById(parentId, itemId);
                setItem(inventoryDetails);
            } catch (error) {
                console.error("Error fetching item details: ", error);
            }
        };

        fetchInventoryDetails();
    }, [id]);


    return (
        <div>
            <EntityStorage
                mode={'detail'}
                initialData={item}
                onSubmit={async (data) => {
                    await InventoryRepository.updateInventory(id, data);
                }}
            />
        </div>
    )
}

export default DetailStorage;