import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./DatePicker.css";
import { CalendarDays } from "lucide-react";
import React from "react";

const DatePickerStatistic = ({ startDate, setStartDate, endDate, setEndDate }) => {
    const CustomInput = ({ value, onClick }) => (
        <button className="custom-date-input" onClick={onClick}>
            <CalendarDays size={16} />
            {value || "Pilih Tanggal"}
        </button>
    );

    return (
        <div className="date-filter">
            <label>Filter Tanggal:</label>
            <DatePicker
                selected={startDate}
                onChange={setStartDate}
                placeholderText="Dari Tanggal"
                dateFormat="dd/MM/yyyy"
                customInput={<CustomInput />}
            />
            -
            <DatePicker
                selected={endDate}
                onChange={setEndDate}
                placeholderText="Sampai Tanggal"
                dateFormat="dd/MM/yyyy"
                customInput={<CustomInput />}
            />

        </div>
    );
};

export default DatePickerStatistic;
