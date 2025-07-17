import { createContext, useContext, useEffect, useState } from 'react';
import PersonalRepository from '../../repository/personalization/FormatRepository';

const FormatContext = createContext();

export const FormatProvider = ({ children }) => {
    const [formats, setFormats] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Tambahkan state loading

    useEffect(() => {
        const fetchFormat = async () => {
            try {
                const format = await PersonalRepository.getFormatSettingsByID();
                setFormats(format);
            } catch (error) {
                console.error("Error fetching login user/access: ", error);
            } finally {
                setIsLoading(false); // <-- Dipindah ke sini
            }
        };

        fetchFormat();
    }, []);


    return (
        <FormatContext.Provider value={{ formats, isLoading }}>
            {children}
        </FormatContext.Provider>
    );
};

export const useFormats = () => useContext(FormatContext);