import './Items.css';
import { Download, Plus, Upload } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { useNavigate } from "react-router-dom";
import SearchValue from '../../../../components/input/search_value/SearchValue';
import FilterValue from '../../../../components/filter/FilterValue/FilterValue';
import IconButton from '../../../../components/button/icon_button/IconButton';
import Table from '../../../../components/table/Table';
import { useState } from 'react';
import { useItems } from '../../../../context/warehouse/ItemContext';
import Formatting from '../../../../utils/format/Formatting';

const Items = () => {
    const navigate = useNavigate();
    const { items, isLoading } = useItems();
    const [selectedItems, setSelectedItems] = useState([]);

    const handleCheckboxChange = (id) => {
        setSelectedItems((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((itemId) => itemId !== id)
                : [...prevSelected, id]
        );
    };

    const handleSelectAllChange = () => {
        if (selectedItems.length === items.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(items.map((emp) => emp.id));
        }
    };

    const navigateToCreateCategory = () => {
        navigate('/warehouse/items/new');
    }

    const navigateToDetailsCategory = (id) => {
        navigate(`/warehouse/items/${id}`);
    }

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

    return (
        <div className="main-container">
            <div className="main-container-header">
                <SearchValue label="merek" />

                <FilterValue placeholder={"Semua Kategori"} />

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
                data={items}
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

export default Items;
