import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'

import { TrialResolver } from './trial-resolver'

import path from 'node:path'

@Module({
    imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            typePaths: [path.resolve(__dirname, 'schema.graphql')],
        }),
    ],
    providers: [TrialResolver],
})
export class MainModule {}
