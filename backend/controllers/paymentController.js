// controllers/paymentController.js
import { createOrder, captureOrder } from "../services/paypalService.js";

export const initiatePayment = async (req, res) => {
  try {
    const { amount, ticket_ids } = req.body;

    if (!amount || !ticket_ids || !Array.isArray(ticket_ids)) {
      return res.status(400).json({ error: "Amount e ticket_ids sono obbligatori" });
    }

    const order = await createOrder(amount, ticket_ids);

    res.json({
      success: true,
      orderID: order.id,
      approvalUrl: order.links.find(link => link.rel === 'approve').href
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const finalizePayment = async (req, res) => {
  try {
    const { orderID } = req.body;

    if (!orderID) {
      return res.status(400).json({ error: "OrderID è obbligatorio" });
    }

    const captureData = await captureOrder(orderID);

    if (captureData.status === 'COMPLETED') {
      res.json({ 
        success: true, 
        message: "Pagamento completato con successo",
        captureData 
      });
    } else {
      res.status(400).json({ error: "Pagamento non completato" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};