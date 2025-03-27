import { useState } from "react";
import ActionButton from "../button/actionbutton/ActionButton";
import ConfirmationModal from "../modal/confirmation_modal/ConfirmationModal";
import { Edit, Trash2 } from "lucide-react";
import './Table.css'
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
}) => {
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    console.log(data);


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
                            <th key={index}>{col.header}</th>
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
                        data.length > 0 ? (
                            data.map((item) => (
                                <tr key={item.id} onClick={() => onclick(item.id)}>
                                    {enableCheckbox && (
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(item.id)}
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Seharusnya mencegah event onClick <tr>
                                                }}
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

            {selectedItems.length > 0 && (
                <div className="selected-employee">
                    <p>{selectedItems.length} {title} dipilih</p>
                    <div className='selected-button-employee'>
                        {/* <ActionButton
                            icon={<Edit size={16} />}
                            title="Ubah Status"
                            background="rgb(227, 208, 84)"
                            color="#9C5700"
                            padding=" 10px 18px"
                            fontSize='14px'
                        /> */}
                        <ActionButton
                            icon={<Trash2 size={16} />}
                            title="Hapus"
                            background="rgb(255, 35, 35)"
                            color="#fff"
                            padding=" 10px 18px"
                            fontSize='14px'
                            onclick={() => setIsModalOpen(true)}
                        />
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Hapus */}
            <div>
                <ConfirmationModal
                    title={title}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onclick={handleDeleteItems}
                />
            </div>
        </div>
    );
};

export default Table;
