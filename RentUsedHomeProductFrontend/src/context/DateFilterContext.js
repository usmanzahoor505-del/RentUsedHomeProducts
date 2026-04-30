import React, { createContext, useContext, useState } from "react";

const DateFilterContext = createContext(undefined);

export function DateFilterProvider({ children }) {
  const [startDate, setStartDate] = useState(undefined);
  const [numberOfDays, setNumberOfDays] = useState(1);

  const clearDates = () => {
    setStartDate(undefined);
    setNumberOfDays(1);
  };

  const hasDatesSelected = startDate !== undefined && numberOfDays > 0;

  const getEndDate = () => {
    if (!startDate) return undefined;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + numberOfDays - 1);
    return endDate;
  };

  return (
    <DateFilterContext.Provider
      value={{
        startDate,
        numberOfDays,
        setStartDate,
        setNumberOfDays,
        clearDates,
        hasDatesSelected,
        getEndDate,
      }}
    >
      {children}
    </DateFilterContext.Provider>
  );
}

export function useDateFilter() {
  const context = useContext(DateFilterContext);
  if (!context) {
    throw new Error("useDateFilter must be used within DateFilterProvider");
  }
  return context;
}
