import React from 'react';
import Item from './Item';
import { formatTokens } from '../solve';
import type { Token, Step } from '../solve';
import '../styles/StepItem.css';

type StepItemProps = {
  initial?: boolean,
  step: Step
}
const StepItem = ({ initial=false, step }: StepItemProps) => {
  const getContent = () => {
    return (
      <div className={initial ? 'item item-step item-step-initial' : 'item item-step item-step-next'}>
        {formatTokens(step.tokens)}
      </div>
    );
  };
  return (
    <Item content={getContent()} />
  );
};

export default StepItem;
