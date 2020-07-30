"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var express_1 = __importDefault(require("express"));
require("express-async-errors");
var cors_1 = __importDefault(require("cors"));
var routes_1 = __importDefault(require("./routes"));
// import authJob from './jobs/auth';
var orders_1 = __importDefault(require("./jobs/orders"));
orders_1.default();
// authJob();
var app = express_1.default();
app.use(express_1.default.json());
app.use(cors_1.default());
app.use(routes_1.default);
exports.default = app;
