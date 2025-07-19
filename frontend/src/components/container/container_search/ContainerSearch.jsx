import { Search } from 'lucide-react';
import './ContainerSearch.css'
import { useState } from 'react';
import { Configure, InstantSearch, useHits } from 'react-instantsearch';
import CustomSearchBox from '../../customize/custom_searchbox/CustomSearchBox';
import CustomPagination from '../../customize/custom_pagination/CustomPagination';
import Table from '../../table/Table';
import ContentHeader from '../../content_header/ContentHeader';

const ContainerSearch = ({
    label,
    icon,
    searchClient,
    indexName,
    columns = [],
    setValues,
}) => {
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [openContainerSearch, setOpenContainerSearch] = useState(false);

    const ItemsHit = () => {
        const { items } = useHits();
        console.log('items:', items);

        return (
            <Table
                isAlgoliaTable={true}
                columns={columns}
                data={items}
                isLoading={false}
                title={label}
                onTableClick={(item) => {
                    setValues(item);
                    setOpenContainerSearch(false);
                }}
                itemsPerPage={itemsPerPage}
                setItemsPerPage={setItemsPerPage}
                enableCheckbox={false}
            />
        )
    }

    return (
        <div className="container-search">
            <label className='container-search-label'>{label}:</label>
            <div className='container-search-box'>
                {icon}
                {label}
                <div className='container-search-child' onClick={() => setOpenContainerSearch(true)}>
                    <Search size={18} />
                </div>
            </div>

            {openContainerSearch && (
                <div className='modal-overlay'>
                    <div className='container-search-results'>
                        {/* Tombol Close */}
                        <button
                            className="close-modal-button"
                            onClick={() => setOpenContainerSearch(false)}
                        >
                            ✕
                        </button>
                        <ContentHeader title="Kategori" enableBack={false} />

                        <InstantSearch searchClient={searchClient} indexName={indexName}>
                            <Configure hitsPerPage={itemsPerPage} />

                            <div>
                                <CustomSearchBox
                                    placeholder={`Cari ${label} dengan naman atau kata kunci...`}
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
                    </div>
                </div>
            )}

        </div>
    )
}

export default ContainerSearch;