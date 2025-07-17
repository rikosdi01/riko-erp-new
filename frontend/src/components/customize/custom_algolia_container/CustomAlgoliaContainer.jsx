import { useEffect, useState } from 'react';
import Table from '../../table/Table';
import './CustomAlgoliaContainer.css';
import { Configure, InstantSearch, useHits } from 'react-instantsearch';
import CustomPagination from '../custom_pagination/CustomPagination';
import CustomSearchBox from '../custom_searchbox/CustomSearchBox';
import IconButton from '../../button/icon_button/IconButton';
import { Download, Plus, Upload } from 'lucide-react';
import AlgoliaListener from '../custom_listener/CustomListener';
import CustomAlgoliaDropdown from '../custom_dropdown/CustomDropdown';

const CustomAlgoliaContainer = ({
    pageLabel,
    searchClient,
    indexName,
    columns,
    subscribeFn,
    createOnclick,
    enableDropdown = false,
    enableImport = true,
    enableExport = true,
    enableCreate = true,
    filters,
    isSecondary = false,
    canEdit,
}) => {
    const [itemsPerPage, setItemsPerPage] = useState(8);
    useEffect(() => {
        console.log('itemsPerPage:', itemsPerPage);
    }, [itemsPerPage]);

    const ItemsHit = () => {
        const { items } = useHits();

        return (
            <Table
                isAlgoliaTable={true}
                columns={columns}
                data={items}
                isLoading={false}
                selectedItems={selectedItems}
                onCheckboxChange={handleCheckboxChange}
                onSelectAllChange={handleSelectAllChange}
                handleDeleteItems={() => { }}
                title={pageLabel}
                canEdit={canEdit}
                onclick={(id) => navigateToDetail(id)}
                itemsPerPage={itemsPerPage}
                setItemsPerPage={setItemsPerPage}
                enableCheckbox={false}
                isSecondary={isSecondary}
            />
        )
    }


    // ================================================================================


    // Variables
    const [selectedItems, setSelectedItems] = useState([]);


    // ================================================================================


    // Logic
    // Checkbox Checked
    const handleCheckboxChange = (id) => {
        setSelectedItems((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((itemId) => itemId !== id)
                : [...prevSelected, id]
        );
    };

    // Checkbox Selected All
    const handleSelectAllChange = () => {
        if (selectedItems.length === merks.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(merks.map((emp) => emp.id));
        }
    };


    // ================================================================================

    return (
        <div className="main-container">
            <InstantSearch
                searchClient={searchClient}
                indexName={indexName}
            >

                <AlgoliaListener subscribeFn={subscribeFn} />
                <Configure
                    hitsPerPage={itemsPerPage}
                    filters={filters}
                />

                <div className="main-container-header">
                    <CustomSearchBox
                        placeholder={`Cari ${pageLabel} dengan nama atau kata kunci...`}
                    />

                    {enableDropdown && (
                        <CustomAlgoliaDropdown
                            attribute="warehouse.name"
                        />
                    )}

                    {/* Import */}
                    {enableImport && (
                        <IconButton
                            tooltipLabel={`Impor ${pageLabel}`}
                            icon={<Download size={18} />}
                        />
                    )}

                    {/* Export */}
                    {enableExport && (
                        <IconButton
                            tooltipLabel={`Ekspor ${pageLabel}`}
                            icon={<Upload size={18} />}
                        />
                    )}

                    {/* Create */}
                    {enableCreate && (
                        <IconButton
                            tooltipLabel={`Tambah ${pageLabel}`}
                            icon={<Plus size={18} />}
                            onclick={createOnclick}
                            background='#0d82ff'
                            color='white'
                        />
                    )}

                </div>

                <div className='table-wrapper'>
                    <ItemsHit />

                    <CustomPagination
                        itemsPerPage={itemsPerPage}
                        setItemsPerPage={setItemsPerPage}
                    />
                </div>

            </InstantSearch>
        </div>
    )
}

export default CustomAlgoliaContainer;