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
            renderCell: (_, item) => {
                const stock = item.stock ?? {};

                // ambil semua angka stok dari nested object
                const totalStock = Object.values(stock).reduce((sum, val) => {
                    if (typeof val === "number") {
                        // kalau ternyata langsung angka (old data model)
                        return sum + val;
                    } else if (typeof val === "object" && val !== null) {
                        // kalau nested object (new data model)
                        return sum + Object.values(val).reduce((s, v) => s + v, 0);
                    }
                    return sum;
                }, 0);

                const sets = Array.isArray(item?.set) ? item.set : [];
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
            dropdownTitle={'Kategori'}
            enableDropdown2={true}
            dropdownAttribute2={'brand'}
            dropdownTitle2={'Motor'}
            enableDropdown3={true}
            dropdownAttribute3={'name'}
            dropdownTitle3={'Model'}
            enablePriceFilter={true}
            onTableClick={() => {}}
            tableType='customers'
            filters={'isActive: true'}
        />
    )
}

export default ListProducts;