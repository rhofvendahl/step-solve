import React from 'react';
import Item from './Item';
import '../styles/Input.css';

type InputProps = {
  value: string,
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const Input = ({ value, onChange }: InputProps) => {
  const getContent = (): React.ReactNode => {
    return (
      <div className='item input'>
        <input
          type='text'
          value={value}
          onChange={(event: React.ChangeEvent<HTMLInputElement>): void => onChange(event)}
        />
      </div>
    );
  };
  return (
    <Item content={getContent()} />
  );
};

export default Input;
