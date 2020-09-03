import { Router } from 'express';

import api from '../services/api';

const trackingCodeRouter = Router();

trackingCodeRouter.post('/', async (request, response) => {
  try {
    const { ship_date, tray_order_id } = request.body;

    console.log(`🚀 Ship date: ${ship_date} / Tray: ${tray_order_id}.`);

    const responseAuth = await api.post('/auth', {
      consumer_key: process.env.CONSUMER_KEY,
      consumer_secret: process.env.CONSUMER_SECRET,
      code: process.env.CONSUMER_CODE,
    });

    const auth = responseAuth.data;

    const sending_date = ship_date.split('T')[0];

    console.log(`🚀 Sending date: ${sending_date}`);

    const responseTray = await api.get(
      `/orders/${tray_order_id}?access_token=${auth.access_token}`,
    );

    const { status } = responseTray.data.Order;

    if (status === 'AGUARDANDO ENVIO') {
      await api.put(
        `/orders/${tray_order_id}?access_token=${auth.access_token}`,
        {
          Order: {
            status: 'ENVIADO',
            sending_date: sending_date || '',
          },
        },
      );
      console.log('🚀 Pedido atualizado na tray com sucesso.');

      return response.status(204).send();
    }

    console.log(`🚀 Pedido não atualizado na tray. STATUS PEDIDO: ${status}`);

    return response.status(304).send();
  } catch (err) {
    console.log('🚀 Houve uma falha ao atualizar o pedido.');

    return response.status(err.status).send(err.message);
  }
});

export default trackingCodeRouter;
