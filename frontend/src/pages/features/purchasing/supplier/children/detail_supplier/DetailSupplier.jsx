import { useParams } from "react-router-dom";
import './DetailSupplier.css'
import { useEffect, useState } from "react";
import EntitySupplier from "../../components/entity_supplier/EntitySupplier";
import SupplierRepository from "../../../../../../repository/purchasing/SupplierRepository";

const DetailSupplier = () => {
    // Hooks
    const { id } = useParams();
    console.log(id);

    const [supplier, setSupplier] = useState([]);

    useEffect(() => {
        const fetchSupplierDetails = async () => {
            try {
                const supplierDetails = await SupplierRepository.getSupplierById(id);
                setSupplier(supplierDetails);
            } catch (error) {
                console.error("Error fetching transfer details: ", error);
            }
        };

        fetchSupplierDetails();
    }, [id]);

    return (
        <div>
            <EntitySupplier
                mode={'detail'}
                initialData={supplier}
                onSubmit={async (data) => {
                    await SupplierRepository.updateSupplier(id, data);
                }}
            />
        </div>
    )
}

export default DetailSupplier;