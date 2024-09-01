import React from 'react';
import Select from 'react-select';

const options = [
  {
    value: 'option1',
    label: 'Option 1',
    image: 'url_to_image1',
  },
  {
    value: 'option2',
    label: 'Option 2',
    image: 'url_to_image2',
  },
  // Add more options as needed
];

const CustomDropdown = ({ onChange, value }) => {
  return (
    <Select
      options={options}
      onChange={onChange}
      value={options.find(option => option.value === value)}
      isSearchable={false} // Disable search if you want
      components={{
        Option: CustomOption,
      }}
    />
  );
};

const CustomOption = ({ innerProps, label, data }) => (
  <div {...innerProps}>
    <img src={data.image} alt={label} style={{ marginRight: '8px', width: '20px', height: '20px' }} />
    {label}
  </div>
);

export default CustomDropdown;