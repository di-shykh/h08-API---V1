import {LikeStatus} from "../../../likes/types/likeStatus";

export type CommentDB = {
    // id: string;
    content: string;
    userId: string;
    postId: string;
    createdAt: string;
    likesCount: number;
    dislikesCount: number;
}