import './Salesman.css';
import { Download, Plus, Upload } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { useNavigate } from "react-router-dom";
import SearchValue from '../../../../components/input/search_value/SearchValue';
import FilterValue from '../../../../components/filter/FilterValue/FilterValue';
import IconButton from '../../../../components/button/icon_button/IconButton';
import Table from '../../../../components/table/Table';
import { useState } from 'react';
import { useSalesman } from '../../../../context/sales/SalesmanContext';

const Salesman = () => {
    const navigate = useNavigate();
    const { salesman, isLoading } = useSalesman();
    const [selectedItems, setSelectedItems] = useState([]);

    const handleCheckboxChange = (id) => {
        setSelectedItems((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((itemId) => itemId !== id)
                : [...prevSelected, id]
        );
    };

    const handleSelectAllChange = () => {
        if (selectedItems.length === salesman.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(salesman.map((emp) => emp.id));
        }
    };

    const navigateToCreateMerk = () => {
        navigate('/warehouse/salesman/new');
    }

    const navigateToDetailMerk = (id) => {
        navigate(`/warehouse/salesman/${id}`);
    }

    const columns = [
        { header: "Kode Sales", accessor: "code" },
        { header: "Nama Sales", accessor: "name" },
        { header: "Total Toko", accessor: "customerTotals"}
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
                    tooltipLabel="Tambah Merek"
                    icon={<Plus size={18} />}
                    onclick={navigateToCreateMerk}
                    background='#0d82ff'
                    color='white'
                />
            </div>

            <Table
                columns={columns}
                data={salesman}
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

export default Salesman;
