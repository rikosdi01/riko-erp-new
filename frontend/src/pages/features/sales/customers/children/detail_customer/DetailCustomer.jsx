import { useParams } from "react-router-dom";
import './DetailCustomer.css'
import { useEffect, useState } from "react";
import EntityCustomers from "../../components/entity_customers/EntityCustomers";
import CustomersRepository from "../../../../../../repository/sales/CustomersRepository";
import UserRepository from "../../../../../../repository/authentication/UserRepository";

const DetailCustomer = () => {
    // Hooks
    const { id } = useParams();
    console.log(id);

    const [customer, setCustomer] = useState([]);

        // Fetch the item details using the id from the URL
        useEffect(() => {
            const fetchCustomerDetails = async () => {
                try {
                    const customerDetails = await UserRepository.getUserByUID(id);
                    setCustomer(customerDetails);
                } catch (error) {
                    console.error("Error fetching item details: ", error);
                }
            };
    
            fetchCustomerDetails();
        }, [id]);

    return (
        <div>
            <EntityCustomers
                mode={'detail'}
                initialData={customer}
                onSubmit={async (data) => {
                    await UserRepository.updateUserData(id, data);
                }}
            />
        </div>
    )
}

export default DetailCustomer;