import CourierRepository from "../../../../../../repository/logistic/CourierRepository";
import EntityCourier from "../../components/entity_courier/EntityCourier";
import './AddCourier.css'

const AddCourier = () => {
    return (
        <div>
            <EntityCourier
                mode={'create'}
                onSubmit={async (data, reset) => {
                    await CourierRepository.createCourier(data);
                    reset();
                }}
            />
        </div>
    )
}

export default AddCourier;