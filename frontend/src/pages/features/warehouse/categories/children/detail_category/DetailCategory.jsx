import { useParams } from "react-router-dom";
import './DetailCategory.css'
import { useEffect, useState } from "react";
import CategoriesRepository from "../../../../../../repository/warehouse/CategoriesRepository";
import EntityCategory from "../../components/EntityCategory";

const DetailCategory = () => {
    // Hooks
    const { id } = useParams();

    const [category, setCategory] = useState([]);

    // Fetch the category details using the id from the URL
    useEffect(() => {
        const fetchCategoryDetails = async () => {
            try {
                const categoryDetails = await CategoriesRepository.getCategoryById(id);
                setCategory(categoryDetails);
            } catch (error) {
                console.error("Error fetching category details: ", error);
            }
        };

        fetchCategoryDetails();
    }, [id]);

    return (
        <div>
            <EntityCategory
                mode={'detail'}
                initialData={category}
                onSubmit={async (data) => {
                    await CategoriesRepository.updateCategory(id, data);
                }}
            />
        </div>
    )
}

export default DetailCategory;