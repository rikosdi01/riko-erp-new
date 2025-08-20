import { ALGOLIA_INDEX_PO, ALGOLIA_INDEX_PR, ALGOLIA_INDEX_SUPPLIER, clientPO, clientPR, clientSupplier } from '../../../../../config/algoliaConfig';
import CustomAlgoliaContainer from '../../../../components/customize/custom_algolia_container/CustomAlgoliaContainer';
import './Supplier.css';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../../../context/auth/UsersContext';
import roleAccess from '../../../../utils/helper/roleAccess';
import Formatting from '../../../../utils/format/Formatting';
import PurchaseOrderRepository from '../../../../repository/purchasing/PurchaseOrderRepository';

const Supplier = () => {
    // Hooks
    const navigate = useNavigate();
    const { loginUser, accessList } = useUsers();


    // ================================================================================


    // Variables
    // Columns for the table
    const columns = [
        { header: "Nama Penerimaan", accessor: "name" },
        { header: "Phone", accessor: "phone" },
        { header: "Email", accessor: "email" },
        { header: "Negara", accessor: "state" },
        {
            header: "Status",
            accessor: "isActive",
            renderCell: (value) => value ? 'Aktif' : 'Tidak Aktif'
        },
    ]

    // ================================================================================


    // Navigation
    // Navigation to Create
    const navigateToCreateAdjustment = () => {
        navigate('/purchase/supplier/new');
    }

    return (
        <CustomAlgoliaContainer
            pageLabel="Supplier"
            searchClient={clientSupplier}
            indexName={ALGOLIA_INDEX_SUPPLIER}
            columns={columns}
            createOnclick={navigateToCreateAdjustment}
            subscribeFn={PurchaseOrderRepository.subscribeToPOChanges}
            enableExport={false}
            enableImport={false}
            canEdit={roleAccess(accessList, 'mengedit-data-pembelian-barang')}
            canAdd={roleAccess(accessList, 'menambah-data-pembelian-barang')}
        />
    )
}

export default Supplier;