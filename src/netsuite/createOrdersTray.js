/* eslint-disable */
/**
 *@author Lucas Alves
 *
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@NModuleScope SameAccount
 */
define(['N/record', 'N/search'], function (record, search) {
  /**
   * POST.
   *
   * @param context
   */

  const searchColumns = ['entityid', 'internalid', 'custentity_enl_cnpjcpf'];

  /*
    1. Verificar se o cliente existe, se não existir cadastra-lo
    2. Verificar se o cliente possio endereços e remove-los
    3. Pegar o endereço da Tray e cadastrar para o cliente
    4. Salvar os dados do cliente
    5. Criar o pedido
   */

  function createCustomer(context) {
    try {
      const customer = record.create({
        type: record.Type.CUSTOMER
      });

      if (context.is_business) {
        customer.setValue({
          fieldId: 'companyname',
          value: context.company_name,
        });
        customer.setValue({
          fieldId: 'custentity_rsc_nomefantasia',
          value: context.name,
        });
        customer.setValue({ fieldId: 'isperson', value: 'F' });
      } else {
        customer.setValue({ fieldId: 'firstname', value: context.firstname });
        customer.setValue({ fieldId: 'lastname', value: context.lastname });
        customer.setValue({ fieldId: 'isperson', value: 'T' });
        customer.setValue({ fieldId: 'custentity_enl_ienum', value: 'ISENTO' });
      }

      customer.setValue({
        fieldId: 'custentity_enl_enviarnota',
        value: true,
      });
      customer.setValue({
        fieldId: 'custentity_enl_legalname',
        value: context.name,
      });
      customer.setValue({
        fieldId: 'custentity_enl_ent_activitysector',
        value: 4,
      });
      customer.setValue({
        fieldId: 'custentity_enl_cnpjcpf',
        value: context.cpf_cnpj,
      });
      customer.setValue({ fieldId: 'email', value: context.email || '' });
      customer.setValue({ fieldId: 'subsidiary', value: 2 });
      customer.setValue({
        fieldId: 'custrecord_udf_flag_integrado',
        value: true,
      });

      if (context.sex == 'F') {
        customer.setValue({ fieldId: 'custentity_rsc_sexo', value: '1' });
      }
      if (context.sex == 'M') {
        customer.setValue({ fieldId: 'custentity_rsc_sexo', value: '2' });
      }

      const customerId = customer.save();

      return customerId
    } catch (err) {
      log.debug({ title: 'CUSTOMER ERROR', details: err });
      return 'netsuite_customer_error'
    }
  }

  function createOrder(context) {
    try {
      const customer = record.load({
        type: record.Type.CUSTOMER,
        id: context.customer_netsuite_id,
        isDynamic: true,
      });

      //customer.setValue({
      //  fieldId: 'custentity_enl_legalname',
      //  value: context.customer.name,
      //});

      customer.setValue({
        fieldId: 'custentity_enl_ienum',
        value: 'ISENTO',
      });

      customer.setValue({
        fieldId: 'custentity_enl_ent_activitysector',
        value: 4,
      });

      customer.setValue({
        fieldId: 'custentity_enl_enviarnota',
        value: true,
      });

      customer.selectNewLine({ sublistId: 'addressbook' });

      const searchColumns = ['internalid'];
      const ufIds = search
        .create({
          type: 'customlist_enl_state',
          filters: [['name', 'is', context.customer.uf]],
          columns: searchColumns,
        })
        .run()
        .getRange({
          start: 0,
          end: 1000,
        })
        .map(function (result) {
          const id = result.getValue({ name: 'internalid' });

          return id;
        });
      const cityIds = search
        .create({
          type: 'customrecord_enl_cities',
          filters: [['name', 'is', context.customer.city]],
          columns: searchColumns,
        })
        .run()
        .getRange({
          start: 0,
          end: 1000,
        })
        .map(function (result) {
          const id = result.getValue({ name: 'internalid' });

          return id;
        });

      const addressSubrecord = customer.getCurrentSublistSubrecord({
        sublistId: 'addressbook',
        fieldId: 'addressbookaddress',
      });

      customer.setCurrentSublistValue({
        sublistId: 'addressbook',
        fieldId: 'defaultbilling',
        value: true,
      });
      customer.setCurrentSublistValue({
        sublistId: 'addressbook',
        fieldId: 'defaultshipping',
        value: true,
      });

      customer.setCurrentSublistValue({
        sublistId: 'addressbook',
        fieldId: 'label',
        value: 'Entrega Tray',
      });

      addressSubrecord.setValue({
        fieldId: 'country',
        value: 'BR',
      });
      addressSubrecord.setValue({
        fieldId: 'zip',
        value: context.customer.cep,
      });
      addressSubrecord.setValue({
        fieldId: 'addr1',
        value: context.customer.street,
      });
      addressSubrecord.setValue({
        fieldId: 'custrecord_enl_numero',
        value: context.customer.street_number,
      });
      addressSubrecord.setValue({
        fieldId: 'addr2',
        value: context.customer.complement,
      });
      addressSubrecord.setValue({
        fieldId: 'addr3',
        value: context.customer.neighborhood,
      });
      addressSubrecord.setValue({
        fieldId: 'custrecord_enl_uf',
        value: parseInt(ufIds[0]) || '',
      });
      addressSubrecord.setValue({
        fieldId: 'custrecord_enl_city',
        value: parseInt(cityIds[0]) || '',
      });
      addressSubrecord.setValue({
        fieldId: 'addressee',
        value: context.customer.name,
      });
      // addressSubrecord.setValue({
      //   fieldId: 'custrecordudf_dashboard_address_id',
      //   value: String(context.customer.id) + 'tray',
      // });

      customer.commitLine({ sublistId: 'addressbook' });

      customer.save({
        ignoreMandatoryFields: false,
        enableSourcing: false,
      });

      const salesOrder = record.create({
        type: record.Type.SALES_ORDER,
        isDynamic: true,
        defaultValues: {
          entity: context.customer_netsuite_id,
        },
      });

      salesOrder.setValue({ fieldId: 'custbody_udf_tray_order_id', value: context.id });
      salesOrder.setValue({ fieldId: 'trandate', value: new Date() });
      salesOrder.setValue({ fieldId: 'department', value: '3' });
      salesOrder.setValue({ fieldId: 'class', value: '1' });
      salesOrder.setValue({ fieldId: 'location', value: '1' });

      if (context.payment_method === 'Boleto - Yapay') {
        salesOrder.setValue({ fieldId: 'terms', value: '18' });
      } else {
        if (context.installment == 1) {
          salesOrder.setValue({ fieldId: 'terms', value: '20' });
        }

        if (context.installment == 2) {
          salesOrder.setValue({ fieldId: 'terms', value: '24' });
        }

        if (context.installment == 3) {
          salesOrder.setValue({ fieldId: 'terms', value: '25' });
        }

        if (context.installment == 4) {
          salesOrder.setValue({ fieldId: 'terms', value: '30' });
        }

        if (context.installment == 5) {
          salesOrder.setValue({ fieldId: 'terms', value: '31' });
        }

        if (context.installment == 6) {
          salesOrder.setValue({ fieldId: 'terms', value: '32' });
        }

        if (context.installment == 7) {
          salesOrder.setValue({ fieldId: 'terms', value: '33' });
        }

        if (context.installment == 8) {
          salesOrder.setValue({ fieldId: 'terms', value: '34' });
        }

        // grava o pedido como pendente de aprovação (pagamento pendente na payu)
        // if (context.orderstatus) {
        //   salesOrder.setValue({
        //     fieldId: 'orderstatus',
        //     value: context.orderstatus,
        //   });
        // }

        // grava o pedido como pendente de aprovação (pagamento pendente na payu)
        // if (context.origstatus) {
        //   salesOrder.setValue({
        //     fieldId: 'origstatus',
        //     value: context.origstatus,
        //   });
        // }

        // grava o pedido como pendente de aprovação (pagamento pendente na payu)
        // if (context.statusRef) {
        //   salesOrder.setValue({
        //     fieldId: 'statusRef',
        //     value: context.statusRef,
        //   });
        // }
      }

      salesOrder.setValue({
        fieldId: 'custbodyudf_order_type',
        value: 4,
      });

      salesOrder.setValue({
        fieldId: 'custbody_enl_operationtypeid',
        value: '1',
      });
      salesOrder.setValue({
        fieldId: 'custbody_enl_order_documenttype',
        value: '1',
      });
      salesOrder.setValue({
        fieldId: 'custbodyudf_observacao_cliente',
        value: 'Pedido gerado automaticamente através da integração com a Tray',
      });

      salesOrder.setValue({ fieldId: 'custbody_enl_freighttype', value: '1' });

      if (context.shipment === 'Frete grátis') {
        salesOrder.setValue({
          fieldId: 'shipmethod',
          value: 3647,
        });

        salesOrder.setValue({
          fieldId: 'custbody_enl_carrierid',
          value: 4,
        });
      } else if (context.shipment === 'Econômico') {
        salesOrder.setValue({
          fieldId: 'shipmethod',
          value: 3647,
        });

        salesOrder.setValue({
          fieldId: 'custbody_enl_carrierid',
          value: 4,
        });
      } else if (
        context.shipment === 'Expresso'
      ) {
        salesOrder.setValue({
          fieldId: 'shipmethod',
          value: 3670,
        });

        salesOrder.setValue({
          fieldId: 'custbody_enl_carrierid',
          value: 4,
        });
      } else if (
        context.shipment === 'Braspress'
      ) {
        salesOrder.setValue({
          fieldId: 'shipmethod',
          value: 3653,
        });

        salesOrder.setValue({
          fieldId: 'custbody_enl_carrierid',
          value: 3,
        });
      } else if (
        context.shipment === 'Braspress Multiply'
      ) {
        salesOrder.setValue({
          fieldId: 'shipmethod',
          value: 3652,
        });

        salesOrder.setValue({
          fieldId: 'custbody_enl_carrierid',
          value: 3,
        });
      } else if (
        context.shipment === 'Correios Sedex 10'
      ) {
        salesOrder.setValue({
          fieldId: 'shipmethod',
          value: 3651,
        });

        salesOrder.setValue({
          fieldId: 'custbody_enl_carrierid',
          value: 4,
        });
      } else if (
        context.shipment === 'Braspress Aéreo'
      ) {
        salesOrder.setValue({
          fieldId: 'shipmethod',
          value: 3654,
        });

        salesOrder.setValue({
          fieldId: 'custbody_enl_carrierid',
          value: 3,
        });
      } else if (
        context.shipment === 'Azul Cargo Express'
      ) {
        salesOrder.setValue({
          fieldId: 'shipmethod',
          value: 3655,
        });

        salesOrder.setValue({
          fieldId: 'custbody_enl_carrierid',
          value: 1,
        });
      } else if (
        context.shipment === 'Araçalog Aéreo'
      ) {
        salesOrder.setValue({
          fieldId: 'shipmethod',
          value: 3656,
        });

        salesOrder.setValue({
          fieldId: 'custbody_enl_carrierid',
          value: 2,
        });
      } else if (
        context.shipment === 'Aracalog Standard'
      ) {
        salesOrder.setValue({
          fieldId: 'shipmethod',
          value: 3657,
        });

        salesOrder.setValue({
          fieldId: 'custbody_enl_carrierid',
          value: 2,
        });
      } else if (context.shipment === 'Azul Cargo Express') {
        salesOrder.setValue({
          fieldId: 'shipmethod',
          value: 3655,
        });

        salesOrder.setValue({
          fieldId: 'custbody_enl_carrierid',
          value: 1,
        });
      } else if (context.shipment === 'BPEX TRANSPORTES') {
        salesOrder.setValue({
          fieldId: 'shipmethod',
          value: 3715,
        });

        salesOrder.setValue({
          fieldId: 'custbody_enl_carrierid',
          value: 14,
        });
      } else if (
        context.shipment === 'Retirar na UDF'
      ) {
        if (context.gifts && context.gifts.length > 0) {
          salesOrder.setValue({
            fieldId: 'custbody_udf_obs_envio',
            value:
              'Brindes: \n' + context.gifts + '\n' + 'O líder irá retirar na UDF',
          });
        } else {
          salesOrder.setValue({
            fieldId: 'custbody_udf_obs_envio',
            value: 'O líder irá retirar na UDF',
          });
        }

        salesOrder.setValue({
          fieldId: 'custbody_enl_legaltext',
          value: 'O líder irá retirar na UDF',
        });

        salesOrder.setValue({ fieldId: 'custbody_enl_freighttype', value: '10' });

        salesOrder.setValue({
          fieldId: 'shipmethod',
          value: 3686,
        });

        salesOrder.setValue({
          fieldId: 'custbody_enl_carrierid',
          value: 12,
        });
      }

      // resumo do pedido - custo do frete
      salesOrder.setValue({
        fieldId: 'altshippingcost',
        value: 0,
      });
      // valor frete aba entrega
      salesOrder.setValue({
        fieldId: 'shippingcost',
        value: 0,
      });

      if (context.shipment === 'Frete grátis') {
        // valor frete aba informacoes fiscais
        salesOrder.setValue({
          fieldId: 'custbody_enl_trans_freightamount',
          value: context.shipment_value_intelipost || 0,
        });
      } else {
        // valor frete aba informacoes fiscais
        salesOrder.setValue({
          fieldId: 'custbody_enl_trans_freightamount',
          value: context.shipment_value || 0,
        });
      }

      const shippingAddress = salesOrder.getSubrecord({
        fieldId: 'shippingaddress',
      });

      // avalara actualization
      shippingAddress.setValue({
        fieldId: 'zipcode',
        value: context.customer.cep,
      });

      salesOrder.selectNewLine({ sublistId: 'item' });

      const products = context.products;
      products.forEach(function (product) {
        salesOrder.setCurrentSublistValue({
          sublistId: 'item',
          fieldId: 'item',
          value: product.netsuite_id,
        });
        salesOrder.setCurrentSublistValue({
          sublistId: 'item',
          fieldId: 'quantity',
          value: product.quantity,
        });

        salesOrder.setCurrentSublistValue({
          sublistId: 'item',
          fieldId: 'price',
          value: 30,
        });

        if (Number(context.shipment_value) === 0) {
          salesOrder.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_enl_line_freightamount',
            value: 0,
          });
        } else {
          salesOrder.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_enl_line_freightamount',
            value: product.freight_per_item || 0,
          });
        }

        salesOrder.commitLine({ sublistId: 'item' });
      });

      const salesOrderId = salesOrder.save({
        ignoreMandatoryFields: false,
        enableSourcing: false,
      });

      return salesOrderId
    } catch (err) {
      log.debug({ title: 'SALES ERROR', details: err })
      return 'netsuite_order_error'
    }
  }

  function store(context) {
    try {
      const orders = context.completedOrders;

      const createdOrders = orders.map(function(order) {
        const customers = search
          .create({
            type: search.Type.CUSTOMER,
            filters: [['custentity_enl_cnpjcpf', 'is', order.customer.cpf_cnpj]],
            columns: searchColumns,
          })
          .run()
          .getRange({
            start: 0,
            end: 1000,
          })
          .map(function (result) {
            return {
              id: result.getValue({ name: 'internalid' }),
              cpf_cnpj: result.getValue({ name: 'custentity_enl_cnpjcpf' }),
            };
          });

        if (customers.length > 0) {
          order.customer_netsuite_id = customers[0].id;
        } else {
          const customerId = createCustomer(order.customer);

          order.customer_netsuite_id = customerId;
        }

        const orderId = createOrder(order);

        return {
          id: order.id,
          netsuite_id: orderId
        };
      })

      log.debug({ title: 'all orders', details: createdOrders })

      return createdOrders;
    } catch (err) {
      return err;
    }
  }

  return {
    post: store,
  };
});
