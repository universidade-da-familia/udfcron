import { Router } from 'express';

import api from '../services/api';
import apiIntelipost from '../services/apiIntelipost';

import { IntelipostShipmentOrder } from '../types/intelipost';

const trackingCodeRouter = Router();

trackingCodeRouter.post('/', async (request, response) => {
  const { nfe_access_key, tray_order_id } = request.body;

  const responseAuth = await api.post('/auth', {
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    code: process.env.CONSUMER_CODE,
  });

  const auth = responseAuth.data;

  const response_intelipost = await apiIntelipost.get<IntelipostShipmentOrder>(
    `/shipment_order/invoice_key/${nfe_access_key}`,
  );

  if (response_intelipost.data.content.length > 0) {
    const {
      shipped_date_iso,
      tracking_code,
    } = response_intelipost.data.content[0].shipment_order_volume_array[0];

    const sending_date = shipped_date_iso.split('T')[0];

    await api.put(
      `/orders/${tray_order_id}?access_token=${auth.access_token}`,
      {
        Order: {
          status: 'ENVIADO',
          sending_code: tracking_code || '',
          sending_date: sending_date || '',
        },
      },
    );

    return response.status(204).send();
  }

  return response.status(500).send();
});

export default trackingCodeRouter;
