import { useNavigate } from 'react-router-dom';
import { ALGOLIA_INDEX_ITEMS, clientItems } from '../../../../../config/algoliaConfig';
import CustomAlgoliaContainer from '../../../../components/customize/custom_algolia_container/CustomAlgoliaContainer';
import ItemsRepository from '../../../../repository/warehouse/ItemsRepository';
import Formatting from '../../../../utils/format/Formatting';
import './Items.css';

const Items = () => {
    // Hooks
    const navigate = useNavigate();


    const columns = [
        { header: "Kode Item", accessor: "code" },
        { header: "Nama Item", accessor: "name" },
        { header: "Kategori", accessor: "categoryName" },
        { header: "Motor", accessor: "brandName" },
        { header: "Kuantitas", accessor: "quantity" },
        {
            header: "Harga Jual",
            accessor: "price",
            renderCell: (value) => Formatting.formatCurrencyIDR(value)
        },
    ]


    // ================================================================================


    // Navigation
    // Navigation to Create
    const navigateToCreateItems = () => {
        navigate('/inventory/items/new');
    }
    
    return (
        <CustomAlgoliaContainer
            pageLabel="Item"
            searchClient={clientItems}
            indexName={ALGOLIA_INDEX_ITEMS}
            columns={columns}
            createOnclick={navigateToCreateItems}
            subscribeFn={ItemsRepository.subscribeToItemsChanges}
        />
    )
}

export default Items;
