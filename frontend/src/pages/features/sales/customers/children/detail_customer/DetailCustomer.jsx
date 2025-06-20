import { useParams } from "react-router-dom";
import MerksRepository from "../../../../../../repository/warehouse/MerksRepository";
import './DetailCustomer.css'
import { useEffect, useState } from "react";
import EntityCustomers from "../../components/entity_customers/EntityCustomers";
import { useCustomers } from "../../../../../../context/sales/CustomersContext";
import CustomersRepository from "../../../../../../repository/sales/CustomersRepository";

const DetailCustomer = () => {
    // Hooks
    const { id } = useParams();
    const { customers } = useCustomers();
    console.log(id);

    const [customer, setCustomer] = useState([]);

    useEffect(() => {
        const selectedCustomer = customers.find((c) => c.id === id);
        if (selectedCustomer) {
            setCustomer(selectedCustomer);
        }
    }, [customers, id]);

    return (
        <div>
            <EntityCustomers
                mode={'detail'}
                initialData={customer}
                onSubmit={async (data) => {
                    await CustomersRepository.updateCustomers(id, data);
                }}
            />
        </div>
    )
}

export default DetailCustomer;