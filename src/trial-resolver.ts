import { Resolver, Query } from '@nestjs/graphql'

@Resolver()
export class TrialResolver {
    @Query() greeting() {
        return 'Hello, World!'
    }
}
