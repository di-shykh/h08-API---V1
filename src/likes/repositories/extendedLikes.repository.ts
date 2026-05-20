import {injectable} from "inversify";
import {ExtendedLikeModel, ExtendedLikeDocument} from "../domain/extendedLike.entity";
import {DeleteResult} from "mongoose";

@injectable()
export class ExtendedLikesRepository {
    async save(extendedLike: ExtendedLikeDocument): Promise<void> {
        await extendedLike.save();
    }
    async createExtendedLike(extendedLike: ExtendedLikeDocument): Promise<string> {
        const result = await ExtendedLikeModel.create(extendedLike);
        return result._id.toString();
    }
    async deleteExtendedLike(id: string): Promise<DeleteResult> {
        return ExtendedLikeModel.deleteOne({_id: id});
    }
    async findByUserIdAndPostId(userId: string, postId: string): Promise<ExtendedLikeDocument | null> {
        const result = await ExtendedLikeModel.findOne({
            userId: userId,
            postId: postId,
        })
        return result;
    }
    async findLastExtendedLikesByPostId(postId: string): Promise<ExtendedLikeDocument[] | null> {
        const result = await ExtendedLikeModel
            .find({
                postId: postId,
                status: 'Like',
            })
            .sort({ addedAt: -1 })
            .limit(3);
        return result;
    }
}