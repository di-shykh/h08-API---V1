import {Response, Request} from 'express';
import {Result, ResultObject} from "../../core/result/result.type";
import {resultCodeToHttpException} from "../../core/result/resultCodeToHttpExeptions";
import {HttpStatus} from "../../core/types/http-statuses";
import {errorHandler} from "../../core/errors/error.handler";
import {ResultStatus} from "../../core/result/result.code";
import {CommentInputDto} from "../application/dtos/comment.input-dto";
import {CommentsQueryRepository} from "../repositories/comments.query-repository";
import {CommentsService} from "../application/comment.services";
import { inject, injectable } from 'inversify';
import {LikeStatus} from "../../likes/types/likeStatus";

@injectable()
export class CommentsController {
    commentsQueryRepository: CommentsQueryRepository;
    commentsService: CommentsService;

    constructor(
        @inject(CommentsQueryRepository) commentsQueryRepository: CommentsQueryRepository,
        @inject(CommentsService) commentsService: CommentsService
    ) {
        this.commentsQueryRepository = commentsQueryRepository;
        this.commentsService = commentsService;
    }

    async getComment(req: Request, res: Response) {
        try{
            const id = req.params.id as string;
            const userId = req.userId;
            const comment = await this.commentsQueryRepository.findCommentById(id);
            if (!comment) {
                const result = ResultObject.NotFound('commentId', 'Comment with this Id is not exist');
                res.status(resultCodeToHttpException(result.status)).json({
                    errorsMessages: result.extensions
                });
                return;
            }
            const commentOutput = await this.commentsQueryRepository.mapToCommentOutput(comment, userId);
            const result = ResultObject.Success(commentOutput);
            res.status(HttpStatus.Ok).json(result.data);

        } catch (e) {
            errorHandler(e,res);
        }
    }
    async deleteComment(req: Request, res: Response) {
        try {
            const id: string = req.params.id as string;
            const userId: string = req.userId as string;
            const result: Result = await this.commentsService.deleteComment(userId, id);
            if (result.status === ResultStatus.Forbidden) {
                res.status(resultCodeToHttpException(ResultStatus.Forbidden)).json({
                    errorsMessages: result.errorMessage,
                });
                return;
            }
            if (result.status === ResultStatus.NotFound) {
                res.status(resultCodeToHttpException(ResultStatus.NotFound)).json({
                    errorsMessages: result.errorMessage,
                })
                return;
            }
            if(result.status === ResultStatus.NoContent) {
                res.sendStatus(HttpStatus.NoContent);
            }
        } catch (e) {
            errorHandler(e,res);
        }
    }
    async updateComment(req: Request, res: Response) {
        try {
            const commentId: string = req.params.id as string;
            const userId: string = req.userId as string;
            const content: CommentInputDto = req.body;

            const result = await this.commentsService.updateComment(commentId, userId, content)
            if (result.status === ResultStatus.Forbidden) {
                res.status(resultCodeToHttpException(ResultStatus.Forbidden)).json({
                    errorsMessages: result.errorMessage,
                });
                return;
            }
            if (result.status === ResultStatus.NotFound) {
                res.status(resultCodeToHttpException(ResultStatus.NotFound)).json({
                    errorsMessages: result.errorMessage,
                })
                return;
            }
            if(result.status === ResultStatus.NoContent) {
                res.sendStatus(HttpStatus.NoContent);
            }
        } catch (e) {
            errorHandler(e,res);
        }
    }
    async changeLikeStatus(req: Request, res: Response) {
        try {
            const commentId: string = req.params.id as string;
            const userId: string | undefined = req.userId;
            const likeStatus: LikeStatus = req.body.likeStatus;
            if(!userId){
               res.status(HttpStatus.Unauthorized).json({
                   errorsMessages: [{ message: 'User not authorized', field: 'authorization' }]
               });
               return;
            }
            if (!likeStatus || !Object.values(LikeStatus).includes(likeStatus)) {
                res.status(HttpStatus.BadRequest).json({
                    errorsMessages: [{ message: 'Invalid likeStatus', field: 'likeStatus' }]
                });
                return;
            }
            const result = await this.commentsService.changeLikeStatus(commentId, userId, likeStatus)
            if (result.status === ResultStatus.Forbidden) {
                res.status(resultCodeToHttpException(ResultStatus.Forbidden)).json({
                    errorsMessages: result.errorMessage,
                });
                return;
            }
            if (result.status === ResultStatus.NotFound) {
                res.status(resultCodeToHttpException(ResultStatus.NotFound)).json({
                    errorsMessages: result.errorMessage,
                })
                return;
            }
            if(result.status === ResultStatus.NoContent) {
                res.sendStatus(HttpStatus.NoContent);
            }
        } catch (e) {
            errorHandler(e,res);
        }
    }
}
