import React from 'react';
import InputItem from './InputItem';
import StepItem from './StepItem';
import DescriptionItem from './DescriptionItem';
import {
  evaluate,
  formatTokens
} from '../solve';
import type {
  // Token,
  Step
} from '../solve';
import '../styles/Solver.css';

const Solver = () => {
  const [expression, setExpression] = React.useState('');
  const [steps, setSteps] = React.useState<Step[] | null>(null)
  const [error, setError] = React.useState<Error | null>(null);

  const updateState = (text: string) => {
    setExpression(text);
    const evaluateResult = evaluate(text);
    if (evaluateResult instanceof Error) {
      console.log(evaluateResult.message);
      setSteps(null);
      setError(evaluateResult);
    } else {
      evaluateResult.forEach((step) => {
        console.log(formatTokens(step.tokens));
      });
      setSteps(evaluateResult);
      setError(null);
    };
  }

  React.useEffect(() => {
    updateState('');
  }, [])

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const text = event.target.value;
    updateState(text);
  };

  const getDescriptions = () => {
    if (steps !== null && steps.length > 1) {
      return steps.slice(1).map((step, i) => (
        <DescriptionItem
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
          <StepItem
            key={0}
            initial={true}
            step={steps[0]}
            index={0}
            />
          {steps.slice(1).map((step, i) => (
            <StepItem
              key={i+1}
              step={step}
              index={i+1}
            />
          ))}
       </>
      );
    } else {
      return null;
      // if (error !== null) {
      //   return (
      //     <ErrorItem
      //       error={error}
      //     />
      //   );  
      // } else {
      //   return (
      //     <ErrorItem
      //       error={new Error('Internal Error: Evaluation not available.')}
      //     />
      //   );
      // }
    }
  }
  const getError = () => {
    if (error === null) {
      return null;
    } else {
      return (
        <div className='error'>{error.message}</div>
      )
    }
  };
  return (
    <div className='solver'>
      <div className = 'solver-left'>
        <InputItem
          value={expression}
          onChange={onInputChange}
        />
        {getDescriptions()}
      </div>
      {/* <div className='solver-middle' /> */}
      <div className = 'solver-right'>
        {getSteps()}
      </div>
      {getError()}
    </div>
  );
};

export default Solver;
