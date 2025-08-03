import { Search } from 'lucide-react';
import './ContainerSearch.css'
import { useEffect, useState } from 'react';
import { Configure, InstantSearch, useHits } from 'react-instantsearch';
import CustomSearchBox from '../../customize/custom_searchbox/CustomSearchBox';
import CustomPagination from '../../customize/custom_pagination/CustomPagination';
import Table from '../../table/Table';
import ContentHeader from '../../content_header/ContentHeader';
import Dropdown from '../../select/Dropdown';

const ContainerSearch = ({
    mode,
    label,
    icon,
    searchClient,
    indexName,
    columns = [],
    value,
    setValues,
    enableStock = false,
    location,
}) => {
    const [selectedValue, setSelectedValue] = useState([]);

    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [openContainerSearch, setOpenContainerSearch] = useState(false);

    useEffect(() => {
        console.log('Selected Value: ', selectedValue);
    }, [selectedValue]);

    const cleanMappers = {
        item: (item) => ({
            id: item?.id || item?.objectID,
            name: item?.name ?? '',
            code: item?.code ?? '',
            category: {
                code: item?.category?.code ?? '',
                name: item?.category?.name ?? '',
            },
            brand: item?.brand ?? '',
            racks: item?.racks ?? [],
            set: item?.set ?? [],
            price: item?.salePrice ?? 0,
        }),
        category: (item) => ({
            id: item?.id || item?.objectID,
            code: item?.code ?? '',
            name: item?.name ?? '',
            merks: item?.merks ?? '',
        }),
        customer: (item) => ({
            id: item?.id || item?.objectID,
            name: item?.name ?? '',
            salesman: item?.salesman?.name ?? '',
        }),
        express: (item) => ({
            id: item?.id || item?.objectID,
            name: item?.name ?? '',
            phone: item?.phone ?? '',
            price: item?.price ?? 0,
            service: item?.service ?? '',
            set: item?.set ?? '',
        }),
        // tambah mode lainnya di sini...
    };


    const ItemsHit = () => {
        const { items } = useHits();

        return (
            <Table
                isAlgoliaTable={true}
                columns={columns}
                data={items}
                isLoading={false}
                title={label}
                onTableClick={(item) => {
                    console.log('Mode: ', mode);
                    const cleanItem = cleanMappers[mode]
                        ? cleanMappers[mode](item)
                        : item;

                    setValues(cleanItem);
                    setOpenContainerSearch(false);
                }}
                itemsPerPage={itemsPerPage}
                setItemsPerPage={setItemsPerPage}
                enableCheckbox={false}
                selectedValue={selectedValue}
                setSelectedValue={setSelectedValue}
            />
        )
    }

    return (
        <div className="container-search"
            onClick={() => setOpenContainerSearch(true)}
        >
            <label className='container-search-label'>Pilih {label}:</label>
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    className="container-search-box"
                    readOnly
                    value={value}
                    onFocus={() => setOpenContainerSearch(true)}
                />
                <div className='container-search-child'>
                    <Search size={18} />
                </div>
                {icon}
            </div>

            {openContainerSearch && (
                <div className='modal-overlay' onClick={() => setOpenContainerSearch(false)}>
                    <div className='container-search-results' onClick={(e) => e.stopPropagation()} >
                        {/* Tombol Close */}
                        <button
                            className="close-modal-button"
                            onClick={() => setOpenContainerSearch(false)}
                        >
                            ✕
                        </button>
                        <ContentHeader title={label} enableBack={false} />

                        <InstantSearch searchClient={searchClient} indexName={indexName}>
                            <Configure hitsPerPage={itemsPerPage} />

                            <div>
                                <CustomSearchBox
                                    placeholder={`Cari ${label} dengan nama atau kata kunci...`}
                                />
                            </div>

                            <div className='table-wrapper'>
                                <ItemsHit />
                                <CustomPagination
                                    itemsPerPage={itemsPerPage}
                                    setItemsPerPage={setItemsPerPage}
                                    enableItemsPerPage={false}
                                />
                            </div>
                        </InstantSearch>

                        {enableStock && (
                            <div className="container-search-stock">
                                <div>Stok saat ini:</div>
                                {selectedValue?.stock?.[location] ?? 0}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ContainerSearch;