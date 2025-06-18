import { useParams } from 'react-router-dom';
import './DetailTransfer.css'
import { useEffect, useState } from 'react';
import TransferRepository from '../../../../../../repository/warehouse/TransferRepository';
import EntityTransfer from '../../components/entity_transfer/EntityTransfer';

const DetailTransfer = () => {
    // Hooks
    const { id } = useParams();

    // Variables
    const [transfer, setTransfer] = useState([]);

    // Fetch the transfer details using the id from the URL
    useEffect(() => {
        const fetchTransferDetails = async () => {
            try {
                const transferDetails = await TransferRepository.getTransferById(id);
                console.log('Transfer Details: ', transferDetails);
                setTransfer(transferDetails);
            } catch (error) {
                console.error("Error fetching transfer details: ", error);
            }
        };

        fetchTransferDetails();
    }, [id]);

    return (
        <div>
            <EntityTransfer
                mode={'detail'}
                initialData={transfer}
                onSubmit={async (data) => {
                    await TransferRepository.updateTransfer(id, data);
                }}
            />
        </div>
    )
}

export default DetailTransfer;