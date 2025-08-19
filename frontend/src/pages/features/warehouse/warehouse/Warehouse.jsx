import { ALGOLIA_INDEX_RACK, clientRack } from '../../../../../config/algoliaConfig';
import CustomAlgoliaContainer from '../../../../components/customize/custom_algolia_container/CustomAlgoliaContainer';
import './Warehouse.css';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../../../context/auth/UsersContext';
import roleAccess from '../../../../utils/helper/roleAccess';
import RackWarehouseRepository from '../../../../repository/warehouse/RackWarehouseRepository';

const Warehouse = () => {
    // Hooks
    const navigate = useNavigate();
    const { loginUser, accessList } = useUsers();


    // ================================================================================


    // Variables
    // Columns for the table
    const columns = [
        { header: "Nama Gudang", accessor: "name" },
        { header: "Deskripsi Gudang", accessor: "description" },
        {
            header: "Lokasi Gudang",
            accessor: "location",
            renderCell: (value) => value.charAt(0).toUpperCase() + value.slice(1)
        },
    ]
    // ================================================================================


    // Navigation
    // Navigation to Create
    const navigateToCreateWarehouse = () => {
        navigate('/inventory/warehouse/new');
    }

    const filters = loginUser?.location ? `location: ${loginUser.location}` : '';

    return (
        <CustomAlgoliaContainer
            pageLabel="Gudang"
            searchClient={clientRack}
            indexName={ALGOLIA_INDEX_RACK}
            columns={columns}
            createOnclick={navigateToCreateWarehouse}
            subscribeFn={RackWarehouseRepository.subscribeToRackChanges}
            enableExport={false}
            enableImport={false}
            filters={filters}
            canEdit={roleAccess(accessList, 'mengedit-data-gudang')}
            canAdd={roleAccess(accessList, 'menambah-data-gudang')}
        />
    )
}

export default Warehouse;