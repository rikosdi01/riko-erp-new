import { useParams } from 'react-router-dom';
import './DetailPO.css'
import { useEffect, useState } from 'react';
import PurchaseOrderRepository from '../../../../../../repository/purchasing/PurchaseOrderRepository';
import EntityPO from '../../components/entity_po/EntityPO';

const DetailPO = () => {
    // Hooks
    const { id } = useParams();

    // Variables
    const [transfer, setTransfer] = useState([]);

    // Fetch the transfer details using the id from the URL
    useEffect(() => {
        const fetchADJDetails = async () => {
            try {
                const transferDetails = await PurchaseOrderRepository.getPOById(id);
                setTransfer(transferDetails);
            } catch (error) {
                console.error("Error fetching transfer details: ", error);
            }
        };

        fetchADJDetails();
    }, [id]);

    return (
        <div>
            <EntityPO
                mode={'detail'}
                initialData={transfer}
                onSubmit={async (data) => {
                    await PurchaseOrderRepository.updatePO(id, data);
                }}
            />
        </div>
    )
}

export default DetailPO;