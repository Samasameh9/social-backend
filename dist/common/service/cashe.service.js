"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cachService = exports.CachService = void 0;
const redis_1 = require("redis");
const config_js_1 = require("../../config.js");
class CachService {
    client;
    constructor() {
        this.client = (0, redis_1.createClient)({ url: config_js_1.REDIS_URI });
        this.connect();
    }
    async connect() {
        try {
            await this.client.connect();
            console.log(`Redis connected successfully`);
        }
        catch (error) {
            console.log(`Redis connected fail`);
        }
    }
    async set({ key, value, ttl = undefined, }) {
        if (typeof value == "object") {
            value = JSON.stringify(value);
        }
        return await this.client.set(key, value, { ...(ttl ? { EX: ttl } : {}) });
    }
    async get({ key }) {
        let value = await this.client.get(key);
        try {
            return JSON.parse(value);
        }
        catch (error) {
            return value;
        }
    }
    async exists({ key }) {
        return await this.client.exists(key);
    }
    async update({ key, value, ttl = undefined, }) {
        if (!(await this.exists({ key }))) {
            return 0;
        }
        return await this.set({ key, value, ttl });
    }
    async del({ key }) {
        return await this.client.del(key);
    }
    async keys({ prefix }) {
        return await this.client.keys(`${prefix}*`);
    }
    async ttl({ key }) {
        return await this.client.ttl(key);
    }
    async expire({ key, ttl }) {
        return await this.client.expire(key, ttl);
    }
    async incrBy({ key, value = 1 }) {
        return await this.client.incrBy(key, value);
    }
}
exports.CachService = CachService;
exports.cachService = new CachService();
