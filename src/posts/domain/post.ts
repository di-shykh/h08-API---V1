export type Post = {
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: string;
    extendedLikesInfo: {
        likesCount: number;
        dislikesCount: number;
        newestLikes: {
            addedAt: string;
            userId: string;
            login: string;
        }[];
    }
}