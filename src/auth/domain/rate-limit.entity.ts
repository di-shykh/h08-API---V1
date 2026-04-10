import mongoose, {HydratedDocument, Model, model} from "mongoose";
import {RateLimit} from "../types/rate-limit";

type RateLimitModelType = Model<RateLimit>;
export type RateLimitDocument = HydratedDocument<RateLimit>;
const rateLimitSchema = new mongoose.Schema<RateLimit>({
    ip: {type: String, required: true, minlength: 2},
    url: {type: String, required: true, minlength: 1},
    date: {type: Date, required: true},
});
rateLimitSchema.index(
    { date: 1 },
    { expireAfterSeconds: 10, name: 'date_ttl_index' }
);
export const RateLimitModel = model<RateLimit, RateLimitModelType>('rateLimit', rateLimitSchema);