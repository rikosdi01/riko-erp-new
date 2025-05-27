import './AddCategory.css';
import EntityCategory from '../../components/EntityCategory';
import CategoriesRepository from '../../../../../../repository/warehouse/CategoriesRepository';

const AddCategory = () => {
    return (
        <EntityCategory
            mode={'create'}
            onSubmit={async (data, reset) => {
                await CategoriesRepository.createCategory(data);
                reset();
            }}
        />
    )
}

export default AddCategory;