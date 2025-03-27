import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import "./Dashboard.css";
import { useEmployee } from "../../../context/EmployeeContext";
import { useSavings } from "../../../context/SavingsContext";
import React from "react";

const Dashboard = () => {
    const [chartData, setChartData] = useState([]);
    const [loanData, setLoanData] = useState([]);
    
    const { employee } = useEmployee();
    const { savings } = useSavings();

    useEffect(() => {
        if (employee.length > 0 && savings.length > 0) {
            // Gabungkan employee dengan savings berdasarkan userId
            const savingsMap = savings.reduce((acc, curr) => {
                acc[curr.userId] = (acc[curr.userId] || 0) + curr.amount;
                return acc;
            }, {});

            // Data untuk Bar Chart (Total Simpanan per Karyawan)
            const savingsData = employee.map(emp => ({
                name: emp.name,
                savings: savingsMap[emp.id] || 0, // Ambil dari savings, default 0 jika tidak ada data
            }));
            setChartData(savingsData);

            // Data untuk Pie Chart (Distribusi Dana)
            const totalSavings = Object.values(savingsMap).reduce((sum, val) => sum + val, 0);
            const totalLoans = employee.reduce((sum, emp) => sum + (emp.loanBalance || 0), 0);
            setLoanData([
                { name: "Total Simpanan", value: totalSavings },
                { name: "Total Pinjaman", value: totalLoans }
            ]);
        }
    }, [employee, savings]);

    const COLORS = ["#00C49F", "#FFBB28"];

    return (
        <div className="dashboard-container">
            <h2>Dashboard Statistik</h2>

            <div className="chart-container">
                {/* Bar Chart - Simpanan per Karyawan */}
                <div className="chart">
                    <h3>Total Simpanan per Karyawan</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="savings" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart - Distribusi Dana */}
                <div className="chart">
                    <h3>Distribusi Dana</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={loanData} cx="50%" cy="50%" outerRadius={80} fill="#82ca9d" label>
                                {loanData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
