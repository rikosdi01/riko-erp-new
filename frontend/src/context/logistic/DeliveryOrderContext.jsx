import { createContext, useContext, useEffect, useState } from 'react';
import React from "react";
import DeliveryOrderRepository from '../../repository/logistic/DeliveryOrderRepository';

const DeliveryOrderContext = createContext();

export const DeliveryOrderProvider = ({ children }) => {
    const [deliveryOrder, setDeliveryOrder] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Tambahkan state loading

    useEffect(() => {
        const unsubscribe = DeliveryOrderRepository.getDeliveryOrder((fetchedDeliveryOrder) => {
            setDeliveryOrder(fetchedDeliveryOrder);
            setIsLoading(false); // Set loading false setelah data diambil
        });

        return () => unsubscribe();
    }, []);

    return (
        <DeliveryOrderContext.Provider value={{ deliveryOrder, isLoading }}>
            {children}
        </DeliveryOrderContext.Provider>
    );
};

export const useDeliveryOrder = () => useContext(DeliveryOrderContext);