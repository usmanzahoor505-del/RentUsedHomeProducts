import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userName, setUserName] = useState('Usman Zahoor');
  const [userEmail, setUserEmail] = useState('usmanzahoor50512@gmail.com');
  const [userPhone, setUserPhone] = useState('03141595442');
  const [userCnic, setUserCnic] = useState('');
  const [userCity, setUserCity] = useState('Rawalpindi');
  const [userRole, setUserRole] = useState('Customer'); // 'Customer' or 'Courier'
  const [vehicleType, setVehicleType] = useState('Motorcycle');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(14);

  return (
    <UserContext.Provider
      value={{
        userName,
        setUserName,
        userEmail,
        setUserEmail,
        userPhone,
        setUserPhone,
        userCnic,
        setUserCnic,
        userCity,
        setUserCity,
        userRole,
        setUserRole,
        vehicleType,
        setVehicleType,
        vehiclePlate,
        setVehiclePlate,
        isOnline,
        setIsOnline,
        isLoggedIn,
        setIsLoggedIn,
        token,
        setToken,
        userId,
        setUserId,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
