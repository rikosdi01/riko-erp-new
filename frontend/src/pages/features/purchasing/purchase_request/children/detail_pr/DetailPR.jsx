import { useParams } from 'react-router-dom';
import './DetailAdjustment.css'
import { useEffect, useState } from 'react';
import EntityAdjustment from '../../components/EntityAdjustment/EntityAdjustment';
import AdjustmentRepository from '../../../../../../repository/warehouse/AdjustmentRepository';

const DetailAdjustment = () => {
    // Hooks
    const { id } = useParams();

    // Variables
    const [transfer, setTransfer] = useState([]);

    // Fetch the transfer details using the id from the URL
    useEffect(() => {
        const fetchADJDetails = async () => {
            try {
                const transferDetails = await AdjustmentRepository.getAdjById(id);
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
                    await AdjustmentRepository.updateAdj(id, data);
                }}
            />
        </div>
    )
}

export default DetailAdjustment;