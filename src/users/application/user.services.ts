import {UserCreateInput} from "../routes/input/create-user.input";
import {DuplicateFieldError} from "../../core/errors/duplicateField.error";
import {BcryptService} from "../../auth/adapters/bcrypt.service";
import {UsersRepository} from "../repositories/user.repository";
import { inject, injectable } from 'inversify';
import {UserModel} from "../domain/user.entity";

@injectable()
export class UsersService {
    bcryptService: BcryptService;
    usersRepository: UsersRepository;

    constructor(
        @inject(BcryptService) bcryptService: BcryptService,
        @inject(UsersRepository) usersRepository: UsersRepository,
    ) {
        this.bcryptService = bcryptService;
        this.usersRepository = usersRepository;
    }

    async createUser(userInputDto: UserCreateInput): Promise<string> {
        const {login, email, password} = userInputDto;
        const isLoginUnique: boolean = await this.usersRepository.isLoginUnique(login);
        if (!isLoginUnique) {
            throw new DuplicateFieldError("login");
        }
        const isEmailUnique: boolean = await this.usersRepository.isEmailUnique(email);
        if (!isEmailUnique) {
            throw new DuplicateFieldError("email");
        }
        const passwordHash: string = await this.bcryptService.generateHash(password);

        const newUser = new UserModel();
        newUser.login = login;
        newUser.email = email;
        newUser.passwordHash = passwordHash;
        newUser.createdAt = new Date().toISOString();

        const newUserId = await this.usersRepository.createUser(newUser);
        return newUserId;
    }
    async deleteUser(id: string): Promise<void> {
        await this.usersRepository.deleteUser(id);
    }
}
