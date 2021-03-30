import React from 'react';
import Item from './Item';
import '../styles/DescriptionItem.css';

type DescriptionItemProps = {
  description: string
}

const DescriptionItem = ({ description }: DescriptionItemProps) => {
  const getContent = () => {
    return (
      <div className="item item-description">
        {description}
      </div>
    );
  };
  return (
    <Item content={getContent()} />
  );
};

export default DescriptionItem;
