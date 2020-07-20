export interface OrderCompleteTray {
  Order: {
    id: string;
    customer_id: string;
    partial_total: string;
    taxes: string;
    discount: string;
    shipment: string;
    shipment_value: string;
    shipment_date: string;
    delivered: string;
    partner_id: string;
    discount_coupon: string;
    payment_method_rate: string;
    installment: string;
    value_1: string;
    sending_code: string;
    sending_date: string;
    billing_address: string;
    delivery_time: string;
    payment_method_id: string;
    payment_method: string;
    session_id: string;
    total: string;
    access_code: string;
    id_quotation: string;
    estimated_delivery_date: string;
    is_traceable: string;
    external_code: string;
    Customer: {
      cnpj: string;
      id: string;
      name: string;
      cpf: string;
      phone: string;
      cellphone: string;
      gender: string;
      email: string;
      company_name: string;
      state_inscription: string;
      address: string;
      zip_code: string;
      number: string;
      complement: string;
      neighborhood: string;
      city: string;
      state: string;
      country: string;
      CustomerAddresses: [
        {
          CustomerAddress: {
            id: string;
            customer_id: string;
            address: string;
            number: string;
            complement: string;
            neighborhood: string;
            city: string;
            state: string;
            zip_code: string;
            country: string;
          };
        },
      ];
    };
    ProductsSold: ProductsSoldTray[];
    Payment: PaymentTray[];
    OrderTransactions: OrderTransactionTray[];
  };
}

export interface ProductsSoldTray {
  ProductsSold: {
    product_kit_id: string;
    product_kit_id_kit: string;
    id_campaign: string;
    id: string;
    product_id: string;
    order_id: string;
    name: string;
    original_name: string;
    virtual_product: string;
    price: string;
    cost_price: string;
    original_price: string;
    weight: string;
    weight_cubic: string;
    quantity: string;
    brand: string;
    model: string;
    reference: string;
    length: string;
    width: string;
    height: string;
    variant_id: string;
    additional_information: string;
    text_variant: string;
    warranty: string;
    bought_together_id: string;
    ncm: string;
    included_items: string;
    release_date: string;
    comissao: string;
  };
}

export interface PaymentTray {
  Payment: {
    created: string;
    modified: string;
    id: string;
    order_id: string;
    payment_method_id: string;
    method: string;
    payment_place: string;
    value: string;
    date: string;
    note: string;
  };
}

export interface OrderTransactionTray {
  url_payment: string;
}
