import { ALGOLIA_INDEX_PO, ALGOLIA_INDEX_PR, clientPO, clientPR } from '../../../../../config/algoliaConfig';
import CustomAlgoliaContainer from '../../../../components/customize/custom_algolia_container/CustomAlgoliaContainer';
import './PurchaseOrder.css';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../../../context/auth/UsersContext';
import roleAccess from '../../../../utils/helper/roleAccess';
import Formatting from '../../../../utils/format/Formatting';
import PurchaseOrderRepository from '../../../../repository/purchasing/PurchaseOrderRepository';

const PurchaseOrder = () => {
    // Hooks
    const navigate = useNavigate();
    const { loginUser, accessList } = useUsers();


    // ================================================================================


    // Variables
    // Columns for the table
    const columns = [
        { header: "Kode Penerimaan", accessor: "code" },
        {
            header: "Tanggal",
            accessor: "createdAt",
            renderCell: (value) => Formatting.formatDateByTimestamp(value)
        },
        { header: "Deskripsi", accessor: "description" },
        { 
            header: "Lokasi",
            accessor: "location",
            renderCell: (value) => value.charAt(0).toUpperCase() + value.slice(1)
        },
    ]

    // ================================================================================


    // Navigation
    // Navigation to Create
    const navigateToCreateAdjustment = () => {
        navigate('/purchase/purchase-order/new');
    }

    const filters = loginUser?.location ? `location: ${loginUser.location}` : '';

    return (
        <CustomAlgoliaContainer
            pageLabel="Penerimaan Barang"
            searchClient={clientPO}
            indexName={ALGOLIA_INDEX_PO}
            columns={columns}
            createOnclick={navigateToCreateAdjustment}
            subscribeFn={PurchaseOrderRepository.subscribeToPOChanges}
            enableExport={false}
            enableImport={false}
            filters={filters}
            enableDateRange={true}
            canEdit={roleAccess(accessList, 'mengedit-data-pembelian-barang')}
            canAdd={roleAccess(accessList, 'menambah-data-pembelian-barang')}
        />
    )
}

export default PurchaseOrder;