const calculateTotalArea = () => {
    return items.reduce((sum, item) => sum + item.area, 0);
};

const calculateTotalUnitValue = () => {
    return items.reduce((sum, item) => sum + item.unitValue, 0);
};

const calculateTotalBaseMarketValue = () => {
    return items.reduce((sum, item) => sum + item.baseMarketValue, 0);
};

const calculateTotalMarketValue = () => {
    return items.reduce((sum, item) => sum + item.marketValue, 0);
}; 