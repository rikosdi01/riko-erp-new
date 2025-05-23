import './Invoice.css';
import { Download, Plus, Upload } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { useNavigate } from "react-router-dom";
import SearchValue from '../../../../components/input/search_value/SearchValue';
import FilterValue from '../../../../components/filter/FilterValue/FilterValue';
import IconButton from '../../../../components/button/icon_button/IconButton';
import Table from '../../../../components/table/Table';
import { useState } from 'react';
import Formatting from '../../../../utils/format/Formatting';
import { useInvoice } from '../../../../context/sales/InvoiceContext';

const Invoice = () => {
    const navigate = useNavigate();
    // const { invoice, isLoading } = useInvoice();
    const [selectedItems, setSelectedItems] = useState([]);

    const invoice = [];
    const isLoading = false;

    const handleCheckboxChange = (id) => {
        setSelectedItems((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((itemId) => itemId !== id)
                : [...prevSelected, id]
        );
    };

    const handleSelectAllChange = () => {
        if (selectedItems.length === invoice.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(invoice.map((emp) => emp.id));
        }
    };

    const navigateToCreateMerk = () => {
        navigate('/logistic/invoice-order/new');
    }

    const navigateToDetailMerk = (id) => {
        navigate(`/logistic/invoice-order/${id}`);
    }

    const columns = [
        { header: "No. Faktur", accessor: "code" },
        { header: "No. Pengiriman", accessor: "noDeliveryOrder" },
        {
            header: "Tanggal",
            accessor: "createdAt",
            renderCell: (value) => Formatting.formatDate(value),
        },
        { header: "Pelanggan", accessor: "customerName" },
        { header: "Kuantitas", accessor: "totalQty" },
        {
            header: "Harga",
            accessor: "totalPrice",
            renderCell: (value) => Formatting.formatCurrencyIDR(value)
        },
        { header: "Status", accessor: "status" },
    ]

    return (
        <div className="main-container">
            <div className="main-container-header">
                <SearchValue label="faktur" />

                <FilterValue placeholder={"Semua Status"} />
            </div>

            <Table
                columns={columns}
                data={invoice}
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

export default Invoice;
