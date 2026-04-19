import { injectable } from 'inversify';
import {LikeModel, LikeDocument} from "../../likes/domain/like.entity";
import {DeleteResult} from "mongoose";

@injectable()
export class LikesRepository {
    async save(like: LikeDocument): Promise<void> {
        await like.save();
    }
    async createLike(like: LikeDocument): Promise<string> {
        const result = await LikeModel.create(like);
        return result._id.toString();
    }
    async deleteLike(id: string): Promise<DeleteResult> {
        return LikeModel.deleteOne({_id: id});
    }

}
