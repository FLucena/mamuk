"use client"
import React, { useState } from 'react';
import CustomDropdown from '../components/CustomDropdown';

const YourPage = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleDropdownChange = (selectedOption) => {
    setSelectedOption(selectedOption.value);
  };

  return (
    <div>
      <h1>Your Page</h1>
      <CustomDropdown value={selectedOption} onChange={handleDropdownChange} />
    </div>
  );
};

export default YourPage;
