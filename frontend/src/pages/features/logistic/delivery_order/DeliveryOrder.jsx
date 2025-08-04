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
        {
            header: "Alamat",
            accessor: "address",
            renderCell: (_, so) => {
                const address = so?.customer?.selectedAddress?.address ?? "";
                const city = so?.customer?.selectedAddress?.city ?? "";
                const province = so?.customer?.selectedAddress?.province ?? "";
                return address + ', ' + city + ', ' + province;
            }
        },
        // { header: "Kurir", accessor: "courier.name" },
        { header: "Keterangan", accessor: "soData.description" },
        {
            header: "Status",
            accessor: "soData.status",
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
