// services/paymentService.js

// Servizio di pagamento simulato per testing
export const createOrder = async (amount, ticket_ids) => {
  console.log(`🎯 Pagamento simulato - Creazione ordine per €${amount}`);
  
  return {
    id: `SIMULATED_ORDER_${Date.now()}`,
    status: 'CREATED',
    links: [
      {
        rel: 'approve',
        href: `${process.env.FRONTEND_URL}/payment-success?orderId=SIMULATED_ORDER_${Date.now()}&ticketIds=${ticket_ids.join(',')}`
      }
    ]
  };
};

export const captureOrder = async (orderID) => {
  console.log(`✅ Pagamento simulato - Pagamento confermato: ${orderID}`);
  
  return {
    id: orderID,
    status: 'COMPLETED',
    purchase_units: [{
      payments: {
        captures: [{
          id: `SIMULATED_PAYMENT_${Date.now()}`,
          status: 'COMPLETED',
          amount: {
            currency_code: 'EUR',
            value: '10.00'
          }
        }]
      }
    }]
  };
};