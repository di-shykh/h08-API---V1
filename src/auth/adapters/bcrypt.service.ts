import bcrypt from 'bcrypt';

export class bcryptService {
    static async generateHash(password: string) {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }
    static async checkPassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }
}