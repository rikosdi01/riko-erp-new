import { createContext, useContext, useEffect, useState } from 'react';
import ReturnOrderRepository from '../../repository/sales/ReturnOrderRepository';

const ReturnContext = createContext();

export const ReturnProvider = ({ children }) => {
    const [returnOrder, setReturnOrder] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Tambahkan state loading

    useEffect(() => {
        const unsubscribe = ReturnOrderRepository.getReturnOrder((fetchedReturn) => {
            setReturnOrder(fetchedReturn);
            setIsLoading(false); // Set loading false setelah data diambil
        });

        return () => unsubscribe();
    }, []);

    return (
        <ReturnContext.Provider value={{ returnOrder, isLoading }}>
            {children}
        </ReturnContext.Provider>
    );
};

export const useReturnOrder = () => useContext(ReturnContext);