import './RackWarehouse.css';
import MainContainer from '../../../../components/container/main_container/MainContainer';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useRacks } from '../../../../context/warehouse/RackWarehouseContext';
import roleAccess from '../../../../utils/helper/roleAccess';
import { useUsers } from '../../../../context/auth/UsersContext';

const RackWarehouse = () => {
    // Hooks
    const navigate = useNavigate();
    const { accessList } = useUsers();


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
    const navigateToCreateMerk = () => {
        navigate('/inventory/warehouse/new');
    }


    // ================================================================================


    // Logic


    // ================================================================================


    // Page Container
    return (
        <MainContainer
            pageLabel="Rak"
            setSearchValue={setSearchTerm}
            createOnclick={navigateToCreateMerk}
            columns={columns}
            data={filteredMerks}
            isLoading={isLoading}
            canEdit={roleAccess(accessList, 'mengedit-data-gudang')}
            canAdd={roleAccess(accessList, 'menambah-data-gudang')}
        />
    );
}

export default RackWarehouse;
