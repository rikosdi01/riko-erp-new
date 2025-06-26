import { useParams } from "react-router-dom";
import './DetailCourier.css'
import { useEffect, useState } from "react";
import { useCourier } from "../../../../../../context/logistic/CourierContext";
import EntityCourier from "../../components/entity_courier/EntityCourier";
import CourierRepository from "../../../../../../repository/logistic/CourierRepository";

const DetailCourier = () => {
    // Hooks
    const { id } = useParams();
    const { couriers } = useCourier();

    const [courier, setCourier] = useState([]);

    useEffect(() => {
        const selectedCourier = couriers.find((c) => c.id === id);
        if (selectedCourier) {
            setCourier(selectedCourier);
        }
    }, [couriers, id]);

    return (
        <div>
            <EntityCourier
                mode={'detail'}
                initialData={courier}
                onSubmit={async (data) => {
                    await CourierRepository.updateCourier(id, data);
                }}
            />
        </div>
    )
}

export default DetailCourier;