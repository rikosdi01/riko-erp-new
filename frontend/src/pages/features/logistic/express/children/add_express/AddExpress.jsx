import ExpressRepository from "../../../../../../repository/logistic/ExpressRepository";
import EntityExpress from "../../components/entity_express/EntityExpress";
import './AddExpress.css'

const AddExpress = () => {
    return (
        <div>
            <EntityExpress
                mode={'create'}
                onSubmit={async (data, reset) => {
                    await ExpressRepository.createExpress(data);
                    reset();
                }}
            />
        </div>
    )
}

export default AddExpress;