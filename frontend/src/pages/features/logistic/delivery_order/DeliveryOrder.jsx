import { useNavigate } from 'react-router-dom';
import { ALGOLIA_INDEX_DO, clientDO } from '../../../../../config/algoliaConfig';
import CustomAlgoliaContainer from '../../../../components/customize/custom_algolia_container/CustomAlgoliaContainer';
import Formatting from '../../../../utils/format/Formatting';
import './DeliveryOrder.css';
import DeliveryOrderRepository from '../../../../repository/logistic/DeliveryOrderRepository';

const DeliveryOrder = () => {
    // Hooks
    const navigate = useNavigate();


    const columns = [
        { header: "No. Pengiriman", accessor: "code" },
        {
            header: "Tanggal",
            accessor: "createdAt",
            renderCell: (value) => Formatting.formatDateByTimestamp(value),
        },
        { header: "Pelanggan", accessor: "customer.name" },
        { header: "Keterangan", accessor: "description" },
        {
            header: "Status Print",
            accessor: "statusDO",
            renderCell: (value) => value ? 'Sudah Print' : 'Belum Print',
        },
        { header: "Status", accessor: "status" }
    ]


    // ================================================================================


    // Navigation
    // Navigation to Create
    const navigateToCreateDO = () => {
        navigate('/logistic/delivery-order/new');
    }

    return (
        <CustomAlgoliaContainer
            pageLabel="DO"
            searchClient={clientDO}
            indexName={ALGOLIA_INDEX_DO}
            columns={columns}
            createOnclick={navigateToCreateDO}
            subscribeFn={DeliveryOrderRepository.subscribeToDeliveryOrderChanges}
        />
    )
}

export default DeliveryOrder;
