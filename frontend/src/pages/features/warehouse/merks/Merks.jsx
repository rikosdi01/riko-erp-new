import './Merks.css';
import { Download, Plus, Upload } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { useNavigate } from "react-router-dom";
import { useMerks } from '../../../../context/warehouse/MerkContext';
import SearchValue from '../../../../components/input/search_value/SearchValue';
import IconButton from '../../../../components/button/icon_button/IconButton';
import Table from '../../../../components/table/Table';
import { useState } from 'react';

const Merks = () => {
    const navigate = useNavigate();
    // const { merks, isLoading } = useMerks();
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const merks = [];
    const isLoading = false;


    const handleCheckboxChange = (id) => {
        setSelectedItems((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((itemId) => itemId !== id)
                : [...prevSelected, id]
        );
    };

    const handleSelectAllChange = () => {
        if (selectedItems.length === merks.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(merks.map((emp) => emp.id));
        }
    };

    const navigateToCreateMerk = () => {
        navigate('/inventory/merks/new');
    }

    const navigateToDetailMerk = (id) => {
        navigate(`/inventory/merks/${id}`);
    }

    // **Filter data berdasarkan nilai pencarian**
    const filteredMerks = merks.filter(merk =>
        merk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        merk.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        { header: "Kode Merek", accessor: "code" },
        { header: "Nama Merek", accessor: "name" },
    ]

    return (
        <div className="main-container">
            <div className="main-container-header">
                <SearchValue
                    label="merek"
                    onSearchChange={setSearchTerm}
                />

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
                    tooltipLabel="Tambah Merek"
                    icon={<Plus size={18} />}
                    onclick={navigateToCreateMerk}
                    background='#0d82ff'
                    color='white'
                />
            </div>

            <Table
                columns={columns}
                data={filteredMerks}
                isLoading={isLoading}
                selectedItems={selectedItems}
                onCheckboxChange={handleCheckboxChange}
                onSelectAllChange={handleSelectAllChange}
                handleDeleteItems={() => { }}
                title="Merek"
                onclick={(id) => navigateToDetailMerk(id)}
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

export default Merks;
