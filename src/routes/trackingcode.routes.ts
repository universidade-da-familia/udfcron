import { Router } from 'express';

const trackingCodeRouter = Router();

trackingCodeRouter.post('/', async (request, response) => {
  const { nfe_access_key } = request.body;

  // const test_nfe_access_key = '35200766494642000100550010000971671000972676';

  // nfe_access_key chamada na intelipost to route /shipment_order/invoice_key/nfe_access_key
  // pegar o tracking_code e shipped_date_iso (split no T) da resposta
  const teste = nfe_access_key;

  // await api.put(`/orders/${order.id}?access_token=${auth.access_token}`, {
  //   Order: {
  //     status: 'AGUARDANDO ENVIO',
  //     customer_note: `NETSUITE ORDER ID: ${order.netsuite_id}`,
  //   },
  // });

  return response.json(teste);
});

export default trackingCodeRouter;
