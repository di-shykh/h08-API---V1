import {Router, Request, Response} from 'express';
import {HttpStatus} from "../../core/types/http-statuses";
import {BlogModel} from '../../blogs/domain/blog.entity'
import {PostModel} from "../../posts/domain/post.entity";
import {CommentModel} from "../../comments/domain/comment.entity";
import {UserModel} from "../../users/domain/user.entity";
import {SessionModel} from "../../securityDevices/domain/session.entity";
import {RateLimitModel} from "../../auth/domain/rate-limit.entity";
import {PasswordRecoveryModel} from "../../auth/domain/password-recovery.entity";

export const testingRouter: Router = Router({});

testingRouter.delete('/all-data',async (req: Request, res: Response): Promise<void> => {
    console.log('✅ Testing endpoint called');
    // для диагностики
    try{
        await Promise.all([
            BlogModel.deleteMany(),
            PostModel.deleteMany(),
            UserModel.deleteMany(),
            CommentModel.deleteMany(),
            SessionModel.deleteMany(),
            RateLimitModel.deleteMany(),
            PasswordRecoveryModel.deleteMany(),
        ])
    }
    catch(err){
        console.log(err);
    }
    res.sendStatus(HttpStatus.NoContent);
})