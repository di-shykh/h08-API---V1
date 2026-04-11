import {Post} from "./post";
import * as mongoose from 'mongoose';
import {Model, model, HydratedDocument} from "mongoose";

type PostModelType = Model<Post>;
export type PostDocument = HydratedDocument<Post>;

const postSchema = new mongoose.Schema<Post>({
    title: { type: String, required: true, minLength: 1 },
    shortDescription: { type: String, required: true, minLength: 1 },
    content: { type: String, required: true, minLength: 1 },
    blogId: { type: String, required: true, minLength: 1 },
    blogName: { type: String, required: true, minLength: 1 },
    createdAt: { type: String, required: true },
});
export const PostModel: PostModelType = model<Post, PostModelType>('post', postSchema);
