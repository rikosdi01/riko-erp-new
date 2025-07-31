import './RackWarehouse.css';
import MainContainer from '../../../../components/container/main_container/MainContainer';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useRacks } from '../../../../context/warehouse/RackWarehouseContext';
import roleAccess from '../../../../utils/helper/roleAccess';
import { useUsers } from '../../../../context/auth/UsersContext';
import CustomAlgoliaContainer from '../../../../components/customize/custom_algolia_container/CustomAlgoliaContainer';
import { ALGOLIA_INDEX_WAREHOUSE, clientRack } from '../../../../../config/algoliaConfig';
import RackWarehouseRepository from '../../../../repository/warehouse/RackWarehouseRepository';

const RackWarehouse = () => {
    // Hooks
    const navigate = useNavigate();
    const { loginUser, accessList } = useUsers();


    // ================================================================================


    // Context
    const { racks, isLoading } = useRacks();


    // ================================================================================


    // Variables
    const [searchTerm, setSearchTerm] = useState("");


    // ================================================================================


    // Data
    // Columns Data
    const columns = [
        { header: "Nama Gudang", accessor: "name" },
        { header: "Kategori Gudang", accessor: "category" },
        { header: "Deskripsi Gudang", accessor: "description" },
        { header: "Lokasi Gudang", accessor: "location" },
    ]

    // Filter Data
    const filteredMerks = racks.filter(merk =>
        merk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        merk.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        merk.category.toLowerCase().includes(searchTerm.toLowerCase())
    );


    // ================================================================================


    // Navigation
    // Navigation to Create
    const navigateToCreateRack = () => {
        navigate('/inventory/warehouse/new');
    }


    // ================================================================================


    // Logic


    // ================================================================================

    return (
        <CustomAlgoliaContainer
            pageLabel="Rak"
            searchClient={clientRack}
            indexName={ALGOLIA_INDEX_WAREHOUSE}
            columns={columns}
            createOnclick={navigateToCreateRack}
            subscribeFn={RackWarehouseRepository.subscribeToRackChanges}
            enableExport={false}
            enableImport={false}
            enableDropdown={true}
            dropdownAttribute="category"
            filters={`location: ${loginUser?.location || ''}`}
            canAdd={roleAccess(accessList, 'menambah-data-gudang')}
            canEdit={roleAccess(accessList, 'mengedit-data-gudang')}
        />
    )
}

export default RackWarehouse;
