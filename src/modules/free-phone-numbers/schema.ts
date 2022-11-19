import {
    Resolver,
    Query,
    Args,
    ObjectType,
    ArgsType,
    Field,
    registerEnumType,
    createUnionType,
} from '@nestjs/graphql'

import {
    PositiveIntResolver as PositiveInt,
    PhoneNumberResolver as PhoneNumber,
    DateTimeResolver as DateTime,
} from 'graphql-scalars'

import {
    FreePhoneNumbersService,
    FreeMessagesService,
    PhoneNumberNotFoundError,
} from './service'

@ObjectType()
class FreePhoneNumber {
    @Field(() => PhoneNumber)
    phoneNumber!: string

    @Field(() => DateTime)
    activatedAt!: string
}

@ObjectType()
class FreeMessage {
    @Field(() => PositiveInt)
    id!: number

    @Field()
    message!: string

    @Field()
    receivedFrom!: string

    @Field(() => DateTime)
    receivedAt!: string
}

@ArgsType()
class GetFreeMessagesArgs {
    @Field()
    phoneNumber!: string

    @Field(() => PositiveInt, {
        defaultValue: 50,
    })
    limit!: number

    @Field(() => PositiveInt, {
        nullable: true,
    })
    cursor?: number
}

@ObjectType()
class GetFreeMessagesPayload {
    @Field(() => [FreeMessage])
    messages!: FreeMessage[]

    // @Field(() => PositiveInt, {
    //     nullable: true,
    // })
    // nextCursor?: number

    // @Field()
    // hasMore!: boolean
}

enum GetFreeMessagesErrorCode {
    PHONE_NUMBER_NOT_FOUND = 'PHONE_NUMBER_NOT_FOUND'
}
registerEnumType(GetFreeMessagesErrorCode, { name: 'GetFreeMessagesErrorCode' })

@ObjectType()
class GetFreeMessagesError {
    @Field(() => GetFreeMessagesErrorCode)
    error!: GetFreeMessagesErrorCode
}

const GetFreeMessagesResult = createUnionType({
    name: 'GetFreeMessagesResult',
    types: () => [GetFreeMessagesPayload, GetFreeMessagesError] as const,
    resolveType: (obj) => {
        if (obj.messages) {
            return GetFreeMessagesPayload
        }
        if (obj.error) {
            return GetFreeMessagesError
        }
        return null
    }
})

@Resolver()
export class FreePhoneNumbersResolver {
    constructor(
        private readonly freePhoneNumbersService: FreePhoneNumbersService,
        private readonly freeMessagesService: FreeMessagesService,
    ) {}

    @Query(() => [FreePhoneNumber])
    async freePhoneNumbers() {
        return this.freePhoneNumbersService.getPhoneNumbers()
    }

    @Query(() => GetFreeMessagesResult)
    async freeMessages(
        @Args() { phoneNumber, ...pagination }: GetFreeMessagesArgs
    ): Promise<typeof GetFreeMessagesResult> {
        try {
            return {
                messages: await this.freeMessagesService.getMessages(phoneNumber, pagination),
            }
        } catch(error) {
            if (error instanceof PhoneNumberNotFoundError) {
                return {
                    error: GetFreeMessagesErrorCode.PHONE_NUMBER_NOT_FOUND
                }
            }
            throw error
        }
    }
}
