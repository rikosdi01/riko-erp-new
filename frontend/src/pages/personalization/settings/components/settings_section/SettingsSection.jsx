import { ChevronRight, RefreshCcw } from 'lucide-react';
import './SettingsSection.css';
import { useEffect, useRef, useState } from 'react';
import ActionButton from '../../../../../components/button/actionbutton/ActionButton';
import SettingsRepository from '../../../../../repository/SettingsRepository';
import { useToast } from '../../../../../context/ToastContext';
import Formatting from '../../../../../utils/format/Formatting';
import React from "react";

const SettingsSection = ({ title, value, set, isDisabled, settingKey }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [values, setValues] = useState(value);
    const initialValue = useRef(value); // Gunakan ini hanya untuk referensi
    const { showToast } = useToast();

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (value !== undefined) {
            setValues(value);
        }
    }, [value]);

    const handleOpenModal = () => {
        initialValue.current = value; // Simpan nilai awal saat modal dibuka
        setValues(value); // Reset input ke nilai terbaru dari parent
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // Bandingkan dengan nilai saat modal pertama kali dibuka
    const isValueChanged = values !== initialValue.current;


    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        setLoading(true);

        const valueFloat = typeof values === "string" ? parseFloat(values) || 0 : values;

        try {
            const settings = {
                [settingKey]: valueFloat,
            };

            await SettingsRepository.updateSetting(settings);

            showToast("berhasil", "Pengaturan berhasil diperbarui!");
        } catch (err) {
            console.error('Gagal memperbarui Pengaturan: ', err);
            showToast("gagal", "Pengaturan gagal diperbarui!");
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <div className="settings-section" onClick={handleOpenModal}>
                <div className="settings-content">
                    <div className="settings-label">{title}:</div>
                    <div className="settings-value">{set ? `${value}${set}` : Formatting.formatCurrencyIDR(value)}</div>
                </div>
                <div className="settings-icon">
                    <ChevronRight size={16} />
                </div>
            </div>

            {isModalOpen && (
                <div className="settings-modal" onClick={handleCloseModal}>
                    <div className="settings-modal-container" onClick={(e) => e.stopPropagation()}>
                        <button className="close-button" onClick={handleCloseModal}>✖</button>
                        <div className='settings-subtitle'>Edit Simpanan dan Pinjaman:</div>
                        <div className='settings-modal-content'>
                            <div style={{ fontWeight: "500" }}>{title}:</div>
                            {set ? (
                                <input
                                    type="text"
                                    value={values}
                                    onChange={(e) => {
                                        setValues(e.target.value)
                                    }}
                                    className='settings-input-text'
                                    disabled={isDisabled}
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={Formatting.formatCurrencyIDR(values || 0)}
                                    onChange={(e) => {
                                        const rawValue = e.target.value.replace(/\D/g, ""); // Hanya angka
                                        const parsedValue = rawValue ? parseInt(rawValue, 10) : 0;
                                        setValues(parsedValue);
                                    }}
                                    
                                    className='settings-input-text'
                                    disabled={isDisabled}
                                />
                            )}
                            <div>{set}</div>
                        </div>

                        <div className='settings-modal-button'>
                            <ActionButton
                                icon={<RefreshCcw size={18} />}
                                title={loading ? "Memperbarui..." : "Perbarui"}
                                disabled={!isValueChanged || loading}
                                onclick={handleUpdateSettings} // Pastikan ini dipanggil
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SettingsSection;
