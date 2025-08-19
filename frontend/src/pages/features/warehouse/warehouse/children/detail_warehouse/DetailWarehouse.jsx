import { useParams } from 'react-router-dom';
import './DetailWarehouse.css'
import { useEffect, useState } from 'react';
import EntityAdjustment from '../../components/EntityAdjustment/EntityAdjustment';
import RackWarehouseRepository from '../../../../../../repository/warehouse/RackWarehouseRepository';

const DetailWarehouse = () => {
    // Hooks
    const { id } = useParams();

    // Variables
    const [transfer, setTransfer] = useState([]);

    // Fetch the transfer details using the id from the URL
    useEffect(() => {
        const fetchADJDetails = async () => {
            try {
                const transferDetails = await RackWarehouseRepository.getRackById(id);
                setTransfer(transferDetails);
            } catch (error) {
                console.error("Error fetching transfer details: ", error);
            }
        };

        fetchADJDetails();
    }, [id]);

    return (
        <div>
            <EntityAdjustment
                mode={'detail'}
                initialData={transfer}
                onSubmit={async (data) => {
                    await RackWarehouseRepository.updateRack(id, data);
                }}
            />
        </div>
    )
}

export default DetailWarehouse;