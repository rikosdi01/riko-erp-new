import { useParams } from "react-router-dom";
import './DetailExpress.css'
import { useEffect, useState } from "react";
import { useExpress } from "../../../../../../context/logistic/ExpressContext";
import EntityExpress from "../../components/entity_express/EntityExpress";
import ExpressRepository from "../../../../../../repository/logistic/ExpressRepository";

const DetailExpress = () => {
    // Hooks
    const { id } = useParams();
    const { express } = useExpress();
    console.log(id);
    console.log(express);

    const [sales, setSales] = useState([]);

    useEffect(() => {
        const selectedExpress = express.find((c) => c.id === id);
        if (selectedExpress) {
            setSales(selectedExpress);
        }
    }, [express, id]);

    return (
        <div>
            <EntityExpress
                mode={'detail'}
                initialData={sales}
                onSubmit={async (data) => {
                    await ExpressRepository.updateExpress(id, data);
                }}
            />
        </div>
    )
}

export default DetailExpress;