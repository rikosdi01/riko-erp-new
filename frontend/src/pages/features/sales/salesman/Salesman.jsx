import './Salesman.css';
import MainContainer from '../../../../components/container/main_container/MainContainer';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useSalesman } from '../../../../context/sales/SalesmanContext';

const Salesman = () => {
    // Hooks
    const navigate = useNavigate();


    // ================================================================================


    // Context
    const { salesman, isLoading } = useSalesman();


    // ================================================================================


    // Variables
    const [searchTerm, setSearchTerm] = useState("");


    // ================================================================================


    // Data
    // Columns Data
    const columns = [
        { header: "Kode Sales", accessor: "code" },
        { header: "Nama Sales", accessor: "name" },
    ]

    // Filter Data
    const filteredSalesman = salesman.filter(salesman =>
        salesman.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        salesman.code.toLowerCase().includes(searchTerm.toLowerCase())
    );


    // ================================================================================


    // Navigation
    // Navigation to Create
    const navigateToCreateSalesman = () => {
        navigate('/sales/salesman/new');
    }


    // ================================================================================


    // Logic


    // ================================================================================


    // Page Container
    return (
        <MainContainer
            pageLabel="Salesman"
            setSearchValue={setSearchTerm}
            createOnclick={navigateToCreateSalesman}
            columns={columns}
            data={filteredSalesman}
            isLoading={isLoading}
        />
    );
}

export default Salesman;
