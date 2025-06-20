import CustomersRepository from "../../../../../../repository/sales/CustomersRepository";
import SalesmanRepository from "../../../../../../repository/sales/SalesmanRepository";
import EntitySalesman from "../../components/entity_salesman/EntitySalesman";
import './AddSalesman.css'

const AddSalesman = () => {
    return (
        <div>
            <EntitySalesman
                mode={'create'}
                onSubmit={async (data, reset) => {
                    await SalesmanRepository.createSalesman(data);
                    reset();
                }}
            />
        </div>
    )
}

export default AddSalesman;