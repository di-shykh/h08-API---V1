import {BcryptService} from "./auth/adapters/bcrypt.service";
import {EmailAdapter} from "./auth/adapters/email.adapter";
import {AuthService} from "./auth/application/auth.service";
import {JwtService} from "./auth/application/jwt.service";
import {AuthController} from "./auth/routes/auth.controller";
import {SecurityService} from "./securityDevices/application/security.services";
import {SessionQueryRepository} from "./securityDevices/repositories/session.query-repository";
import {SessionRepository} from "./securityDevices/repositories/session.repository";
import {SecurityController} from "./securityDevices/routes/security.controller";
import {UsersService} from "./users/application/user.services";
import {UsersQueryRepository} from "./users/repositories/user.query-repository";
import {UsersRepository} from "./users/repositories/user.repository";
import {UserController} from "./users/routes/user.controller";
import {BlogsService} from "./blogs/application/blog.service";
import {BlogsQueryRepository} from "./blogs/repositories/blogs.query-repository";
import {BlogsRepository} from "./blogs/repositories/blogs.repository";
import {BlogsController} from "./blogs/routes/blogs.controller";
import {CommentsController} from "./comments/routes/comments.controller";
import {CommentsService} from "./comments/application/comment.services";
import {CommentsQueryRepository} from "./comments/repositories/comments.query-repository";
import {CommentsRepository} from "./comments/repositories/comments.repository";
import {PostsController} from "./posts/routes/posts.controller";
import {PostsQueryRepository} from "./posts/repositories/posts.query-repository";
import {PostsRepository} from "./posts/repositories/posts.repository";
import {PostsService} from "./posts/application/post.services";

export const bcryptService = new BcryptService();
export const emailAdapter = new EmailAdapter();
export const jwtService = new JwtService();
export const sessionRepository = new SessionRepository();
export const sessionQueryRepository = new SessionQueryRepository();
export const usersQueryRepository = new UsersQueryRepository();
export const usersRepository = new UsersRepository();
export const blogsQueryRepository = new BlogsQueryRepository();
export const blogsRepository = new BlogsRepository();
export const commentsQueryRepository = new CommentsQueryRepository();
export const commentsRepository = new CommentsRepository();
export const postsQueryRepository = new PostsQueryRepository();
export const postsRepository = new PostsRepository();
export const authService = new AuthService(bcryptService,jwtService,emailAdapter,sessionRepository,usersRepository);

export const securityService = new SecurityService(jwtService, sessionRepository);
export const authController = new AuthController(authService,jwtService, securityService, sessionQueryRepository,usersQueryRepository);

export const securityController = new SecurityController(sessionQueryRepository,securityService);
export const usersService = new UsersService(bcryptService, usersRepository);
export const userController = new UserController(usersQueryRepository, usersService);
export const postsService = new PostsService(postsRepository,blogsRepository);

export const commentsService = new CommentsService(commentsRepository,postsRepository);
export const blogsService = new BlogsService(blogsRepository, postsRepository);
export const blogsController = new BlogsController(blogsQueryRepository,blogsService,postsQueryRepository,postsService);
export const commentsController = new CommentsController(commentsQueryRepository,commentsService);
export const postsController = new PostsController(postsQueryRepository,postsService,commentsService,commentsQueryRepository);

