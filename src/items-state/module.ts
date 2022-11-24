import { Module } from '@nestjs/common'
import Resolver from './resolver'

@Module({
    providers: [Resolver]
})
export default class ItemsStateModule {}
