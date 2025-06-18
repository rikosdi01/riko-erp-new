import './Transfer.css';
import MainContainer from '../../../../components/container/main_container/MainContainer';
import { useNavigate } from 'react-router-dom';
import { useMerks } from '../../../../context/warehouse/MerkContext';
import { useState } from 'react';
import { useTransfer } from '../../../../context/warehouse/TransferContext';
import Formatting from '../../../../utils/format/Formatting';

const Transfer = () => {
    // Hooks
    const navigate = useNavigate();


    // ================================================================================


    // Context
    const { transfer, isLoading } = useTransfer();


    // ================================================================================


    // Variables
    const [searchTerm, setSearchTerm] = useState("");


    // ================================================================================


    // Data
    // Columns Data
    const columns = [
        { header: "Kode Merek", accessor: "code" },
        { 
            header: "Tanggal",
            accessor: "createdAt",
            renderCell: (value) => Formatting.formatDate(value)
        },
        { header: "Deskripsi", accessor: "description" },
        { header: "Gudang Dari", accessor: "warehouseFrom" },
        { header: "Gudang Ke", accessor: "warehouseTo" },
    ]

    // Filter Data
    const filteredMerks = transfer.filter(tf =>
        tf.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tf.createdAt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tf.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tf.warehouseFrom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tf.warehouseTO.toLowerCase().includes(searchTerm.toLowerCase())
    );


    // ================================================================================


    // Navigation
    // Navigation to Create
    const navigateToCreateMerk = () => {
        navigate('/inventory/transfer/new');
    }


    // ================================================================================


    // Logic


    // ================================================================================


    // Page Container
    return (
        <MainContainer
            pageLabel="Transfer Barang"
            setSearchValue={setSearchTerm}
            createOnclick={navigateToCreateMerk}
            columns={columns}
            data={filteredMerks}
            isLoading={isLoading}
        />
    );
}

export default Transfer;
