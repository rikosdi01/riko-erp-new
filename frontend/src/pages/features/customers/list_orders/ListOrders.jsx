import { useNavigate } from 'react-router-dom';
import { ALGOLIA_INDEX_SO, clientSO } from '../../../../../config/algoliaConfig';
import CustomAlgoliaContainer from '../../../../components/customize/custom_algolia_container/CustomAlgoliaContainer';
import Formatting from '../../../../utils/format/Formatting';
import './ListOrders.css';
import SalesOrderRepository from '../../../../repository/sales/SalesOrderRepository';
import { useUsers } from '../../../../context/auth/UsersContext';

const ListOrders = () => {
    // Hooks
    const navigate = useNavigate();
    const { accessList, loginUser } = useUsers();
    console.log('Access List: ', accessList);
    console.log('Login User: ', loginUser);

    const columns = [
        { header: "No. Pesanan", accessor: "code" },
        {
            header: "Tanggal",
            accessor: "createdAt",
            renderCell: (value) => Formatting.formatDateByTimestamp(value),
        },
        { header: "Keterangan", accessor: "description" },
        {
            header: "Harga",
            accessor: "totalPayment",
            renderCell: (value) => Formatting.formatCurrencyIDR(value),
        },
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

    if (!loginUser) {
        return <div>Loading user data...</div>;
    }

    return (
        <CustomAlgoliaContainer
            pageLabel="Orderan"
            searchClient={clientSO}
            indexName={ALGOLIA_INDEX_SO}
            columns={columns}
            createOnclick={navigateToCreateItems}
            subscribeFn={SalesOrderRepository.subscribeToSalesOrderChanges}
            enableExport={false}
            enableImport={false}
            enableCreate={false}
            canAdd={false}
            canEdit={true}
            enableDropdown={true}
            dropdownAttribute={'status'}
            filters={`customer.username: "${loginUser.username}"`}
            enableDateRange={true}
        />
    )
}

export default ListOrders;
