import { useNavigate } from 'react-router-dom';
import './ContentHeader.css'
import { ArrowLeft, Printer } from 'lucide-react';

const ContentHeader = ({
    title,
    enableBack = true,
    enablePrint = false,
    setShowPreview
}) => {
    const navigate = useNavigate();

    const handleBackPage = () => {
        navigate(-1);
    };

    return (
        <div className='content-header'>
            {enableBack && (
                <button className="back-page" onClick={handleBackPage}>
                    <span><ArrowLeft size={20} /></span>
                    Kembali
                </button>
            )}
            <div className='content-title'>{title}</div>

            {enablePrint && (
                <button className="print-page"
                    onClick={() => setShowPreview(true)}>
                    <span><Printer size={20} /></span>
                    Cetak
                </button>
            )}
        </div>
    )
}

export default ContentHeader;