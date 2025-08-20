import SupplierRepository from "../../../../../../repository/purchasing/SupplierRepository";
import EntitySupplier from "../../components/entity_supplier/EntitySupplier";
import './AddSupplier.css'

const AddSupplier = () => {
    return (
        <div>
            <EntitySupplier
                mode={'create'}
                onSubmit={async (data, reset) => {
                    await SupplierRepository.createSupplier(data);
                    reset();
                }}
            />
        </div>
    )
}

export default AddSupplier;