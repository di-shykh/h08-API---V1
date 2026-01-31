import {loginGetToken} from "../login-get-token";
import {POSTS_PATH} from "../../../src/core/paths/paths";
import {HttpStatus} from "../../../src/core/types/http-statuses";
import {WithId} from "mongodb";
import {Post} from "../../../src/posts/domain/post";
import request from "supertest";
import {CommentInputDto} from "../../../src/comments/application/dtos/comment.input-dto";
import {Express} from "express";

export async function createComment(app: Express,token: string, postId: string, commentDto: CommentInputDto) {
    console.log("creating new comment...");
    const response = await request(app)
        .post(`${POSTS_PATH}/${postId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send(commentDto)
        .expect(HttpStatus.Created);
    console.log(`created ${response.body} new comment...`);
    return response.body
}