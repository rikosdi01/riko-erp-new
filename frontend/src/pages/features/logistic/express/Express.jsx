import './Express.css';
import MainContainer from '../../../../components/container/main_container/MainContainer';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useExpress } from '../../../../context/logistic/ExpressContext';
import roleAccess from '../../../../utils/helper/roleAccess';
import { useUsers } from '../../../../context/auth/UsersContext';

const Express = () => {
    // Hooks
    const navigate = useNavigate();
    const { accessList } = useUsers();


    // ================================================================================


    // Context
    const { express, isLoading } = useExpress();


    // ================================================================================


    // Variables
    const [searchTerm, setSearchTerm] = useState("");


    // ================================================================================


    // Data
    // Columns Data
    const columns = [
        { header: "Nama Pengangkutan", accessor: "name" },
        { header: "Alamat Pengangkutan", accessor: "address" },
        { header: "Tarif Dasar", accessor: "basePrice" },
        { header: "Tarif tambahan (per item)", accessor: "itemPerPrice" },
        {
            header: 'Estimasi',
            accessor: 'estimation',
            renderCell: (_, estimation) => {
                const estimationStart = estimation?.estimationStart ?? 0;
                const estimationEnd = estimation?.estimationEnd ?? 0;
                return estimationStart + ' hari - ' + estimationEnd + ' hari';
            }
        },
        { header: "Nomor Telpon", accessor: "phone" },
    ]

    // Filter Data
    const filteredExpress = express.filter(ex =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.price.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ================================================================================


    // Navigation
    // Navigation to Create
    const navigateToCreateExpress = () => {
        navigate('/logistic/express/new');
    }


    // ================================================================================


    // Logic


    // ================================================================================


    // Page Container
    return (
        <MainContainer
            pageLabel="Pengangkutan"
            setSearchValue={setSearchTerm}
            createOnclick={navigateToCreateExpress}
            columns={columns}
            data={filteredExpress}
            isLoading={isLoading}
            canEdit={roleAccess(accessList, 'mengedit-data-pengangkutan')}
            canAdd={roleAccess(accessList, 'menambah-data-pengangkutan')}
        />
    );
}

export default Express;