import React from 'react';
import Item from './Item';
// import { formatTokens } from '../solve';
// import type { Token } from '../solve';
import '../styles/ErrorItem.css';

type ErrorItemProps = {
  error: Error | null
}
const ErrorItem = ({ error }: ErrorItemProps) => {
  const getContent = (): React.ReactNode => {
    let message = '';
    if (error !== null) {
      message = error.message;
    }
    return (
      <div className="item error">
        {message}
      </div>
    );
  };
  return (
    <Item content={getContent()} />
  );
};

export default ErrorItem;
