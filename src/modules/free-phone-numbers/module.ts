import { Module } from '@nestjs/common'
import { FreePhoneNumbersResolver } from './schema'
import { FreePhoneNumbersService, FreeMessagesService } from './service'

@Module({
    providers: [
        FreePhoneNumbersResolver,
        FreePhoneNumbersService,
        FreeMessagesService,
    ],
})
export class FreePhoneNumbersModule {}
