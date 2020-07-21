import storage from 'node-persist';

import axios from 'axios';

import api from '../services/api';

import { Auth } from '../types/auth';
import { OrderCompleteTray } from '../types/tray';
import { OrderNetsuite } from '../types/netsuite';

interface Response {
  paging: {
    total: number;
    page: number;
    offset: number;
    limit: number;
    maxLimit: number;
  };
  Orders: Order[];
}

interface Order {
  Order: {
    id: string;
  };
}

const apiNetsuite = axios.create({
  baseURL: 'https://5260046.restlets.api.netsuite.com/app/site/hosting',
  headers: {
    'Content-Type': 'application/json',
    Authorization:
      'NLAuth nlauth_account=5260046, nlauth_email=dev@udf.org.br, nlauth_signature=0rZFiwRE#@!,nlauth_role=1077',
  },
});

// pegar todos os pedidos em /orders
// fazer um map nesses pedidos, pegando os dados completos de cada pedido em /orders/${id}/complete
// para cada pedido precisamos montar um array de objetos com:
// 1. dados do pedido
//  1.1. forma de envio
// 2. dados do cliente
//  2.1. dados de entrega
// 3. dados dos produtos

const mountOrder = async (order: Order, auth: Auth): Promise<OrderNetsuite> => {
  const responseComplete = await api.get<OrderCompleteTray>(
    `/orders/${order.Order.id}/complete`,
    {
      params: {
        access_token: auth.access_token,
      },
    },
  );

  const orderComplete = responseComplete.data.Order;

  // console.log('method', orderComplete.payment_method_id);
  let shipment_value_intelipost = '0';
  if (orderComplete.shipment === 'Frete grátis') {
    const headers = {
      'Content-Type': 'application/json',
      'api-key':
        '1273704cf48278e8e198c13059267033a16a636c878dc8f6b21f069d9e3aa97d',
    };

    const intelipostProducts = orderComplete.ProductsSold.map(
      ({ ProductsSold: product }) => {
        return {
          name: product.name,
          product_category: 'tray',
          sku_id: product.id,
          quantity: Number(product.quantity),
          cost_of_goods: Number(product.price),
          weight: Number(product.weight) / 1000,
          width: Number(product.width) !== 0 ? Number(product.width) : 1,
          height: Number(product.height) !== 0 ? Number(product.height) : 1,
          length: Number(product.length) !== 0 ? Number(product.length) : 1,
        };
      },
    );

    const responseIntelipost = await axios.post(
      'https://api.intelipost.com.br/api/v1/quote_by_product',
      {
        origin_zip_code: '17580000',
        destination_zip_code: orderComplete.Customer.zip_code.replace('-', ''),
        products: intelipostProducts,
      },
      {
        headers,
      },
    );

    const intelipostPac = responseIntelipost.data.content.delivery_options.find(
      (option: { description: string }) =>
        option.description === 'Correios PAC',
    );

    if (intelipostPac) {
      shipment_value_intelipost = String(intelipostPac.final_shipping_cost);
    }
  }

  const products = orderComplete.ProductsSold.map(
    ({ ProductsSold: product }) => {
      const product_subtotal = Number(product.quantity) * Number(product.price);
      const product_subtotal_percent =
        product_subtotal / Number(orderComplete.partial_total);

      const freight_per_item =
        Number(shipment_value_intelipost) > 0
          ? product_subtotal_percent * Number(shipment_value_intelipost)
          : product_subtotal_percent * Number(orderComplete.shipment_value);

      return {
        netsuite_id: product.reference,
        quantity: product.quantity,
        freight_per_item,
      };
    },
  );

  console.log('products', products);

  const fullname = orderComplete.Customer.name.split(' ');
  const firstname = fullname[0];
  fullname.shift();
  const lastname = fullname.length >= 1 ? fullname.join(' ') : '';

  return {
    id: orderComplete.id,
    shipment: orderComplete.shipment,
    shipment_value: orderComplete.shipment_value,
    shipment_value_intelipost,
    installment: orderComplete.installment,
    payment_method: orderComplete.payment_method,
    total: orderComplete.total,
    payment_url:
      orderComplete.OrderTransactions.length > 0
        ? orderComplete.OrderTransactions[0].url_payment
        : '',
    customer: {
      id: orderComplete.Customer.id,
      is_business: !!orderComplete.Customer.cnpj,
      cpf_cnpj: orderComplete.Customer.cnpj
        ? orderComplete.Customer.cnpj
        : orderComplete.Customer.cpf,
      name: orderComplete.Customer.name,
      firstname,
      lastname,
      sex: orderComplete.Customer.gender === '0' ? 'M' : 'F',
      company_name: orderComplete.Customer.company_name,
      phone: orderComplete.Customer.phone || '',
      cellphone: orderComplete.Customer.cellphone || '',
      email: orderComplete.Customer.email,
      country: orderComplete.Customer.country === 'Brasil' ? 'BR' : '',
      cep: orderComplete.Customer.zip_code,
      uf: orderComplete.Customer.state,
      city: orderComplete.Customer.city,
      street: orderComplete.Customer.address,
      street_number: orderComplete.Customer.number,
      neighborhood: orderComplete.Customer.neighborhood,
      complement: orderComplete.Customer.complement,
    },
    products,
  };
};

const orders = async () => {
  await storage.init();

  const auth = await storage.getItem('auth');

  const response = await api.get<Response>('/orders', {
    params: {
      access_token: auth.access_token,
      // limit: 1,
      status: '%A ENVIAR%',
    },
  });

  const trayOrders = response.data.Orders;

  const completedOrders = [] as OrderNetsuite[];

  // eslint-disable-next-line no-restricted-syntax
  for (const order of trayOrders) {
    // eslint-disable-next-line no-await-in-loop
    const mountedOrder = await mountOrder(order, auth);

    completedOrders.push(mountedOrder);
  }

  const responseNetsuite = await apiNetsuite.post(
    '/restlet.nl?script=220&deploy=1',
    {
      completedOrders,
    },
  );

  console.log('netsuite', responseNetsuite.data);

  // fazer chamada a api do netsuite enviando o completedOrders
  // netsuite vai retornar um array de pedidos que deram certo

  // fazer um put na tray para cada pedido alterando seu status para 'Aguardando Envio'

  return completedOrders;
};

export default orders;
