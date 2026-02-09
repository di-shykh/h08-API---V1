import {UserCreateInput} from "../routes/input/create-user.input";
import {UserDB} from "../routes/output/user.db";
import {DuplicateFieldError} from "../../core/errors/duplicateField.error";
import {BcryptService} from "../../auth/adapters/bcrypt.service";
import {UsersQueryRepository} from "../repositories/user.query-repository";
import {UsersRepository} from "../repositories/user.repository";

export class UsersService {
    usersQueryRepository: UsersQueryRepository;
    bcryptService: BcryptService;
    usersRepository: UsersRepository;

    constructor(
        usersQueryRepository: UsersQueryRepository,
        bcryptService: BcryptService,
        usersRepository: UsersRepository,
    ) {
        this.bcryptService = bcryptService;
        this.usersRepository = usersRepository;
        this.usersQueryRepository = usersQueryRepository;
    }

    async createUser(userInputDto: UserCreateInput): Promise<string> {
        const {login, email, password} = userInputDto;
        const isLoginUnique = await this.usersQueryRepository.isLoginUnique(login);
        if (!isLoginUnique) {
            throw new DuplicateFieldError("login");
        }
        const isEmailUnique = await this.usersQueryRepository.isEmailUnique(email);
        if (!isEmailUnique) {
            throw new DuplicateFieldError("email");
        }
        const passwordHash: string = await this.bcryptService.generateHash(password);

        const newUser: UserDB = {
            login,
            email,
            passwordHash,
            createdAt: new Date().toISOString(),
        }
        const newUserId = await this.usersRepository.createUser(newUser);
        return newUserId;
    }
    async deleteUser(id: string): Promise<void> {
        await this.usersRepository.deleteUser(id);
    }
}
