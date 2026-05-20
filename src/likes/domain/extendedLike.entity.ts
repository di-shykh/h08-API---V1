import {LikeStatus} from "../types/likeStatus";
import {ExtendedLike} from "../types/extendedLike";
import * as mongoose from 'mongoose';
import {Model, model, HydratedDocument} from "mongoose";

type ExtendedLikeType = Model<ExtendedLike>;
export type ExtendedLikeDocument = HydratedDocument<ExtendedLike>;

const extendedLikeSchema = new mongoose.Schema<ExtendedLike>({
    addedAt: {type: String, default: () => new Date().toISOString(), required: true},
    status: {type: String, enum: Object.values(LikeStatus), required: true},
    userId: {type: String, required: true},
    postId: {type: String, required: true},
});
extendedLikeSchema.index({ postId: 1, status: 1, addedAt: -1 });
export const ExtendedLikeModel = model<ExtendedLike, ExtendedLikeType>("ExtendedLike", extendedLikeSchema);
