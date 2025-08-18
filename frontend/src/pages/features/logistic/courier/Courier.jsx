import './Courier.css';
import MainContainer from '../../../../components/container/main_container/MainContainer';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCourier } from '../../../../context/logistic/CourierContext';
import roleAccess from '../../../../utils/helper/roleAccess';
import { useUsers } from '../../../../context/auth/UsersContext';

const Courier = () => {
    // Hooks
    const navigate = useNavigate();
        const { accessList } = useUsers();


    // ================================================================================


    // Context
    const { couriers, isLoading } = useCourier();


    // ================================================================================


    // Variables
    const [searchTerm, setSearchTerm] = useState("");


    // ================================================================================


    // Data
    // Columns Data
    const columns = [
        { header: "Nama Kurir", accessor: "name" },
        { header: "No. Telpon", accessor: "phone"},
        { 
            header: "Status", 
            accessor: "isActive",
            renderCell: (value) => value ? 'Aktif' : 'Tidak Aktif'
        }
    ]

    // Filter Data
    const filteredCourier = couriers.filter(courier =>
        courier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        courier.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        courier.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ================================================================================


    // Navigation
    // Navigation to Create
    const navigateToCreateCourier = () => {
        navigate('/logistic/couriers/new');
    }


    // ================================================================================


    // Logic


    // ================================================================================


    // Page Container
    return (
        <MainContainer
            pageLabel="Kurir"
            setSearchValue={setSearchTerm}
            createOnclick={navigateToCreateCourier}
            columns={columns}
            data={filteredCourier}
            isLoading={isLoading}
            enableImport={false}
            enableExport={false}
            canEdit={roleAccess(accessList, 'mengedit-data-kurir')}
            canAdd={roleAccess(accessList, 'menambah-data-kurir')}
        />
    );
}

export default Courier;