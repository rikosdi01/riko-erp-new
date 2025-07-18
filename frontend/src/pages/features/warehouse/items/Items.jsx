import { useNavigate } from 'react-router-dom';
import { ALGOLIA_INDEX_ITEMS, clientItems } from '../../../../../config/algoliaConfig';
import CustomAlgoliaContainer from '../../../../components/customize/custom_algolia_container/CustomAlgoliaContainer';
import ItemsRepository from '../../../../repository/warehouse/ItemsRepository';
import Formatting from '../../../../utils/format/Formatting';
import './Items.css';
import roleAccess from '../../../../utils/helper/roleAccess';
import { useUsers } from '../../../../context/auth/UsersContext';

const Items = () => {
    // Hooks
    const navigate = useNavigate();
    const { accessList } = useUsers();


    const columns = [
        {
            header: "Kode Item",
            accessor: "codeItemCategory",
            renderCell: (_, item) => {
                const code = item?.code ?? "";
                const categoryCode = item?.category?.code ?? "";
                return categoryCode + '-' + code;
            }
        },
        { header: "Nama Item", accessor: "name" },
        { header: "Kategori", accessor: "category.name" },
        { header: "Motor", accessor: "brand" },
        {
            header: "Stok",
            accessor: "stock",
            renderCell: (_, value) => {
                const totalStock = value.stock ? value.stock : 0
                const set = value.set
                return `${totalStock} ${set}`
            }
        },
        {
            header: "Harga Jual",
            accessor: "salePrice",
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
            canEdit={roleAccess(accessList, 'mengedit-data-item')}
            canAdd={roleAccess(accessList, 'menambah-data-item')}
        />
    )
}

export default Items;