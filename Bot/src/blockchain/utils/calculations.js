export function calculateLeverage(ltv) {
    if (ltv >= 100) return Infinity;
    return 1 / (1 - ltv / 100);
  }
  
  export function calculateLTV(leverage) {
    if (leverage <= 1) return 0;
    return ((leverage - 1) / leverage) * 100;
  }
  
  export function calculateHealthFactor(collateral, debt, liquidationThreshold) {
    if (debt === 0 || debt === '0') return Infinity;
    const collateralNum = Number(collateral);
    const debtNum = Number(debt);
    const thresholdNum = Number(liquidationThreshold) / 100;
    
    return (collateralNum * thresholdNum) / debtNum;
  }
  
  export function calculateMaxBorrow(collateral, ltv) {
    return (Number(collateral) * Number(ltv)) / 100;
  }
  
  export function calculateEffectiveLeverage(collateral, debt) {
    const collateralNum = Number(collateral);
    const debtNum = Number(debt);
    
    if (debtNum === 0) return 1;
    return collateralNum / (collateralNum - debtNum);
  }
  
  export function calculatePnL(initialValue, currentValue) {
    const initial = Number(initialValue);
    const current = Number(currentValue);
    
    if (initial === 0) return { absolute: 0, percentage: 0, isProfit: true };
    
    const change = current - initial;
    const changePercent = (change / initial) * 100;
    
    return {
      absolute: change,
      percentage: changePercent,
      isProfit: change >= 0
    };
  }