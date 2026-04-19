import {LikeStatus} from "../types/likeStatus";
import {Like} from "../types/like";
import * as mongoose from 'mongoose';
import {Model, model, HydratedDocument} from "mongoose";

type LikeModelType = Model<Like>;
export type LikeDocument = HydratedDocument<Like>;

const likeSchema = new mongoose.Schema<Like>({
    createdAt: {type: Date, default: Date.now, required: true},
    status: {type: String, enum: Object.values(LikeStatus), required: true},
    authorId: {type: String, required: true},
    parentId: {type: String, required: true},
});
export const LikeModel = model<Like, LikeModelType>("Like", likeSchema);