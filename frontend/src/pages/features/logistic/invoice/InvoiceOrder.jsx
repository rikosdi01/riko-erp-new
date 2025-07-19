import { useNavigate } from 'react-router-dom';
import { ALGOLIA_INDEX_IO, clientIO } from '../../../../../config/algoliaConfig';
import CustomAlgoliaContainer from '../../../../components/customize/custom_algolia_container/CustomAlgoliaContainer';
import Formatting from '../../../../utils/format/Formatting';
import './InvoiceOrder.css';
import DeliveryOrderRepository from '../../../../repository/logistic/DeliveryOrderRepository';
import { useUsers } from '../../../../context/auth/UsersContext';
import roleAccess from '../../../../utils/helper/roleAccess';

const InvoiceOrder = () => {
    // Hooks
    const navigate = useNavigate();
    const { accessList } = useUsers();

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
            canEdit={roleAccess(accessList, 'mengedit-data-pengiriman-pesanan')}
            canAdd={roleAccess(accessList, 'menambah-data-pengiriman-pesanan')}
        />
    )
}

export default InvoiceOrder;
