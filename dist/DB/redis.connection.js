"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
exports.connectionRedis = connectionRedis;
const redis_1 = require("redis");
const config_js_1 = require("../config.js");
exports.client = (0, redis_1.createClient)({
    url: config_js_1.REDIS_URI
});
async function connectionRedis() {
    try {
        await exports.client.connect();
        console.log('redis connected successfully');
    }
    catch (error) {
        console.log('failed to connect redis');
    }
}
