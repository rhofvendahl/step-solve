import React from 'react';
import Item, { colors } from './Item';
import '../styles/DescriptionItem.css';

type DescriptionItemProps = {
  description: string,
  index: number
}

const DescriptionItem = ({ description, index }: DescriptionItemProps) => {
  const descriptionColor = colors[(index) % colors.length];
  const getContent = (): React.ReactNode => {
    return (
      <div className="item description" style={{color: descriptionColor}}>
        {description}
      </div>
    );
  };
  return (
    <Item content={getContent()} />
  );
};

export default DescriptionItem;
