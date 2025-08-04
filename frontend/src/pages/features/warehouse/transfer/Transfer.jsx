// import './Transfer.css';
// import MainContainer from '../../../../components/container/main_container/MainContainer';
// import { useNavigate } from 'react-router-dom';
// import { useState } from 'react';
// import { useTransfer } from '../../../../context/warehouse/TransferContext';
// import Formatting from '../../../../utils/format/Formatting';
// import { useUsers } from '../../../../context/auth/UsersContext';
// import roleAccess from '../../../../utils/helper/roleAccess';

// const Transfer = () => {
//     // Hooks
//     const navigate = useNavigate();
//         const { accessList } = useUsers();


//     // ================================================================================


//     // Context
//     const { transfer, isLoading } = useTransfer();


//     // ================================================================================


//     // Variables
//     const [searchTerm, setSearchTerm] = useState("");


//     // ================================================================================


//     // Data
//     // Columns Data
//     const columns = [
//         { header: "Kode Transfer", accessor: "code" },
//         {
//             header: "Tanggal",
//             accessor: "createdAt",
//             renderCell: (value) => Formatting.formatDate(value)
//         },
//         { header: "Deskripsi", accessor: "description" },
//         { header: "Gudang Dari", accessor: "warehouseFrom.name" },
//         { header: "Gudang Ke", accessor: "warehouseTo.name" },
//     ]

//     // Filter Data
//     const filteredMerks = transfer.filter(tf =>
//         tf.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         Formatting.formatDate(tf.createdAt).toLowerCase().includes(searchTerm.toLowerCase()) ||
//         tf.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         tf.warehouseFrom?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         tf.warehouseTo?.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );



//     // ================================================================================


//     // Navigation
//     // Navigation to Create
//     const navigateToCreateMerk = () => {
//         navigate('/inventory/transfer/new');
//     }


//     // ================================================================================


//     // Logic


//     // ================================================================================


//     // Page Container
//     return (
//         <MainContainer
//             pageLabel="Transfer Barang"
//             setSearchValue={setSearchTerm}
//             createOnclick={navigateToCreateMerk}
//             columns={columns}
//             data={filteredMerks}
//             isLoading={isLoading}
//             canEdit={roleAccess(accessList, 'mengedit-data-pemindahan-stok')}
//             canAdd={roleAccess(accessList, 'menambah-data-pemindahan-stok')}
//         />
//     );
// }

// export default Transfer;


import { ALGOLIA_INDEX_ADJUSTMENT, ALGOLIA_INDEX_TRANSFER, clientAdjustment, clientTransfer } from '../../../../../config/algoliaConfig';
import CustomAlgoliaContainer from '../../../../components/customize/custom_algolia_container/CustomAlgoliaContainer';
import './Transfer.css';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../../../context/auth/UsersContext';
import roleAccess from '../../../../utils/helper/roleAccess';
import Formatting from '../../../../utils/format/Formatting';
import AdjustmentRepository from '../../../../repository/warehouse/AdjustmentRepository';
import TransferRepository from '../../../../repository/warehouse/TransferRepository';

const Transfer = () => {
    // Hooks
    const navigate = useNavigate();
    const { loginUser, accessList } = useUsers();


    // ================================================================================


    // Variables
    // Columns for the table
    const columns = [
        // { header: "Kode Transfer", accessor: "code" },
        {
            header: "Tanggal",
            accessor: "createdAt",
            renderCell: (value) => Formatting.formatDate(value)
        },
        { header: "Lokasi dari", accessor: "locationFrom" },
        { header: "Lokasi ke", accessor: "locationTo" },
    ]
    // ================================================================================


    // Navigation
    // Navigation to Create
    const navigateToCreateAdjustment = () => {
        navigate('/inventory/transfer/new');
    }

    const filters = loginUser?.location ? `location: ${loginUser.location}` : '';

    return (
        <CustomAlgoliaContainer
            pageLabel="Catatan Pemindahan"
            searchClient={clientTransfer}
            indexName={ALGOLIA_INDEX_TRANSFER}
            columns={columns}
            createOnclick={navigateToCreateAdjustment}
            subscribeFn={TransferRepository.subscribeToTransferChanges}
            enableExport={false}
            enableImport={false}
            enableCreate={false}
            filters={filters }
            enableDateRange={true}
            canEdit={roleAccess(accessList, 'mengedit-data-pemindahan-stok')}
            canAdd={roleAccess(accessList, 'menambah-data-pemindahan-stok')}
        />
    )
}

export default Transfer;