const plans = {
  free: { 
    name: 'Free', 
    limit: 1, 
    price: 0,
    description: '1 application per month'
  },
  bronze: { 
    name: 'Bronze', 
    limit: 3, 
    price: 100,
    description: '3 applications per month'
  },
  silver: { 
    name: 'Silver', 
    limit: 5, 
    price: 300,
    description: '5 applications per month'
  },
  gold: { 
    name: 'Gold', 
    limit: Infinity, 
    price: 1000,
    description: 'Unlimited applications'
  }
};

module.exports = plans; 