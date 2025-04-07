import { useState } from "react";
import ActionButton from "../button/actionbutton/ActionButton";
import ConfirmationModal from "../modal/confirmation_modal/ConfirmationModal";
import { Edit, Trash2, Filter } from "lucide-react"; // Import ikon Filter
import "./Table.css";
import React from "react";

const Table = ({
    columns,
    data,
    isLoading,
    selectedItems,
    onCheckboxChange,
    onSelectAllChange,
    handleDeleteItems,
    title,
    enableCheckbox = true,
    onclick,
    onFilterClick, // Tambahkan fungsi untuk menangani filter
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = data.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className='table-wrapper'>
            <table>
                <thead>
                    <tr>
                        {enableCheckbox && (
                            <th style={{ width: "50px", textAlign: "center" }}>
                                <input
                                    type="checkbox"
                                    checked={selectedItems.length === data.length}
                                    onChange={onSelectAllChange}
                                />
                            </th>
                        )}
                        {columns.map((col, index) => (
                            <th key={index}>
                                <div className="table-header">
                                    {col.header}
                                    <button
                                        className="filter-btn"
                                        onClick={() => onFilterClick(col.accessor)}
                                    >
                                        <Filter size={16} />
                                    </button>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '10px' }}>
                                Sedang memuat...
                            </td>
                        </tr>
                    ) : (
                        currentData.length > 0 ? (
                            currentData.map((item) => (
                                <tr key={item.id} onClick={() => onclick(item.id)}>
                                    {enableCheckbox && (
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(item.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    onCheckboxChange(item.id);
                                                }}
                                            />
                                        </td>
                                    )}
                                    {columns.map((col) => (
                                        <td key={`${item.id}-${col.accessor}`}>
                                            {col.renderCell
                                                ? col.renderCell(
                                                    col.accessor.includes(".")
                                                        ? col.accessor.split('.').reduce((obj, key) => obj?.[key], item)
                                                        : item[col.accessor],
                                                    item
                                                )
                                                : (col.accessor.includes(".")
                                                    ? col.accessor.split('.').reduce((obj, key) => obj?.[key], item)
                                                    : item[col.accessor])}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '10px' }}>
                                    Tidak ada data
                                </td>
                            </tr>
                        )
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="pagination">
                <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                    &laquo; Prev
                </button>
                <span>Hal. {currentPage} | {totalPages}</span>
                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                    Next &raquo;
                </button>

                <div className="items-per-page">
                    <select value={itemsPerPage} onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                    }}>
                        <option value={8}>8</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <span> per halaman</span>
                </div>
            </div>

            {selectedItems.length > 0 && (
                <div className="selected-employee">
                    <p>{selectedItems.length} {title} dipilih</p>
                    <div className='selected-button-employee'>
                        <ActionButton
                            icon={<Trash2 size={16} />}
                            title="Hapus"
                            background="rgb(255, 35, 35)"
                            color="#fff"
                            padding="10px 18px"
                            fontSize='14px'
                            onclick={() => setIsModalOpen(true)}
                        />
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Hapus */}
            <ConfirmationModal
                title={title}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onclick={handleDeleteItems}
            />
        </div>
    );
};

export default Table;
