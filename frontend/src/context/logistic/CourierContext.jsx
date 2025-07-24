import { createContext, useContext, useEffect, useState } from 'react';
import CourierRepository from '../../repository/logistic/CourierRepository';

const CourierContext = createContext();

export const CourierProvider = ({ children }) => {
    const [couriers, setCouriers] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Tambahkan state loading

    useEffect(() => {
        const unsubscribe = CourierRepository.getCourier((fetchedCourier) => {
            setCouriers(fetchedCourier);
            setIsLoading(false); // Set loading false setelah data diambil
        });

        return () => unsubsc/ribe();
    }, []);

    return (
        <CourierContext.Provider value={{ couriers, isLoading }}>
            {children}
        </CourierContext.Provider>
    );
};

export const useCourier = () => useContext(CourierContext);