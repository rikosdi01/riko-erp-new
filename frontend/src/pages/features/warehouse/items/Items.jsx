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
                const sets = Array.isArray(value?.set) ? value.set : [];
                const unit = sets.find((s) => s?.set)?.set ?? "";
                return `${totalStock} ${unit}`;
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

    // const navigateToCreateItems = () => {
    //     window.open('/inventory/items/new', '_blank');
    // }


    return (
        <CustomAlgoliaContainer
            pageLabel="Item"
            searchClient={clientItems}
            indexName={ALGOLIA_INDEX_ITEMS}
            columns={columns}
            createOnclick={navigateToCreateItems}
            subscribeFn={ItemsRepository.subscribeToItemsChanges}
            enableExport={false}
            enableImport={false}
            enableDropdown={true}
            dropdownAttribute={'brand'}
            enableDropdown2={true}
            dropdownAttribute2={'category.name'}
            enableDropdown3={true}
            dropdownAttribute3={'name'}
            // enableCheckbox1={true}
            // checkbox1Label="Stok Tersedia"
            // checkbox1Attribute="stock"
            canEdit={roleAccess(accessList, 'mengedit-data-item')}
            canAdd={roleAccess(accessList, 'menambah-data-item')}
        />
    )
}

export default Items;