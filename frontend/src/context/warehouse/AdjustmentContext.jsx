import { createContext, useContext, useEffect, useState } from 'react';
import AdjustmentRepository from '../../repository/warehouse/AdjustmentRepository';

const AdjustmentContext = createContext();

export const AdjustmentProvider = ({ children }) => {
    const [adjustment, setAdjustment] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Tambahkan state loading

    useEffect(() => {
        const unsubscribe = AdjustmentRepository.getAdj((fetchedAdjustment) => {
            setAdjustment(fetchedAdjustment);
            setIsLoading(false); // Set loading false setelah data diambil
        });

        return () => unsubscribe();
    }, []);

    return (
        <AdjustmentContext.Provider value={{ adjustment, isLoading }}>
            {children}
        </AdjustmentContext.Provider>
    );
};

export const useAdjustment = () => useContext(AdjustmentContext);