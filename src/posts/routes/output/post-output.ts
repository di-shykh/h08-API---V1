import {LikeStatus} from "../../../likes/types/likeStatus";

export type PostOutput = {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: string;
    extendedLikesInfo: {
        likesCount: number;
        dislikesCount: number;
        myStatus: LikeStatus;
        newestLikes: {
            addedAt: string;
            userId: string;
            login: string;
        }[];
    }
}