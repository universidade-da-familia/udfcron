"use strict";
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
var express_1 = require("express");
var api_1 = __importDefault(require("../services/api"));
var apiIntelipost_1 = __importDefault(require("../services/apiIntelipost"));
var trackingCodeRouter = express_1.Router();
trackingCodeRouter.post('/', function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, nfe_access_key, tray_order_id, responseAuth, auth, response_intelipost, _b, shipped_date_iso, tracking_code, sending_date;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = request.body, nfe_access_key = _a.nfe_access_key, tray_order_id = _a.tray_order_id;
                return [4 /*yield*/, api_1.default.post('/auth', {
                        consumer_key: process.env.CONSUMER_KEY,
                        consumer_secret: process.env.CONSUMER_SECRET,
                        code: process.env.CONSUMER_CODE,
                    })];
            case 1:
                responseAuth = _c.sent();
                auth = responseAuth.data;
                return [4 /*yield*/, apiIntelipost_1.default.get("/shipment_order/invoice_key/" + nfe_access_key)];
            case 2:
                response_intelipost = _c.sent();
                if (!(response_intelipost.data.content.length > 0)) return [3 /*break*/, 4];
                _b = response_intelipost.data.content[0].shipment_order_volume_array[0], shipped_date_iso = _b.shipped_date_iso, tracking_code = _b.tracking_code;
                sending_date = shipped_date_iso.split('T')[0];
                return [4 /*yield*/, api_1.default.put("/orders/" + tray_order_id + "?access_token=" + auth.access_token, {
                        Order: {
                            status: 'ENVIADO',
                            sending_code: tracking_code || '',
                            sending_date: sending_date || '',
                        },
                    })];
            case 3:
                _c.sent();
                return [2 /*return*/, response.status(204).send()];
            case 4: return [2 /*return*/, response.status(500).send()];
        }
    });
}); });
exports.default = trackingCodeRouter;
