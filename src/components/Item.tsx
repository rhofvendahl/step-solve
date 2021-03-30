import React from 'react';
import '../styles/Item.css';

type ItemProps = {
  content: React.ReactNode
}
const Item = ({ content }: ItemProps) => {
  return (
    <>
      {content}
    </>
  );
};

export default Item;
