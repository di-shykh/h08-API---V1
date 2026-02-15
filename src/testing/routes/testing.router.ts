import {Router, Request, Response} from 'express';
import {HttpStatus} from "../../core/types/http-statuses";
import {
    blogCollection,
    commentCollection,
    postCollection,
    rateLimitCollection,
    sessionCollection,
    userCollection
} from "../../db/mongo.bd";

export const testingRouter: Router = Router({});

testingRouter.delete('/all-data',async (req: Request, res: Response): Promise<void> => {
    console.log('✅ Testing endpoint called');
    // для диагностики
    try{
        await Promise.all([
            blogCollection.deleteMany(),
            postCollection.deleteMany(),
            userCollection.deleteMany(),
            commentCollection.deleteMany(),
            sessionCollection.deleteMany(),
            rateLimitCollection.deleteMany(),
            postCollection.deleteMany(),
        ])
    }
    catch(err){
        console.log(err);
    }

    res.sendStatus(HttpStatus.NoContent);
})