import {LikeStatus} from "./likeStatus";

export type Like = {
    createdAt: Date,
    status: LikeStatus,
    authorId: string,
    parentId: string,
}