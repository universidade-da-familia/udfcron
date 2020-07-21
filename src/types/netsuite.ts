export interface OrderNetsuite {
  id: string;
  shipment: string;
  shipment_value: string;
  shipment_value_intelipost: string;
  installment: string;
  payment_method: string;
  total: string;
  payment_url: string;
  customer: CustomerNetsuite;
  products: ProductsNetsuite[];
}

export interface CustomerNetsuite {
  id: string;
  is_business: boolean;
  cpf_cnpj: string;
  name: string;
  firstname: string;
  lastname: string;
  sex: string;
  company_name: string;
  phone: string;
  cellphone: string;
  email: string;
  country: string;
  cep: string;
  uf: string;
  city: string;
  street: string;
  street_number: string;
  neighborhood: string;
  complement: string;
}

export interface ProductsNetsuite {
  netsuite_id: string;
  quantity: string;
}
