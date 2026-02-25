import {BlogQueryInput} from "../routes/input/blog-query.input";
import {ObjectId, WithId} from "mongodb";
import {Blog} from "../types/blog";
import {blogCollection} from "../../db/mongo.bd";
import {RepositoryNotFoundError} from "../../core/errors/repository-not-found.error";
import {BlogListPaginatedOutput} from "../routes/output/blog-list-paginated.output";
import {BlogOutput} from "../routes/output/blog.output";
import { injectable } from 'inversify';

@injectable()
export class BlogsQueryRepository {
    async findBlogById(id: string):Promise<WithId<Blog> | null> {
        return blogCollection.findOne({_id: new ObjectId(id)})
    }
    async findManyBlogs(
        queryDto: BlogQueryInput,
    ): Promise<{items: WithId<Blog>[]; totalCount: number}>{
        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            searchNameTerm,
        } = queryDto;

        const skip = (pageNumber - 1) * pageSize;
        const filter: any = {};
        if(searchNameTerm){
            filter.name = { $regex: searchNameTerm, $options: "i" };
        }
        const items = await blogCollection
            .find(filter)
            .sort({[sortBy]: sortDirection})
            .skip(skip)
            .limit(pageSize)
            .toArray();
        const totalCount = await blogCollection.countDocuments(filter);
        return {items, totalCount};
    }
    async findBlogByIdOrFail(id: string): Promise<WithId<Blog>> {
        const res = await blogCollection.findOne({_id: new ObjectId(id)});
        if(!res) {
            throw new RepositoryNotFoundError("Blog not found.");
        }
        return res;
    }
    mapToBlogListPaginatedOutput (
        blogs: WithId<Blog>[],
        pageNumber: number, pageSize: number, totalCount: number
    ): BlogListPaginatedOutput {
        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCount,

            items: blogs.map(
                (blog):BlogOutput=>({
                    id: blog._id.toString(),
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl,
                    createdAt: blog.createdAt,
                    isMembership: blog.isMembership,
                }),
            ),
        };
    }
    mapToBlogOutput(blog: WithId<Blog>):BlogOutput {
        return {
            id: blog._id.toString(),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt,
            isMembership: blog.isMembership,
        };
    }
}
