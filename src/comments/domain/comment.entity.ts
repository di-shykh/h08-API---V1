import {CommentDB} from "../routes/output/commnent.db";
import * as mongoose from 'mongoose';
import {Model, model, HydratedDocument} from "mongoose";

type CommentModelType = Model<CommentDB>;
export type CommentDocument = HydratedDocument<CommentDB>;

const commentSchema = new mongoose.Schema<CommentDB>({
    content: {type: String, required: true, minLength: 1},
    userId: {type: String, required: true, minLength: 1},
    postId: {type: String, required: true, minLength: 1},
    createdAt: {type: String, required: true, minLength: 1},
    likesCount: {type: Number, required: true},
    dislikesCount: {type: Number, required: true},
});
export const CommentModel = model<CommentDB, CommentModelType>("comment", commentSchema);