import {
    Resolver,
    Query,
    Args,
    ObjectType,
    ArgsType,
    Field,
} from '@nestjs/graphql'

import {
    PositiveIntResolver as PositiveInt,
    PhoneNumberResolver as PhoneNumber,
    DateTimeResolver as DateTime,
} from 'graphql-scalars'

import { FreePhoneNumbersService, FreeMessagesService } from './service'

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
export class GetFreeMessagesArgs {
  @Field()
  phoneNumber!: string

  @Field(() => PositiveInt, {
    defaultValue: 50
  })
  limit!: number

  @Field(() => PositiveInt, {
    nullable: true
  })
  cursor?: number
}

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

    @Query(() => [FreeMessage])
    async freeMessages(
        @Args() { phoneNumber, ...pagination }: GetFreeMessagesArgs
    ) {
        return this.freeMessagesService.getMessages(phoneNumber, pagination)
    }
}
