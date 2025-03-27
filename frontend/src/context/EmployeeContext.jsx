import { createContext, useContext, useEffect, useState } from 'react';
import EmployeeRepository from '../repository/EmployeeRepository';
import React from "react";

const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
    const [employee, setEmployee] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Tambahkan state loading

    console.log(employee);

    useEffect(() => {
        const unsubscribe = EmployeeRepository.getEmployee((fetchedEmployee) => {
            setEmployee(fetchedEmployee);
            setIsLoading(false); // Set loading false setelah data diambil
        });

        return () => unsubscribe();
    }, []);

    return (
        <EmployeeContext.Provider value={{ employee, isLoading }}>
            {children}
        </EmployeeContext.Provider>
    );
};

export const useEmployee = () => useContext(EmployeeContext);