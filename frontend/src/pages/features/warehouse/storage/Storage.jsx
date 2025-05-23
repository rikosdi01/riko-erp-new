import './Storage.css';
import { Download, Plus, Upload } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { useNavigate } from "react-router-dom";
import SearchValue from '../../../../components/input/search_value/SearchValue';
import FilterValue from '../../../../components/filter/FilterValue/FilterValue';
import IconButton from '../../../../components/button/icon_button/IconButton';
import Table from '../../../../components/table/Table';
import { useState } from 'react';
import Formatting from '../../../../utils/format/Formatting';
import { useInventory } from '../../../../context/warehouse/InventoryContext';

const Storage = () => {
    const navigate = useNavigate();
    // const { inventory, isLoading } = useInventory();
    const [selectedItems, setSelectedItems] = useState([]);
    const inventory = [];
    const isLoading = false;

    const handleCheckboxChange = (id) => {
        setSelectedItems((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((itemId) => itemId !== id)
                : [...prevSelected, id]
        );
    };

    const handleSelectAllChange = () => {
        if (selectedItems.length === inventory.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(inventory.map((emp) => emp.id));
        }
    };

    const navigateToCreateCategory = () => {
        navigate('/inventory/storage/new');
    }

    const navigateToDetailsCategory = (id) => {
        navigate(`/inventory/storage/${id}`);
    }

    const columns = [
        { header: "Item", accessor: "name" },
        { header: "Kategori", accessor: "categoryName" },
        { header: "Motor", accessor: "brandName" },
        { header: "Kts", accessor: "quantity" },
        // { header: "Status Packing", accessor: "packingStatus" },
        { header: "Rak", accessor: "rack" },
        { header: "Baris", accessor: "rackLines" },
        { header: "No. Dus", accessor: "boxNumber" },
        { header: "Trip", accessor: "trip" },
    ]

    return (
        <div className="main-container">
            <div className="main-container-header">
                <SearchValue label="merek" />

                <FilterValue placeholder={"Semua Status"} />

                {/* Import */}
                <IconButton
                    tooltipLabel="Impor"
                    icon={<Download size={18} />}
                />

                {/* Export */}
                <IconButton
                    tooltipLabel="Ekspor"
                    icon={<Upload size={18} />}
                />

                {/* Create */}
                <IconButton
                    tooltipLabel="Tambah Kategori"
                    icon={<Plus size={18} />}
                    onclick={navigateToCreateCategory}
                    background='#0d82ff'
                    color='white'
                />
            </div>

            <Table
                columns={columns}
                data={inventory}
                isLoading={isLoading}
                selectedItems={selectedItems}
                onCheckboxChange={handleCheckboxChange}
                onSelectAllChange={handleSelectAllChange}
                handleDeleteItems={() => { }}
                title="Merek"
                onclick={(id) => navigateToDetailsCategory(id)}
            />

            {/* Tooltip dengan efek fade-in dan muncul di bawah */}
            <Tooltip
                id="tooltip"
                place="bottom"
                effect="solid"
                delayShow={200}
                className="custom-tooltip"
            />
        </div>
    );
}

export default Storage;
