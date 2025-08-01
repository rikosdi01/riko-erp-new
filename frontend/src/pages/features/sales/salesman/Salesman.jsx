import './Salesman.css';
import MainContainer from '../../../../components/container/main_container/MainContainer';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useSalesman } from '../../../../context/sales/SalesmanContext';
import roleAccess from '../../../../utils/helper/roleAccess';
import { useUsers } from '../../../../context/auth/UsersContext';

const Salesman = () => {
    // Hooks
    const navigate = useNavigate();
    const { accessList } = useUsers();


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
            canEdit={roleAccess(accessList, 'mengedit-data-sales')}
            canAdd={roleAccess(accessList, 'menambah-data-sales')}
        />
    );
}

export default Salesman;
