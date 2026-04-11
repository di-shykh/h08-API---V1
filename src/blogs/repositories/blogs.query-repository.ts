import {BlogQueryInput} from "../routes/input/blog-query.input";
import {RepositoryNotFoundError} from "../../core/errors/repository-not-found.error";
import {BlogListPaginatedOutput} from "../routes/output/blog-list-paginated.output";
import {BlogOutput} from "../routes/output/blog.output";
import { injectable } from 'inversify';
import {BlogDocument, BlogModel} from "../domain/blog.entity";

@injectable()
export class BlogsQueryRepository {
    async findBlogById(id: string):Promise<BlogDocument | null> {
        return BlogModel.findOne({_id: id})
    }
    async findManyBlogs(
        queryDto: BlogQueryInput,
    ): Promise<{items: BlogDocument[]; totalCount: number}>{
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
        const items = await BlogModel
            .find(filter)
            .sort({[sortBy]: sortDirection})
            .skip(skip)
            .limit(pageSize);
        const totalCount = await BlogModel.countDocuments(filter);
        return {items, totalCount};
    }
    async findBlogByIdOrFail(id: string): Promise<BlogDocument> {
        const res = await BlogModel.findOne({_id: id});
        if(!res) {
            throw new RepositoryNotFoundError("Blog not found.");
        }
        return res;
    }
    mapToBlogListPaginatedOutput (
        blogs: BlogDocument[],
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
    mapToBlogOutput(blog: BlogDocument):BlogOutput {
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
