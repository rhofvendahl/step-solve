import React from 'react';
import Item, { colors } from './Item';
import '../styles/Description.css';

type DescriptionProps = {
  description: string,
  index: number
}

const Description = ({ description, index }: DescriptionProps) => {
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

export default Description;
