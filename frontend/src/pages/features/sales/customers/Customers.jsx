import { useNavigate } from 'react-router-dom';
import { ALGOLIA_INDEX_CUSTOMERS, ALGOLIA_INDEX_USERS, clientCustomers, clientUsers } from '../../../../../config/algoliaConfig';
import CustomAlgoliaContainer from '../../../../components/customize/custom_algolia_container/CustomAlgoliaContainer';
import './Customers.css';
import CustomersRepository from '../../../../repository/sales/CustomersRepository';
import roleAccess from '../../../../utils/helper/roleAccess';
import { useUsers } from '../../../../context/auth/UsersContext';
import UserRepository from '../../../../repository/authentication/UserRepository';

const Customers = () => {
    // Hooks
    const navigate = useNavigate();
    const { accessList } = useUsers();


    const columns = [
        { header: "Nama Pelanggan", accessor: "username" },
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
        navigate('/signup-customer');
    }

    return (
        <CustomAlgoliaContainer
            pageLabel="Pelanggan"
            searchClient={clientUsers}
            indexName={ALGOLIA_INDEX_USERS}
            columns={columns}
            createOnclick={navigateToCreateCustomers}
            subscribeFn={UserRepository.subscribeToUsersChanges}
            filters={'type: customer'}
            canEdit={roleAccess(accessList, 'mengedit-data-pelanggan')}
            canAdd={roleAccess(accessList, 'menambah-data-pelanggan')}
        />
    )
}

export default Customers;
