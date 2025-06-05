import { useParams } from "react-router-dom";
import './DetailItem.css'
import { useEffect, useState } from "react";
import ItemsRepository from "../../../../../../repository/warehouse/ItemsRepository";
import EntityItems from "../../components/entity_items/EntityItems";

const DetailItem = () => {
    // Hooks
    const { id } = useParams();

    const [item, setItem] = useState([]);

    // Fetch the item details using the id from the URL
    useEffect(() => {
        const fetchItemDetails = async () => {
            try {
                const itemDetails = await ItemsRepository.getItemsById(id);
                setItem(itemDetails);
            } catch (error) {
                console.error("Error fetching item details: ", error);
            }
        };

        fetchItemDetails();
    }, [id]);

    return (
        <div>
            <EntityItems
                mode={'detail'}
                initialData={item}
                onSubmit={async (data) => {
                    await ItemsRepository.updateItem(id, data);
                }}
            />
        </div>
    )
}

export default DetailItem;