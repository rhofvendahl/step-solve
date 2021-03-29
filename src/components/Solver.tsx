import React from 'react';
import Input from './Input';
import Step from './Step';
import Description from './Description';
import {
  // tokenizeLiteral,
  // tokenize,
  // establishNegatives,
  // resolveNegatives,
  // performMathOperation,
  // performOperation,
  evaluate,
  formatTokens
} from '../solve';
import '../styles/Solver.css';

const Solver = () => {
  const [expression, setExpression] = React.useState("");

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const text = event.target.value;
    // console.log(text);
    setExpression(text);
    const steps = evaluate(text);
    if (steps instanceof Error) {
      console.log(steps.message);
    } else {
      steps.forEach((step) => {
        console.log(formatTokens(step));
      });
    };
  };

  return (
    <div className='solver'>
      <div className = 'solver-left'>
        <Input
          value={expression}
          onChange={onInputChange}
        />
        <Description />
        <Description />
        <Description />
      </div>
      <div className='solver-middle' />
      <div className = 'solver-right'>
        <Step
          initial={true}
        />
        <Step />
        <Step />
        <Step />
      </div>
    </div>
  );
};

export default Solver;
