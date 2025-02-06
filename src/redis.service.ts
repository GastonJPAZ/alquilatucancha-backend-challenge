import { Inject,Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly client: RedisClientType;

    constructor(
        @Inject('REDIS') redisClient: RedisClientType
    ) {
        this.client = redisClient;
    }

    onModuleInit() {
        this.client.connect().catch(console.error);

        this.client.on('error', (err) => {
            console.log("Error " + err);
        });
    }

    onModuleDestroy() {
        this.client.quit();
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        try {
            if (ttl) {
                await this.client.set(key, value, { EX: ttl });
            } else {
                await this.client.set(key, value);
            }
        } catch (err) {
            console.error("Error setting value in Redis:", err);
            throw err;
        }
    }

    async get(key: string): Promise<string | null> {
        try {
            return await this.client.get(key);
        } catch (err) {
            console.error("Error getting value from Redis:", err);
            throw err;
        }
    }


    async del(key: string): Promise<void> {
        try {
            await this.client.del(key);
        } catch (err) {
            console.error("Error deleting key in Redis:", err);
            throw err;
        }
    }
}