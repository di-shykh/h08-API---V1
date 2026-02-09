import {Response, Request} from "express";
import {UserQueryInput} from "./input/user-query.input";
import {matchedData} from "express-validator";
import {setDefaultSortAndPaginationIfNotExist} from "../../core/helpers/set-default-sort-and-pagination";
import {HttpStatus} from "../../core/types/http-statuses";
import {errorHandler} from "../../core/errors/error.handler";
import {UserOutput} from "./output/user-output";
import {UsersQueryRepository} from "../repositories/user.query-repository";
import {UsersService} from "../application/user.services";

export class UserController {
    usersQueryRepository: UsersQueryRepository;
    usersService: UsersService;

    constructor(usersQueryRepository: UsersQueryRepository, usersService: UsersService) {
        this.usersQueryRepository = usersQueryRepository;
        this.usersService = usersService;
    }

    async getUserList(req: Request, res: Response) {
        try{
            const query = req.query as unknown as UserQueryInput;
            const sanitizedQuery = matchedData<UserQueryInput>(req, {
                locations: ['query'],
                includeOptionals: true,
            });
            const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);
            const {items, totalCount} = await this.usersQueryRepository.findManyUsers(queryInput);
            const userListOutput = this.usersQueryRepository.mapToUserListPaginatedOutput(items,
                queryInput.pageNumber,
                queryInput.pageSize,
                totalCount,);
            res.status(HttpStatus.Ok).send(userListOutput);
        } catch (e: unknown) {
            errorHandler(e, res);
        }
    }
    async createUser(req: Request, res: Response) {
        try {
            const createdUser = await this.usersService.createUser(req.body);
            const insertedUser = await this.usersQueryRepository.findUserByIdOrFail(createdUser);
            const userOutput: UserOutput = this.usersQueryRepository.mapToUserOutput(insertedUser);
            res.status(HttpStatus.Created).send(userOutput);
        }catch(e: unknown) {
            errorHandler(e,res);
        }
    }
    async deleteUser(req: Request, res: Response) {
        try{
            const id: string = req.params.id as string;
            const deletedUser = await this.usersService.deleteUser(id);
            res.sendStatus(HttpStatus.NoContent);
        } catch (e: unknown) {
            errorHandler(e,res);
        }
    }
}
