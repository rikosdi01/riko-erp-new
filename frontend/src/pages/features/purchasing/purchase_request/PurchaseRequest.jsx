import { ALGOLIA_INDEX_PR, clientPR } from '../../../../../config/algoliaConfig';
import CustomAlgoliaContainer from '../../../../components/customize/custom_algolia_container/CustomAlgoliaContainer';
import './PurchaseRequest.css';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../../../context/auth/UsersContext';
import roleAccess from '../../../../utils/helper/roleAccess';
import Formatting from '../../../../utils/format/Formatting';
import SupplierRepository from '../../../../repository/purchasing/SupplierRepository';

const PurchaseRequest = () => {
    // Hooks
    const navigate = useNavigate();
    const { loginUser, accessList } = useUsers();


    // ================================================================================


    // Variables
    // Columns for the table
    const columns = [
        { header: "Kode Pembelian", accessor: "code" },
        { header: "Supplier", accessor: "supplier.name" },
        {
            header: "Total",
            accessor: "totalPrice",
            renderCell: (value) => Formatting.formatCurrencyIDR(value)
        },
        {
            header: "Status",
            accessor: "status",
            renderCell: (value) => value.charAt(0).toUpperCase() + value.slice(1)
        },
        { header: "Deskripsi", accessor: "description" },
        {
            header: "Tanggal",
            accessor: "createdAt",
            renderCell: (value) => Formatting.formatDateByTimestamp(value)
        },
        { 
            header: "Lokasi",
            accessor: "location",
            renderCell: (value) => value.charAt(0).toUpperCase() + value.slice(1)
        },
    ]

    // ================================================================================


    // Navigation
    // Navigation to Create
    const navigateToCreatePR = () => {
        navigate('/purchase/purchase-request/new');
    }

    const filters = loginUser?.location ? `location: ${loginUser.location}` : '';

    return (
        <CustomAlgoliaContainer
            pageLabel="Pembelian Barang"
            searchClient={clientPR}
            indexName={ALGOLIA_INDEX_PR}
            columns={columns}
            createOnclick={navigateToCreatePR}
            subscribeFn={SupplierRepository.subscribeToSupplierChanges}
            enableExport={false}
            enableImport={false}
            filters={filters}
            enableDateRange={true}
            canEdit={roleAccess(accessList, 'mengedit-data-pembelian-barang')}
            canAdd={roleAccess(accessList, 'menambah-data-pembelian-barang')}
        />
    )
}

export default PurchaseRequest;