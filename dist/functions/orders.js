"use strict";
// import storage from 'node-persist';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var api_1 = __importDefault(require("../services/api"));
var apiIntelipost_1 = __importDefault(require("../services/apiIntelipost"));
var apiNetsuite = axios_1.default.create({
    baseURL: 'https://5260046.restlets.api.netsuite.com/app/site/hosting',
    headers: {
        'Content-Type': 'application/json',
        Authorization: 'NLAuth nlauth_account=5260046, nlauth_email=dev@udf.org.br, nlauth_signature=0rZFiwRE#@!,nlauth_role=1077',
    },
});
var getProductReference = function (product_id, auth) { return __awaiter(void 0, void 0, void 0, function () {
    var responseProduct, productReference;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, api_1.default.get("/products/" + product_id, {
                    params: {
                        access_token: auth.access_token,
                    },
                })];
            case 1:
                responseProduct = _a.sent();
                productReference = responseProduct.data.Product.reference;
                return [2 /*return*/, productReference];
        }
    });
}); };
var mountOrder = function (order, auth) { return __awaiter(void 0, void 0, void 0, function () {
    var responseComplete, orderComplete, shipment_value_intelipost, intelipostProducts, responseIntelipost, intelipostPac, products, _i, _a, product, productReference, product_subtotal, product_subtotal_percent, freight_per_item, fullname, firstname, lastname;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, api_1.default.get("/orders/" + order.Order.id + "/complete", {
                    params: {
                        access_token: auth.access_token,
                    },
                })];
            case 1:
                responseComplete = _b.sent();
                orderComplete = responseComplete.data.Order;
                shipment_value_intelipost = '0';
                if (!(orderComplete.shipment === 'Frete grátis')) return [3 /*break*/, 3];
                intelipostProducts = orderComplete.ProductsSold.map(function (_a) {
                    var product = _a.ProductsSold;
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
                });
                return [4 /*yield*/, apiIntelipost_1.default.post('https://api.intelipost.com.br/api/v1/quote_by_product', {
                        origin_zip_code: '17580000',
                        destination_zip_code: orderComplete.Customer.zip_code.replace('-', ''),
                        products: intelipostProducts,
                    })];
            case 2:
                responseIntelipost = _b.sent();
                intelipostPac = responseIntelipost.data.content.delivery_options.find(function (option) {
                    return option.description === 'Correios PAC';
                });
                if (intelipostPac) {
                    shipment_value_intelipost = String(intelipostPac.final_shipping_cost);
                }
                _b.label = 3;
            case 3:
                products = [];
                _i = 0, _a = orderComplete.ProductsSold;
                _b.label = 4;
            case 4:
                if (!(_i < _a.length)) return [3 /*break*/, 7];
                product = _a[_i];
                return [4 /*yield*/, getProductReference(product.ProductsSold.product_id, auth)];
            case 5:
                productReference = _b.sent();
                product_subtotal = Number(product.ProductsSold.quantity) *
                    Number(product.ProductsSold.price);
                product_subtotal_percent = product_subtotal / Number(orderComplete.partial_total);
                freight_per_item = Number(shipment_value_intelipost) > 0
                    ? product_subtotal_percent * Number(shipment_value_intelipost)
                    : product_subtotal_percent * Number(orderComplete.shipment_value);
                products.push({
                    netsuite_id: productReference,
                    quantity: product.ProductsSold.quantity,
                    freight_per_item: freight_per_item,
                });
                _b.label = 6;
            case 6:
                _i++;
                return [3 /*break*/, 4];
            case 7:
                fullname = orderComplete.Customer.name.split(' ');
                firstname = fullname[0];
                fullname.shift();
                lastname = fullname.length >= 1 ? fullname.join(' ') : '';
                return [2 /*return*/, {
                        id: orderComplete.id,
                        shipment: orderComplete.shipment,
                        shipment_value: orderComplete.shipment_value,
                        shipment_value_intelipost: shipment_value_intelipost,
                        installment: orderComplete.installment,
                        payment_method: orderComplete.payment_method,
                        total: orderComplete.total,
                        payment_url: orderComplete.OrderTransactions.length > 0
                            ? orderComplete.OrderTransactions[0].url_payment
                            : '',
                        customer: {
                            id: orderComplete.Customer.id,
                            is_business: !!orderComplete.Customer.cnpj,
                            cpf_cnpj: orderComplete.Customer.cnpj
                                ? orderComplete.Customer.cnpj
                                : orderComplete.Customer.cpf,
                            name: orderComplete.Customer.name,
                            firstname: firstname,
                            lastname: lastname,
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
                        products: products,
                    }];
        }
    });
}); };
var orders = function () { return __awaiter(void 0, void 0, void 0, function () {
    var responseAuth, auth, response, trayOrders, completedOrders, _i, trayOrders_1, order, mountedOrder, responseNetsuite, _a, _b, order;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                console.log('🚀 Comecei a gerar os pedidos.');
                return [4 /*yield*/, api_1.default.post('/auth', {
                        consumer_key: process.env.CONSUMER_KEY,
                        consumer_secret: process.env.CONSUMER_SECRET,
                        code: process.env.CONSUMER_CODE,
                    })];
            case 1:
                responseAuth = _c.sent();
                auth = responseAuth.data;
                console.log('🚀 Autentiquei na Tray.');
                return [4 /*yield*/, api_1.default.get('/orders', {
                        params: {
                            access_token: auth.access_token,
                            // limit: 1,
                            status: '%A ENVIAR%',
                        },
                    })];
            case 2:
                response = _c.sent();
                trayOrders = response.data.Orders;
                completedOrders = [];
                _i = 0, trayOrders_1 = trayOrders;
                _c.label = 3;
            case 3:
                if (!(_i < trayOrders_1.length)) return [3 /*break*/, 6];
                order = trayOrders_1[_i];
                return [4 /*yield*/, mountOrder(order, auth)];
            case 4:
                mountedOrder = _c.sent();
                completedOrders.push(mountedOrder);
                _c.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 3];
            case 6:
                console.log('🚀 Enviando os pedidos para o Netsuite.');
                if (!((completedOrders === null || completedOrders === void 0 ? void 0 : completedOrders.length) > 0)) return [3 /*break*/, 8];
                return [4 /*yield*/, apiNetsuite.post('/restlet.nl?script=220&deploy=1', {
                        completedOrders: completedOrders,
                    })];
            case 7:
                responseNetsuite = _c.sent();
                _c.label = 8;
            case 8:
                if (!responseNetsuite) return [3 /*break*/, 13];
                console.log('🚀 Netsuite response: ', responseNetsuite === null || responseNetsuite === void 0 ? void 0 : responseNetsuite.data);
                _a = 0, _b = responseNetsuite === null || responseNetsuite === void 0 ? void 0 : responseNetsuite.data;
                _c.label = 9;
            case 9:
                if (!(_a < _b.length)) return [3 /*break*/, 12];
                order = _b[_a];
                if (!(order.netsuite_id !== 'netsuite_order_error' &&
                    order.netsuite_id !== 'netsuite_customer_error')) return [3 /*break*/, 11];
                // eslint-disable-next-line no-await-in-loop
                return [4 /*yield*/, api_1.default.put("/orders/" + order.id + "?access_token=" + auth.access_token, {
                        Order: {
                            status: 'AGUARDANDO ENVIO',
                            customer_note: "NETSUITE ORDER ID: " + order.netsuite_id,
                        },
                    })];
            case 10:
                // eslint-disable-next-line no-await-in-loop
                _c.sent();
                _c.label = 11;
            case 11:
                _a++;
                return [3 /*break*/, 9];
            case 12: return [3 /*break*/, 14];
            case 13:
                console.log('🚀 Nao ha pedidos para enviar para o Netsuite');
                _c.label = 14;
            case 14: return [2 /*return*/, completedOrders];
        }
    });
}); };
exports.default = orders;
