import { useParams } from "react-router-dom";
import './DetailSalesman.css'
import { useEffect, useState } from "react";
import { useSalesman } from "../../../../../../context/sales/SalesmanContext";
import EntitySalesman from "../../components/entity_salesman/EntitySalesman";
import SalesmanRepository from "../../../../../../repository/sales/SalesmanRepository";

const DetailSalesman = () => {
    // Hooks
    const { id } = useParams();
    const { salesman } = useSalesman();
    console.log(id);
    console.log(salesman);

    const [sales, setSales] = useState([]);

    useEffect(() => {
        const selectedSalesman = salesman.find((c) => c.id === id);
        if (selectedSalesman) {
            setSales(selectedSalesman);
        }
    }, [salesman, id]);

    return (
        <div>
            <EntitySalesman
                mode={'detail'}
                initialData={sales}
                onSubmit={async (data) => {
                    await SalesmanRepository.updateSalesman(id, data);
                }}
            />
        </div>
    )
}

export default DetailSalesman;