import React from 'react';
import Input from './Input';
import Step from './Step';
import Description from './Description';
import ErrorMessage from './ErrorMessage';
import { evaluate } from '../solve';
import type { Step as StepType } from '../solve';
import '../styles/Solver.css';

const Solver = () => {
  const [expression, setExpression] = React.useState('');
  const [steps, setSteps] = React.useState<StepType[] | null>(null)
  const [error, setError] = React.useState<Error | null>(null);

  const updateState = (text: string) => {
    setExpression(text);
    const evaluateResult = evaluate(text);
    if (evaluateResult instanceof Error) {
      setSteps(null);
      setError(evaluateResult);
    } else {
      setSteps(evaluateResult);
      setError(null);
    };
  }

  // Call once at start to sync expression, steps, error.
  React.useEffect(() => {
    updateState('1-2+-(4/2-1.5)^-3*2');
  }, [])

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const text = event.target.value;
    updateState(text);
  };

  const getDescriptions = () => {
    if (steps !== null && steps.length > 1) {
      return steps.slice(1).map((step, i) => (
        <Description
          key={i}
          description={step.description}
          index={i}
        />
      ));
    } else {
      return null;
    }
  }

  const getSteps = () => {
    if (steps !== null && steps.length === 0) {
      return null;
    } else if (steps !== null && steps.length > 0) {
      return (
        <>
          <Step
            key={0}
            initial={true}
            step={steps[0]}
            index={0}
            />
          {steps.slice(1).map((step, i) => (
            <Step
              key={i+1}
              step={step}
              index={i+1}
            />
          ))}
       </>
      );
    } else {
      return null;
    }
  }
  return (
    <div className='solver'>
      <div className = 'solver-left'>
        <Input
          value={expression}
          onChange={onInputChange}
        />
        {getDescriptions()}
      </div>
      <div className = 'solver-right'>
        {getSteps()}
      </div>
      <ErrorMessage error={error} />
    </div>
  );
};

export default Solver;
