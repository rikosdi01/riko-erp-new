import './Express.css';
import { Download, Plus, Upload } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { useNavigate } from "react-router-dom";
import SearchValue from '../../../../components/input/search_value/SearchValue';
import FilterValue from '../../../../components/filter/FilterValue/FilterValue';
import IconButton from '../../../../components/button/icon_button/IconButton';
import Table from '../../../../components/table/Table';
import { useState } from 'react';
import { useExpress } from '../../../../context/logistic/ExpressContext';
import Formatting from '../../../../utils/format/Formatting';

const Express = () => {
    const navigate = useNavigate();
    const { express, isLoading } = useExpress();
    const [selectedItems, setSelectedItems] = useState([]);

    const handleCheckboxChange = (id) => {
        setSelectedItems((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((itemId) => itemId !== id)
                : [...prevSelected, id]
        );
    };

    const handleSelectAllChange = () => {
        if (selectedItems.length === express.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(express.map((emp) => emp.id));
        }
    };

    const navigateToCreateMerk = () => {
        navigate('/logistic/express/new');
    }

    const navigateToDetailMerk = (id) => {
        navigate(`/logistic/express/${id}`);
    }

    const columns = [
        { header: "Nama Pengangkutan", accessor: "name" },
        { header: "Alamat Pengangkutan", accessor: "address" },
        { header: "No. Telpon", accessor: "telp"},
        { header: "Jasa", accessor: "service" },
        {
            header: "Harga",
            accessor: "price",
            renderCell: (value) => Formatting.formatCurrencyIDR(value)
        },
        { header: "Satuan", accessor: "set" }
    ]

    return (
        <div className="main-container">
            <div className="main-container-header">
                <SearchValue label="pengangkutan" />

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
                data={express}
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

export default Express;
