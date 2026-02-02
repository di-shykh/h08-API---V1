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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTTLIndex = createTTLIndex;
//ttl indexes for blacklist
function createTTLIndex(tokenListCollection) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!tokenListCollection)
                throw new Error('Collection not initialized');
            const indexes = yield tokenListCollection.indexes();
            const ttlIndexExists = indexes.some(index => index.name === 'expiresAt_ttl_index');
            if (!ttlIndexExists) {
                yield tokenListCollection.createIndex({ expiresAt: 1 }, {
                    expireAfterSeconds: 0,
                    name: 'expiresAt_ttl_index',
                    background: true
                });
                console.log('TTL index created');
            }
            else {
                console.log('TTL index already exists');
            }
        }
        catch (error) {
            console.error('Failed to create TTL index:', error);
            throw error;
        }
    });
}
//# sourceMappingURL=ttl.indexes.blacklist.js.map