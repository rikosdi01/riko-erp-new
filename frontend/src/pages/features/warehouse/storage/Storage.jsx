import { ALGOLIA_INDEX_INVENTORY, clientInventory } from '../../../../../config/algoliaConfig';
import CustomAlgoliaContainer from '../../../../components/customize/custom_algolia_container/CustomAlgoliaContainer';
import CategoriesRepository from '../../../../repository/warehouse/CategoriesRepository';
import InventoryRepository from '../../../../repository/warehouse/InventoryRepository';
import './Storage.css';
import { useNavigate } from 'react-router-dom';

const Storage = () => {
    // Hooks
    const navigate = useNavigate();


    // ================================================================================


    // Variables
    // Columns for the table
    const columns = [
        { header: "Item", accessor: "items.name" },
        { header: "Kts", accessor: "quantity" },
        { header: "Status Packing", accessor: "packingStatus" },
        { header: "Rak", accessor: "rack" },
        { header: "Baris", accessor: "rackLines" },
        { header: "No. Dus", accessor: "boxNumber" },
        { header: "Trip", accessor: "trip" },
        { header: "Gudang", accessor: "warehouse.name" },
    ]



    // ================================================================================


    // Navigation
    // Navigation to Create
    const navigateToCreateInventory = () => {
        navigate('/inventory/storage/new');
    }

    return (
        <CustomAlgoliaContainer
            pageLabel="Penyimpanan"
            searchClient={clientInventory}
            indexName={ALGOLIA_INDEX_INVENTORY}
            columns={columns}
            createOnclick={navigateToCreateInventory}
            subscribeFn={InventoryRepository.subscribeToInvetoryChanges}
            enableDropdown={true}
            enableImport={false}
            enableExport={false}
            enableCreate={false}
        />
    )
}

export default Storage;