import { useParams } from "react-router-dom";
import './DetailRacks.css'
import { useEffect, useState } from "react";
import { useRacks } from "../../../../../../context/warehouse/RackWarehouseContext";
import RackWarehouseRepository from "../../../../../../repository/warehouse/RackWarehouseRepository";
import EntityRacks from "../../components/entity_racks/EntityRacks";

const DetailRacks = () => {
    // Hooks
    const { id } = useParams();
    const { racks } = useRacks();
    console.log(id);

    const [rack, setRack] = useState([]);

    useEffect(() => {
        const selectedRack = racks.find((m) => m.id === id);
        if (selectedRack) {
            setRack(selectedRack);
        }
    }, [racks, id]);

    return (
        <div>
            <EntityRacks
                mode={'detail'}
                initialData={rack}
                onSubmit={async (data) => {
                    await RackWarehouseRepository.updateRack(id, data);
                }}
            />
        </div>
    )
}

export default DetailRacks;