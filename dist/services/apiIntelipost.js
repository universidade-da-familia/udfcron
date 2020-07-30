"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var apiIntelipost = axios_1.default.create({
    baseURL: 'https://api.intelipost.com.br/api/v1',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.INTELIPOST_API_KEY,
    },
});
exports.default = apiIntelipost;
