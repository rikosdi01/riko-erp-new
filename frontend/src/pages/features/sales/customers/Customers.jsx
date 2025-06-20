import { useNavigate } from 'react-router-dom';
import { ALGOLIA_INDEX_CUSTOMERS, ALGOLIA_INDEX_ITEMS, clientCustomers, clientItems } from '../../../../../config/algoliaConfig';
import CustomAlgoliaContainer from '../../../../components/customize/custom_algolia_container/CustomAlgoliaContainer';
import ItemsRepository from '../../../../repository/warehouse/ItemsRepository';
import './Customers.css';
import CustomersRepository from '../../../../repository/sales/CustomersRepository';

const Customers = () => {
    // Hooks
    const navigate = useNavigate();


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
        />
    )
}

export default Customers;
