import { useNavigate } from 'react-router-dom';
import { ALGOLIA_INDEX_CUSTOMERS, clientCustomers } from '../../../../../config/algoliaConfig';
import CustomAlgoliaContainer from '../../../../components/customize/custom_algolia_container/CustomAlgoliaContainer';
import './Customers.css';
import CustomersRepository from '../../../../repository/sales/CustomersRepository';
import roleAccess from '../../../../utils/helper/roleAccess';
import { useUsers } from '../../../../context/auth/UsersContext';

const Customers = () => {
    // Hooks
    const navigate = useNavigate();
    const { accessList } = useUsers();


    const columns = [
        { header: "Nama Customer", accessor: "name" },
        { header: "Alamat", accessor: "address" },
        { header: "Telepon", accessor: "phone" },
        { header: "Kota", accessor: "city" },
        { header: "Provinsi", accessor: "province" },
        { header: "Sales", accessor: "salesman.name" },
    ]


    // ================================================================================


    // Navigation
    // Navigation to Create
    const navigateToCreateCustomers = () => {
        navigate('/sales/customers/new');
    }

    return (
        <CustomAlgoliaContainer
            pageLabel="Customer"
            searchClient={clientCustomers}
            indexName={ALGOLIA_INDEX_CUSTOMERS}
            columns={columns}
            createOnclick={navigateToCreateCustomers}
            subscribeFn={CustomersRepository.subscribeToCustomersChanges}
            canEdit={roleAccess(accessList, 'mengedit-data-pelanggan')}
            canAdd={roleAccess(accessList, 'menambah-data-pelanggan')}
        />
    )
}

export default Customers;
