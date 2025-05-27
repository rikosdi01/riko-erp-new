
import ActionButton from '../../button/actionbutton/ActionButton';
import './ConfirmationModal.css'

const ConfirmationModal = ({
    isOpen,
    onClose,
    onClick,
    title,
    itemDelete,
}) => {
    if (!isOpen) return null; // Jika modal tidak terbuka, jangan render apapun

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className='modal-title'>Apakah Anda yakin ingin menghapus {title} "<span className='modal-item'>{itemDelete}</span>" ini?</div>
                <div className='modal-subtitle'>Data yang dihapus tidak dapat dikembalikan lagi!</div>
                <div className='modal-actions'>
                    <ActionButton
                        type="button"
                        title="Batal"
                        onclick={onClose}
                        background="linear-gradient(to top right,rgb(226, 229, 87),rgb(238, 241, 51))"
                        color="#9C5700"
                        padding='10px 30px'
                    />
                    <ActionButton
                        type="button"
                        title="Hapus"
                        onclick={() => {
                            onClick();
                            onClose();
                        }}
                        background="linear-gradient(to top right,rgb(241, 66, 66),rgb(245, 51, 51))"
                        color="white"
                        padding='10px 30px'
                    />
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;