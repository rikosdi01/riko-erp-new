import CustomersRepository from "../../../../../../repository/sales/CustomersRepository";
import EntityCustomers from "../../components/entity_customers/EntityCustomers";
import './AddCustomer.css'

const AddCustomer = () => {
    return (
        <div>
            <EntityCustomers
                mode={'create'}
                onSubmit={async (data, reset) => {
                    await CustomersRepository.createCustomers(data);
                    reset();
                }}
            />
        </div>
    )
}

export default AddCustomer;