import React from 'react';
import { colors } from '../constants';
import '../styles/Description.css';

type DescriptionProps = {
  description: string,
  index: number
}

const Description = ({ description, index }: DescriptionProps) => {
  const descriptionColor = colors[(index) % colors.length];
  return (
    <div className='description' style={{color: descriptionColor}}>
      {description}
    </div>
  );
};

export default Description;
