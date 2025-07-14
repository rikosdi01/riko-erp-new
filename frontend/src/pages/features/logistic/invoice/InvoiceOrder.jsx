import { useNavigate } from 'react-router-dom';
import { ALGOLIA_INDEX_IO, clientIO } from '../../../../../config/algoliaConfig';
import CustomAlgoliaContainer from '../../../../components/customize/custom_algolia_container/CustomAlgoliaContainer';
import Formatting from '../../../../utils/format/Formatting';
import './InvoiceOrder.css';
import DeliveryOrderRepository from '../../../../repository/logistic/DeliveryOrderRepository';

const InvoiceOrder = () => {
    // Hooks
    const navigate = useNavigate();


    const columns = [
        { header: "No. Pesanan", accessor: "soData.code" },
        {
            header: "Tanggal Pesanan",
            accessor: "soData.createdAt",
            renderCell: (value) => Formatting.formatDateByTimestamp(value),
        },
        { header: "Pelanggan", accessor: "soData.customer.name" },
        { header: "Total Pesanan", accessor: "totalPayment" },
        { header: "Status Pesanan", accessor: "statusDelivery" },
    ]


    // ================================================================================


    // Navigation
    // Navigation to Create
    const navigateToCreateDO = () => {
        navigate('/logistic/delivery-order/new');
    }

    return (
        <CustomAlgoliaContainer
            pageLabel="IO"
            searchClient={clientIO}
            indexName={ALGOLIA_INDEX_IO}
            columns={columns}
            createOnclick={navigateToCreateDO}
            subscribeFn={DeliveryOrderRepository.subscribeToDeliveryOrderChanges}
        />
    )
}

export default InvoiceOrder;
