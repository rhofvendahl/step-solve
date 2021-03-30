import React from 'react';
import '../styles/Input.css';

type InputProps = {
  value: string,
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const Input = ({ value, onChange }: InputProps) => {
  return (
    <div className='input'>
      <input
        type='text'
        value={value}
        onChange={(event: React.ChangeEvent<HTMLInputElement>): void => onChange(event)}
      />
    </div>
  );
};

export default Input;
