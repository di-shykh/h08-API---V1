import {CommentatorInfo} from "../../types/commentator-info";
import {LikeStatus} from "../../../likes/types/likeStatus";

export type CommentOutput = {
    id: string;
    content: string;
    commentatorInfo: CommentatorInfo;
    createdAt: string;
    likesInfo: {
        likesCount: number,
        dislikesCount: number,
        myStatus: LikeStatus
    }
}