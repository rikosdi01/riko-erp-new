import { ALGOLIA_INDEX_ITEMS, clientItems } from '../../../../../config/algoliaConfig';
import CustomAlgoliaContainer from '../../../../components/customize/custom_algolia_container/CustomAlgoliaContainer';
import ItemsRepository from '../../../../repository/warehouse/ItemsRepository';
import Formatting from '../../../../utils/format/Formatting';
import './ListProducts.css';

const ListProducts = () => {
    // Hooks


    const columns = [
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

    return (
        <CustomAlgoliaContainer
            pageLabel="Item"
            searchClient={clientItems}
            indexName={ALGOLIA_INDEX_ITEMS}
            columns={columns}
            subscribeFn={ItemsRepository.subscribeToItemsChanges}
            enableExport={false}
            enableImport={false}
            enableCreate={false}
            enableDropdown={true}
            dropdownAttribute={'category.name'}
            enableDropdown2={true}
            dropdownAttribute2={'brand'}
            onTableClick={() => {}}
            tableType='customers'
        />
    )
}

export default ListProducts;