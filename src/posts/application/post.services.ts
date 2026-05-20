import {PostsRepository} from "../repositories/posts.repository";
import {PostAttributes} from "./dtos/post-attributs";
import {RepositoryNotFoundError} from "../../core/errors/repository-not-found.error";
import {BlogsRepository} from "../../blogs/repositories/blogs.repository";
import {inject, injectable} from 'inversify';
import {PostDocument} from "../domain/post.entity";
import {LikeStatus} from "../../likes/types/likeStatus";
import {Result, ResultObject} from "../../core/result/result.type";
import {ExtendedLikesRepository} from "../../likes/repositories/extendedLikes.repository";
import {ExtendedLikeModel} from "../../likes/domain/extendedLike.entity";
import {UsersRepository} from "../../users/repositories/user.repository";
import {ResultErrorHelper} from "../../core/result/result.error.helper";

@injectable()
export class PostsService {
    postsRepository: PostsRepository;
    blogsRepository: BlogsRepository;
    extendedLikesRepository: ExtendedLikesRepository
    usersRepository: UsersRepository;

    constructor(
        @inject(PostsRepository) postsRepository: PostsRepository,
        @inject(BlogsRepository) blogsRepository: BlogsRepository,
        @inject(ExtendedLikesRepository) extendedLikesRepository: ExtendedLikesRepository,
        @inject(UsersRepository) usersRepository: UsersRepository,
    ) {
        this.postsRepository = postsRepository;
        this.blogsRepository = blogsRepository;
        this.extendedLikesRepository = extendedLikesRepository;
        this.usersRepository = usersRepository;
    }

    async createPost(dto: PostAttributes): Promise<string> {
        const blog = await this.blogsRepository.findBlogByIdOrFail(dto.blogId);
        if(!blog){
            throw new RepositoryNotFoundError("Blog does not exist");
        }
        const newPost = {
            title: dto.title,
            shortDescription: dto.shortDescription,
            content: dto.content,
            blogId: dto.blogId,
            blogName: blog.name,
            createdAt: new Date().toISOString(),
            extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: LikeStatus.none,
                newestLikes: []
            }
        }
        return await this.postsRepository.createPost(newPost);
    }
    async updatePost(id: string, dto: PostAttributes): Promise<void> {
        const post: PostDocument = await this.postsRepository.findPostByIdOrFail(id);
        if (post) {
            post.title = dto.title;
            post.shortDescription = dto.shortDescription;
            post.content = dto.content;
            post.blogId = dto.blogId;
            await this.postsRepository.save(post);
        }
    }
    async deletePost(id: string): Promise<void> {
        await this.postsRepository.deletePost(id);
    }
    async changeExtendedLikeStatus(postId: string, userId: string, likeStatus: LikeStatus): Promise<Result> {
        try{
            let post = await this.postsRepository.findPostByIdOrFail(postId);
            if(!post){
                return ResultObject.NotFound('postId', 'Post with this Id is not exist');
            }
            if(!Object.values(LikeStatus).includes(likeStatus)) {
                return ResultObject.BadRequest('likeStatus', 'LikeStatus isn\'t valid!');
            }
            const extendedLike = await this.extendedLikesRepository.findByUserIdAndPostId(userId, postId);
            if(!extendedLike && likeStatus !== LikeStatus.none){
                const newLike = new ExtendedLikeModel({
                    addedAt: new Date().toISOString(),
                    status: likeStatus,
                    userId: userId,
                    postId: postId,
                });
                await this.extendedLikesRepository.save(newLike);
                if(likeStatus === LikeStatus.like){
                    post.extendedLikesInfo.likesCount++;
                }
                if(likeStatus === LikeStatus.dislike){
                    post.extendedLikesInfo.dislikesCount++;
                }
            }
            if(extendedLike){
                if(likeStatus === extendedLike.status){
                    return ResultObject.NoContent();
                }
                if(likeStatus === LikeStatus.dislike){
                    extendedLike.status = likeStatus;
                    post.extendedLikesInfo.likesCount--;
                    post.extendedLikesInfo.dislikesCount++;
                    await this.extendedLikesRepository.save(extendedLike);
                }
                if(likeStatus === LikeStatus.like){
                    extendedLike.status = likeStatus;
                    post.extendedLikesInfo.likesCount++;
                    post.extendedLikesInfo.dislikesCount--;
                    await this.extendedLikesRepository.save(extendedLike);
                }
                if(likeStatus === LikeStatus.none){
                    await this.extendedLikesRepository.deleteExtendedLike(extendedLike._id.toString());
                    if(extendedLike.status === LikeStatus.dislike){
                        post.extendedLikesInfo.dislikesCount--;
                    }
                    if(extendedLike.status === LikeStatus.like){
                        post.extendedLikesInfo.likesCount--;
                    }
                }
            }
            post = await this.updateNewestLikesForPost(post);
            await this.postsRepository.save(post);
            return ResultObject.NoContent();

        } catch(err){
            const errorResult = ResultErrorHelper.toResult(err);
            return errorResult|| ResultObject.InternalServerError('Unknown error');
        }
    }
    async updateNewestLikesForPost(post: PostDocument): Promise<PostDocument> {
        const newestLikes = await this.extendedLikesRepository.findLastExtendedLikesByPostId(post.id);
        if(!newestLikes || newestLikes.length === 0){
            post.extendedLikesInfo.newestLikes = [];
            return post;
        }
        const usersIds = newestLikes.map(like => like.userId);
        const usersLoginsMap = await this.usersRepository.findUsersLoginByIds(usersIds);

        if(!usersLoginsMap){
            post.extendedLikesInfo.newestLikes = [];


            return post;
        }
        const newestLikesWithLogins = newestLikes.map(like => ({
            addedAt: like.addedAt,
            userId: like.userId,
            login: usersLoginsMap.get(like.userId)||'Unknown',
        }))
        post.extendedLikesInfo.newestLikes = newestLikesWithLogins;
        return post;
    }
}
