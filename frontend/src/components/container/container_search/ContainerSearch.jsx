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
    stocks = [],
    stockSelectedId = '',
}) => {
    console.log('Stocks : ', stocks);
    console.log('Selected ID:', stockSelectedId);

    const [selectedValue, setSelectedValue] = useState([]);
    const [selectedRack, setSelectedRack] = useState(stockSelectedId || '');

    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [openContainerSearch, setOpenContainerSearch] = useState(false);

    useEffect(() => {
        if (stocks?.length > 0 && stockSelectedId) {
            setSelectedRack(stockSelectedId);
        }
    }, [stocks, stockSelectedId]);


    useEffect(() => {
        console.log('Selected ID:', stockSelectedId);
    }, [stockSelectedId]);

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
            contact: item?.contact ?? '',
            salesman: item?.salesman?.name ?? '',
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
                                <div>Stok di gudang</div>
                                <div className="container-dropdown-wrapper">
                                    <Dropdown
                                        values={stocks}
                                        selectedId={selectedRack}
                                        setSelectedId={setSelectedRack}
                                        icon={<Search size={18} className='input-icon' />}
                                        marginBottom={0}
                                    />
                                </div>
                                <div>:</div>
                                <div>
                                    {
                                        (() => {
                                            console.log('Selected Value:', selectedValue);
                                            console.log('stockSelectedId:', stockSelectedId);

                                            const rackQty = selectedValue?.racks?.find(
                                                (rack) => rack.id === selectedRack
                                            )?.stock;

                                            console.log('Rack Quantity:', rackQty);

                                            return (
                                                (rackQty ?? 0) + ' ' + (Array.isArray(selectedValue?.set) && selectedValue.set.length > 0
                                                    ? selectedValue.set[0].set
                                                    : 'Item')
                                            );
                                        })()
                                    }
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ContainerSearch;