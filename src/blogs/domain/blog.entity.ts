import * as mongoose from 'mongoose';
import {Model, model, HydratedDocument} from "mongoose";
import {Blog} from "../types/blog";

type BlogModelType = Model<Blog>;
export type BlogDocument = HydratedDocument<Blog>;

const blogSchema = new mongoose.Schema<Blog>({
    name: { type: String, required: true, minLength: 1 },
    description: { type: String, required: true, minLength: 1 },
    websiteUrl: { type: String, required: true, minLength: 1 },
    createdAt: { type: String, required: true, minLength: 1 },
    isMembership: { type: Boolean, required: true },
});
export const BlogModel = model<Blog, BlogModelType>('blog', blogSchema);
