import React from 'react';

function Card({ children, className = '', ...props }) {
  return (
    <div 
      className={`bg-white rounded-lg shadow p-4 mb-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;