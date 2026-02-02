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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const setup_app_1 = require("./setup-app");
const settings_1 = require("./core/settings/settings");
const mongo_bd_1 = require("./db/mongo.bd");
const bootstrap = () => __awaiter(void 0, void 0, void 0, function* () {
    const app = (0, express_1.default)();
    (0, setup_app_1.setupApp)(app);
    const PORT = settings_1.SETTINGS.PORT;
    yield (0, mongo_bd_1.runDB)(settings_1.SETTINGS.MONGO_URL);
    app.listen(PORT, () => {
        console.log(`Example app listening on port ${PORT}`);
    });
    return app;
});
bootstrap();
//# sourceMappingURL=index.js.map