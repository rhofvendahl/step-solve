import React from 'react';
import Item from './Item';
import '../styles/InputItem.css';

type InputItemProps = {
  value: string,
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const InputItem = ({ value, onChange }: InputItemProps) => {
  const getContent = () => {
    return (
      <div className='item-input'>
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

export default InputItem;
