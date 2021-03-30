import React from 'react';
import Item from './Item';
import { formatTokens } from '../solve';
import type { Token } from '../solve';
import '../styles/StepItem.css';

type StepProps = {
  initial?: boolean,
  step: Token[]
}
const Step = ({ initial=false, step }: StepProps) => {
  const getContent = () => {
    return (
      <div className={initial ? 'item item-step item-step-initial' : 'item item-step item-step-next'}>
        {formatTokens(step)}
      </div>
    );
  };
  return (
    <Item content={getContent()} />
  );
};

export default Step;
