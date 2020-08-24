// import storage from 'node-persist';

import axios from 'axios';

import api from '../services/api';
import apiIntelipost from '../services/apiIntelipost';

import { AuthTray, OrderCompleteTray } from '../types/tray';
import { OrderNetsuite, ProductsNetsuite } from '../types/netsuite';

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

const getProductReference = async (
  product_id: string,
  auth: AuthTray,
): Promise<string> => {
  const responseProduct = await api.get(`/products/${product_id}`, {
    params: {
      access_token: auth.access_token,
    },
  });

  const productReference = responseProduct.data.Product.reference;

  return productReference as string;
};

const mountOrder = async (
  order: Order,
  auth: AuthTray,
): Promise<OrderNetsuite> => {
  const responseComplete = await api.get<OrderCompleteTray>(
    `/orders/${order.Order.id}/complete`,
    {
      params: {
        access_token: auth.access_token,
      },
    },
  );

  const orderComplete = responseComplete.data.Order;

  let shipment_value_intelipost = '0';
  if (orderComplete.shipment === 'Frete grátis') {
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

    const responseIntelipost = await apiIntelipost.post(
      'https://api.intelipost.com.br/api/v1/quote_by_product',
      {
        origin_zip_code: '17580000',
        destination_zip_code: orderComplete.Customer.zip_code.replace('-', ''),
        products: intelipostProducts,
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

  const products = [] as ProductsNetsuite[];
  // eslint-disable-next-line no-restricted-syntax
  for (const product of orderComplete.ProductsSold) {
    // eslint-disable-next-line no-await-in-loop
    const productReference = await getProductReference(
      product.ProductsSold.product_id,
      auth,
    );

    const product_subtotal =
      Number(product.ProductsSold.quantity) *
      Number(product.ProductsSold.price);
    const product_subtotal_percent =
      product_subtotal / Number(orderComplete.partial_total);

    const freight_per_item =
      Number(shipment_value_intelipost) > 0
        ? product_subtotal_percent * Number(shipment_value_intelipost)
        : product_subtotal_percent * Number(orderComplete.shipment_value);

    products.push({
      netsuite_id: productReference,
      quantity: product.ProductsSold.quantity,
      freight_per_item,
    });
  }

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
            .replace('.', '')
            .replace('.', '')
            .replace('/', '')
            .replace('-', '')
        : orderComplete.Customer.cpf
            .replace('.', '')
            .replace('.', '')
            .replace('-', ''),
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

const orders = async (): Promise<void> => {
  try {
    console.log('🚀 Comecei a gerar os pedidos.');

    const responseAuth = await api.post<AuthTray>('/auth', {
      consumer_key: process.env.CONSUMER_KEY,
      consumer_secret: process.env.CONSUMER_SECRET,
      code: process.env.CONSUMER_CODE,
    });

    const auth = responseAuth.data;

    console.log('🚀 Autentiquei na Tray.', auth.access_token);

    const response = await api.get<Response>('/orders', {
      params: {
        access_token: auth.access_token,
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

    console.log('🚀 Enviando os pedidos para o Netsuite.');

    let responseNetsuite;
    if (completedOrders?.length > 0) {
      responseNetsuite = await apiNetsuite.post(
        '/restlet.nl?script=220&deploy=1',
        {
          completedOrders,
        },
      );
    }

    if (responseNetsuite) {
      console.log('🚀 Netsuite response: ', responseNetsuite?.data);

      // eslint-disable-next-line no-restricted-syntax
      for (const order of responseNetsuite?.data) {
        if (
          order.netsuite_id !== 'netsuite_order_error' &&
          order.netsuite_id !== 'netsuite_customer_error'
        ) {
          // eslint-disable-next-line no-await-in-loop
          await api.put(
            `/orders/${order.id}?access_token=${auth.access_token}`,
            {
              Order: {
                status: 'AGUARDANDO ENVIO',
                customer_note: `NETSUITE ORDER ID: ${order.netsuite_id}`,
              },
            },
          );
        }
      }
    } else {
      console.log('🚀 Nao ha pedidos para enviar para o Netsuite');
    }
  } catch (err) {
    console.log('🚀 Error', err.message);
  }
};

export default orders;
