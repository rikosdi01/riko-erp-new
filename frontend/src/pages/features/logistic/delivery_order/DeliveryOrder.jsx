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
            accessor: "createdAt",
            renderCell: (value) => Formatting.formatDateByTimestamp(value),
        },
        { header: "Pelanggan", accessor: "customer.name" },
        { header: "Pengangkutan", accessor: "express.name" },
        { header: "Kurir", accessor: "courier.name" },
        { header: "Keterangan", accessor: "description" },
        {
            header: "Status",
            accessor: "status",
            renderCell: (value) => value.charAt(0).toUpperCase() + value.slice(1)
        }
        // {
        //     header: "Status Print",
        //     accessor: "statusDO",
        //     renderCell: (value) => value ? 'Sudah Print' : 'Belum Print',
        // },
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
            enableCreate={false}
            enableExport={false}
            enableDateRange={true}
            enableImport={false}
            enableDropdown={true}
            dropdownAttribute={'status'}
            subscribeFn={DeliveryOrderRepository.subscribeToDeliveryOrderChanges}
            canEdit={roleAccess(accessList, 'mengedit-data-pengiriman-pesanan')}
            canAdd={roleAccess(accessList, 'menambah-data-pengiriman-pesanan')}
        />
    )
}

export default DeliveryOrder;
