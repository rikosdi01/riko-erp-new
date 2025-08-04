import { useNavigate } from 'react-router-dom';
import { ALGOLIA_INDEX_SO, clientSO } from '../../../../../config/algoliaConfig';
import CustomAlgoliaContainer from '../../../../components/customize/custom_algolia_container/CustomAlgoliaContainer';
import Formatting from '../../../../utils/format/Formatting';
import './SalesOrder.css';
import SalesOrderRepository from '../../../../repository/sales/SalesOrderRepository';
import { useUsers } from '../../../../context/auth/UsersContext';
import roleAccess from '../../../../utils/helper/roleAccess';

const SalesOrder = () => {
    // Hooks
    const navigate = useNavigate();
    const { loginUser, accessList } = useUsers();
    console.log('Access List: ', accessList);

    const columns = [
        { header: "No. Pesanan", accessor: "code" },
        {
            header: "Tanggal",
            accessor: "createdAt",
            renderCell: (value) => Formatting.formatDateByTimestamp(value),
        },
        { header: "Nama Pelanggan", accessor: "customer.name" },
        { header: "Keterangan", accessor: "description" },
        {
            header: "Harga",
            accessor: "totalPayment",
            renderCell: (value) => Formatting.formatCurrencyIDR(value),
        },
        // {
        //     header: "Sudah Print?",
        //     accessor: "isPrint",
        //     renderCell: (value) => value ? 'Sudah Print' : 'Belum Print'
        // },
        {
            header: "Status",
            accessor: "status",
            renderCell: (value) => value.charAt(0).toUpperCase() + value.slice(1)
        }
    ]


    // ================================================================================


    // Navigation
    // Navigation to Create
    const navigateToCreateItems = () => {
        navigate('/sales/sales-order/new');
    }

    return (
        <CustomAlgoliaContainer
            pageLabel="SO"
            searchClient={clientSO}
            indexName={ALGOLIA_INDEX_SO}
            columns={columns}
            createOnclick={navigateToCreateItems}
            subscribeFn={SalesOrderRepository.subscribeToSalesOrderChanges}
            enableExport={false}
            enableImport={false}
            enableCreate={false}
            enableDropdown={true}
            dropdownAttribute={"status"}
            canAdd={roleAccess(accessList, 'menambah-data-pesanan-penjualan')}
            canEdit={roleAccess(accessList, 'mengedit-data-pesanan-penjualan')}
            enableDateRange={true}
        />
    )
}

export default SalesOrder;
