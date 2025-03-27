import React, { useState, useEffect, useCallback } from 'react';
import './toastnotification.css';
import { Check, TriangleAlert, X } from 'lucide-react';

function ToastNotification({ variant = 'berhasil', message, duration = 5000, onClose }) {
    const [isActive, setIsActive] = useState(false);
    const [icon, setIcon] = useState(<Check />);
    const [color, setColor] = useState('green');

    useEffect(() => {
      let enterTimer = setTimeout(() => {
        setIsActive(true); // Aktifkan animasi setelah delay pendek
      }, 10); // Delay 100ms agar animasi masuk terlihat
      
      switch (variant) {
        case 'peringatan':
          setIcon(<TriangleAlert />);
          setColor('orange');
          break;
        case 'gagal':
          setIcon(<X />);
          setColor('red');
          break;
        default:
          setIcon(<Check />);
          setColor('green');
      }

      return () => clearTimeout(enterTimer);
    }, [variant]);

    useEffect(() => {
      if (isActive) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);

        return () => clearTimeout(timer);
      }
    }, [isActive, duration]);

    const handleClose = useCallback(() => {
      setIsActive(false);
      setTimeout(onClose, 2000); // Sesuaikan dengan durasi animasi CSS
    }, [onClose]);

    return (
      <div 
        className={`toastContainer ${isActive ? 'active' : ''}`}
        style={{ '--mainColor': color }}
      >
        <div className="icon" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <div className="message">
          <span className="head">
            {variant?.charAt(0).toUpperCase() + variant?.slice(1)}
          </span>
          <span className="saved">{message}</span>
        </div>
        <button onClick={handleClose} className="closeBtn">
          <X size={18} />
        </button>
      </div>
    );
}

export default ToastNotification;
