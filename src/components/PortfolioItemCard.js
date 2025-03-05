import React from 'react';

function PortfolioItemCard({ asset, onRemove }) {
  return (
    <div className="p-3 border rounded-md">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold">{asset.ticker}</h3>
          <p className="text-sm text-gray-600">{asset.name}</p>
        </div>
        <button 
          className="text-red-500 hover:text-red-700"
          onClick={() => onRemove(asset.ticker)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <div className="mt-2 flex justify-between">
        <p className="text-sm">
          {asset.quantity} × R$ {asset.price.toFixed(2)}
        </p>
        <p className="text-sm font-bold">
          R$ {(asset.quantity * asset.price).toFixed(2)}
        </p>
      </div>
      <div className="mt-2 flex items-center">
        <div className="flex-1 mr-2 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${asset.type === 'stock' ? 'bg-blue-500' : 'bg-green-500'}`}
            style={{ width: `${asset.percentage || 0}%` }}
          ></div>
        </div>
        <p className="text-xs font-bold min-w-[40px] text-right">
          {(asset.percentage || 0).toFixed(1)}%
        </p>
      </div>
    </div>
  );
}

export default PortfolioItemCard;