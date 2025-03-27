
import ActionButton from '../../button/actionbutton/ActionButton';
import './ConfirmationModal.css'
import React from "react";

const ConfirmationModal = ({ isOpen, onClose, onclick, title }) => {
    if (!isOpen) return null; // Jika modal tidak terbuka, jangan render apapun

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className='modal-title'>Apakah Anda yakin ingin menghapus {title} ini?</div>
                <div className='modal-subtitle'>Data yang dihapus tidak dapat dikembalikan lagi!</div>
                <div className='modal-actions'>
                    <ActionButton
                        type="button"
                        title="Batal"
                        onclick={onClose}
                        background="rgb(227, 208, 84)"
                        color="#9C5700"
                        padding='10px 30px'
                    />
                    <ActionButton
                        type="button"
                        title="Hapus"
                        onclick={() => {
                            onclick();
                            onClose();
                        }}
                        background="#F44336"
                        padding='10px 30px'
                    />
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;