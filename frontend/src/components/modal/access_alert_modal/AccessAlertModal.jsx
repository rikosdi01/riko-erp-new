import { useEffect } from 'react';
import './AccessAlertModal.css';

const AccessAlertModal = ({
  isOpen,
  onClose,
  title = "Kamu tidak memiliki akses!",
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose(); // auto-close setelah 2.5 detik
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="access-alert-backdrop">
      <div className="access-alert-modal">
        <button className="access-alert-close" onClick={onClose}>×</button>
        <h2 className="access-alert-title">⚠️ {title}</h2>
      </div>
    </div>
  );
};

export default AccessAlertModal;
