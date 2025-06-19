import './RackWarehouse.css';
import MainContainer from '../../../../components/container/main_container/MainContainer';
import { useNavigate } from 'react-router-dom';
import { useMerks } from '../../../../context/warehouse/MerkContext';
import { useState } from 'react';
import { useRacks } from '../../../../context/warehouse/RackWarehouseContext';

const RackWarehouse = () => {
    // Hooks
    const navigate = useNavigate();


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
        />
    );
}

export default RackWarehouse;
