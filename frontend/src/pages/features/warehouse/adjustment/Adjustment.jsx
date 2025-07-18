import './Adjustment.css';
import MainContainer from '../../../../components/container/main_container/MainContainer';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Formatting from '../../../../utils/format/Formatting';
import { useAdjustment } from '../../../../context/warehouse/AdjustmentContext';
import roleAccess from '../../../../utils/helper/roleAccess';
import { useUsers } from '../../../../context/auth/UsersContext';

const Adjustment = () => {
    // Hooks
    const navigate = useNavigate();
    const { accessList } = useUsers();


    // ================================================================================


    // Context
    const { adjustment, isLoading } = useAdjustment();


    // ================================================================================


    // Variables
    const [searchTerm, setSearchTerm] = useState("");


    // ================================================================================


    // Data
    // Columns Data
    const columns = [
        { header: "Kode Penyesuaian", accessor: "code" },
        {
            header: "Tanggal",
            accessor: "createdAt",
            renderCell: (value) => Formatting.formatDate(value)
        },
        { header: "Deskripsi", accessor: "description" },
        { header: "Gudang Penyesuaian", accessor: "warehouse.name" },
    ]

    // Filter Data
    const filteredAdjustment = adjustment.filter(adj =>
        adj.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        Formatting.formatDate(adj.createdAt).toLowerCase().includes(searchTerm.toLowerCase()) ||
        adj.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        adj.warehouse?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );



    // ================================================================================


    // Navigation
    // Navigation to Create
    const navigateToCreateAdjustment = () => {
        navigate('/inventory/adjustment/new');
    }


    // ================================================================================


    // Logic


    // ================================================================================

    // Page Container
    return (
        <MainContainer
            pageLabel="Penyesuaian Barang"
            setSearchValue={setSearchTerm}
            createOnclick={navigateToCreateAdjustment}
            columns={columns}
            data={filteredAdjustment}
            isLoading={isLoading}
            canEdit={roleAccess(accessList, 'mengedit-data-penyesuaian-pesanan')}
            canAdd={roleAccess(accessList, 'menambah-data-penyesuaian-pesanan')}
        />
    );
}

export default Adjustment;
