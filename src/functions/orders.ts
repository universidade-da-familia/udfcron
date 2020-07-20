import storage from 'node-persist';

import api from '../services/api';

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

// pegar todos os pedidos em /orders
// fazer um map nesses pedidos, pegando os dados completos de cada pedido em /orders/${id}/complete
// para cada pedido precisamos montar um array de objetos com:
// 1. dados do pedido
//  1.1. forma de envio
// 2. dados do cliente
//  2.1. dados de entrega
// 3. dados dos produtos

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

  const completedOrders = response.data.Orders.map(
    async (order: Order): Promise<OrderNetsuite> => {
      const responseComplete = await api.get<OrderCompleteTray>(
        `/orders/${order.Order.id}/complete`,
        {
          params: {
            access_token: auth.access_token,
          },
        },
      );

      const orderComplete = responseComplete.data.Order;

      // console.log(orderComplete.Customer);

      const products = orderComplete.ProductsSold.map(product => {
        return {
          netsuite_id: product.ProductsSold.reference,
          quantity: product.ProductsSold.quantity,
        };
      });

      const fullname = orderComplete.Customer.name.split(' ');
      const firstname = fullname[0];
      fullname.shift();
      const lastname = fullname.length >= 1 ? fullname.join(' ') : '';

      return {
        id: orderComplete.id,
        shipment: orderComplete.shipment,
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
    },
  );

  return completedOrders;

  // console.log(responseComplete.data.Order.id);

  // const allOrders = response.data.Orders;

  // return allOrders;
};

export default orders;
