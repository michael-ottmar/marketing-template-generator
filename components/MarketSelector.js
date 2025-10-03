// components/MarketSelector.js
'use client';

export default function MarketSelector({ markets, selected, onChange }) {
  const toggleMarket = (marketCode) => {
    const newSelected = selected.includes(marketCode)
      ? selected.filter(c => c !== marketCode)
      : [...selected, marketCode];
    onChange(newSelected);
  };

  const toggleAll = () => {
    if (selected.length === markets.length) {
      onChange([]);
    } else {
      onChange(markets.map(m => m.code));
    }
  };

  // Group markets by region
  const groupedMarkets = markets.reduce((acc, market) => {
    if (!acc[market.region]) {
      acc[market.region] = [];
    }
    acc[market.region].push(market);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Select Markets</h2>
          <p className="text-gray-600">Choose which languages/regions to include</p>
        </div>
        
        <button
          onClick={toggleAll}
          className="px-4 py-2 text-sm font-medium text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50 transition-colors"
        >
          {selected.length === markets.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {Object.entries(groupedMarkets).map(([region, regionMarkets]) => (
          <div key={region} className="mb-6 last:mb-0">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              {region}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {regionMarkets.map(market => {
                const isSelected = selected.includes(market.code);
                
                return (
                  <div
                    key={market.code}
                    onClick={() => toggleMarket(market.code)}
                    className={`
                      p-3 rounded-md border cursor-pointer transition-all
                      ${isSelected 
                        ? 'border-primary-600 bg-primary-50' 
                        : 'border-gray-200 hover:border-primary-300 bg-white'
                      }
                    `}
                  >
                    <div className="flex items-center">
                      <div className={`
                        flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mr-3
                        ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300'}
                      `}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {market.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {market.code}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          {selected.length} market{selected.length !== 1 ? 's' : ''} selected
        </span>
      </div>
    </div>
  );
}
