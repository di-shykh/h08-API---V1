import {LikeStatus} from "./likeStatus";

export type ExtendedLike = {
    addedAt: string,
    status: LikeStatus,
    userId: string,
    postId: string,
}