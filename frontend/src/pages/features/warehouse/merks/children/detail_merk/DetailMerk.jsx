import { useParams } from "react-router-dom";
import MerksRepository from "../../../../../../repository/warehouse/MerksRepository";
import './DetailMerk.css'
import { useEffect, useState } from "react";
import { useMerks } from "../../../../../../context/warehouse/MerkContext";
import EntityMerk from "../../components/enitity_merks/EntityMerk";

const DetailMerk = () => {
    // Hooks
    const { id } = useParams();
    const { merks } = useMerks();
    console.log(id);

    const [merk, setMerk] = useState([]);

    useEffect(() => {
        const selectedMerk = merks.find((m) => m.id === id);
        if (selectedMerk) {
            setMerk(selectedMerk);
        }
    }, [merks, id]);

    return (
        <div>
            <EntityMerk
                mode={'detail'}
                initialData={merk}
                onSubmit={async (data) => {
                    await MerksRepository.updateMerk(id, data);
                }}
            />
        </div>
    )
}

export default DetailMerk;