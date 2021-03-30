import React from 'react';
import '../styles/ErrorMessage.css';

type ErrorMessageProps = {
  error: Error | null,
}

const ErrorMessage = ({ error }: ErrorMessageProps) => {
  const softenMessage = (message: string) => {
    let newMessage = message;
    if (newMessage.split('Internal Error').length > 1) {
      return newMessage;
    } else {
      newMessage = newMessage.split('User Error: ').join('');
      newMessage = newMessage.toLowerCase();
      if (newMessage.charAt(newMessage.length-1) === '.') {
        newMessage = newMessage.slice(0, newMessage.length-1);
      }
      return newMessage;
    }
  }
  if (error === null) {
    return null;
  } else {
    return (
      <div className='error'>
        {softenMessage(error.message)}
      </div>
    );
  }
};

export default ErrorMessage;
