import {Request, Response} from 'express';
import {usersQueryRepository} from "../../../users/repositories/user.query-repository";
import {errorHandler} from "../../../core/errors/error.handler";
import {UserOutput} from "../../../users/routes/output/user-output";
import {WithId} from "mongodb";
import {User} from "../../../users/domain/user";
import {HttpStatus} from "../../../core/types/http-statuses";

export async function authGetHandler(req: Request, res: Response) {
    try {
        if (!req.userId) {
            return res.sendStatus(HttpStatus.Unauthorized);
        }
        const userId: string = req.userId;
        const user: WithId<User> = await usersQueryRepository.findUserByIdOrFail(userId);
        const userOutput: UserOutput = await usersQueryRepository.mapToUserOutput(user);
        const {createdAt, ...userWithoutCreatedAt} = userOutput;
        return res.status(HttpStatus.Ok).json(userWithoutCreatedAt);

    } catch (e: unknown) {
        errorHandler(e,res);
    }
}