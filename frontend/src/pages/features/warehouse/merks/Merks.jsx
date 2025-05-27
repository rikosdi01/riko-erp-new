import './Merks.css';
import MainContainer from '../../../../components/container/main_container/MainContainer';
import { useNavigate } from 'react-router-dom';
import { useMerks } from '../../../../context/warehouse/MerkContext';
import { useState } from 'react';

const Merks = () => {
    // Hooks
    const navigate = useNavigate();


    // ================================================================================


    // Context
    const { merks, isLoading } = useMerks();


    // ================================================================================


    // Variables
    const [searchTerm, setSearchTerm] = useState("");


    // ================================================================================


    // Data
    // Columns Data
    const columns = [
        { header: "Kode Merek", accessor: "code" },
        { header: "Nama Merek", accessor: "name" },
    ]

    // Filter Data
    const filteredMerks = merks.filter(merk =>
        merk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        merk.code.toLowerCase().includes(searchTerm.toLowerCase())
    );


    // ================================================================================


    // Navigation
    // Navigation to Create
    const navigateToCreateMerk = () => {
        navigate('/inventory/merks/new');
    }


    // ================================================================================


    // Logic


    // ================================================================================


    // Page Container
    return (
        <MainContainer
            pageLabel="Merek"
            setSearchValue={setSearchTerm}
            createOnclick={navigateToCreateMerk}
            columns={columns}
            data={filteredMerks}
            isLoading={isLoading}
        />
    );
}

export default Merks;
