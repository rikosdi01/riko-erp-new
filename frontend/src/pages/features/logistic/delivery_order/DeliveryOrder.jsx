import { useNavigate } from 'react-router-dom';
import { ALGOLIA_INDEX_DO, clientDO } from '../../../../../config/algoliaConfig';
import CustomAlgoliaContainer from '../../../../components/customize/custom_algolia_container/CustomAlgoliaContainer';
import Formatting from '../../../../utils/format/Formatting';
import './DeliveryOrder.css';
import DeliveryOrderRepository from '../../../../repository/logistic/DeliveryOrderRepository';
import roleAccess from '../../../../utils/helper/roleAccess';
import { useUsers } from '../../../../context/auth/UsersContext';

const DeliveryOrder = () => {
    // Hooks
    const navigate = useNavigate();
    const { accessList } = useUsers();


    const columns = [
        { header: "No. Pengiriman", accessor: "code" },
        {
            header: "Tanggal",
            accessor: "doDate",
            renderCell: (value) => Formatting.formatDateByTimestamp(value),
        },
        { header: "Pelanggan", accessor: "soData.customer.name" },
        { header: "Pengangkutan", accessor: "express.name" },
        { header: "Kurir", accessor: "courier.name" },
        { header: "Keterangan", accessor: "soData.description" },
        {
            header: "Status Print",
            accessor: "statusDO",
            renderCell: (value) => value ? 'Sudah Print' : 'Belum Print',
        },
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
            canEdit={roleAccess(accessList, 'mengedit-data-pengiriman-pesanan')}
            canAdd={roleAccess(accessList, 'menambah-data-pengiriman-pesanan')}
        />
    )
}

export default DeliveryOrder;
