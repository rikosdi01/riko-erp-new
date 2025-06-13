import { createContext, useContext, useEffect, useState } from 'react';
import RackWarehouseRepository from '../../repository/warehouse/RackWarehouseRepository';

const RackContext = createContext();

export const RackProvider = ({ children }) => {
    const [racks, setRacks] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Tambahkan state loading

    useEffect(() => {
        const unsubscribe = RackWarehouseRepository.getRacks((fetchedRacks) => {
            setRacks(fetchedRacks);
            setIsLoading(false); // Set loading false setelah data diambil
        });

        return () => unsubscribe();
    }, []);

    return (
        <RackContext.Provider value={{ racks, isLoading }}>
            {children}
        </RackContext.Provider>
    );
};

export const useRacks = () => useContext(RackContext);