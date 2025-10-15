// components/MarketSelector.js
'use client';

export default function MarketSelector({ markets, selected, onChange, leadLanguage, onLeadLanguageChange }) {
  const toggleMarket = (marketCode) => {
    const newSelected = selected.includes(marketCode)
      ? selected.filter(c => c !== marketCode)
      : [...selected, marketCode];
    onChange(newSelected);
  };

  const setLeadLanguage = (marketCode) => {
    // If this market isn't selected, select it first
    if (!selected.includes(marketCode)) {
      toggleMarket(marketCode);
    }
    onLeadLanguageChange(marketCode);
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
          <p className="text-gray-600">Choose which languages/regions to include and set your lead language</p>
        </div>

        <button
          onClick={toggleAll}
          className="px-4 py-2 text-sm font-medium text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50 transition-colors"
        >
          {selected.length === markets.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {leadLanguage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span className="text-sm font-medium text-blue-900">
              Lead Language: {markets.find(m => m.code === leadLanguage)?.name || leadLanguage}
            </span>
            <span className="text-xs text-blue-700 ml-2">
              (Will appear first in Excel)
            </span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {Object.entries(groupedMarkets).map(([region, regionMarkets]) => (
          <div key={region} className="mb-6 last:mb-0">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              {region}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {regionMarkets.map(market => {
                const isSelected = selected.includes(market.code);
                const isLeadLanguage = leadLanguage === market.code;

                return (
                  <div
                    key={market.code}
                    className={`
                      p-3 rounded-md border transition-all
                      ${isSelected
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300 bg-white'
                      }
                      ${isLeadLanguage ? 'ring-2 ring-blue-400' : ''}
                    `}
                  >
                    <div className="flex items-center">
                      <div
                        onClick={() => toggleMarket(market.code)}
                        className="cursor-pointer flex items-center flex-1 min-w-0"
                      >
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

                      {/* Lead language radio button */}
                      {isSelected && (
                        <button
                          onClick={() => setLeadLanguage(market.code)}
                          className={`
                            flex-shrink-0 ml-2 w-5 h-5 rounded-full border-2 flex items-center justify-center
                            ${isLeadLanguage
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-gray-400 bg-white hover:border-blue-400'
                            }
                          `}
                          title="Set as lead language"
                        >
                          {isLeadLanguage && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </button>
                      )}
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
