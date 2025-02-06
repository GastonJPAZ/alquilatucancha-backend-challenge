/* eslint-disable */

import { RedisService } from '../../redis.service'

export interface FakeRedisService extends RedisService {
    onModuleInit: () => void;
    onModuleDestroy: () => void;
}