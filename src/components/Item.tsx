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

const colors = [
  '#CC0B00',
  '#E69138',
  '#F1C231',
  '#6AA850',
  '#3D85C6',
  '#674FA7'
];

export { colors };
export default Item;
