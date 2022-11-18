import { Injectable } from '@nestjs/common'
import { formatRFC3339 } from 'date-fns'

import fetch from 'node-fetch'

type GetPhoneNumbersResponseData = {
    numbers: {
        full_number: string
        maxdate: string
        country: number
    }[]
}

type GetMessagesRequestParams = {
    country: number | string
    phone: string
}

type GetMessagesResponseData = {
    messages: {
        data: {
            text: string
            in_number: string
            created_at: string
        }[]
    }
}

@Injectable()
export class FreePhoneNumbersService {
    async getPhoneNumbers() {
        const response = await fetch('https://onlinesim.ru/api/getFreePhoneList?lang=en')
        const data = await response.json() as GetPhoneNumbersResponseData

        return data.numbers.map(({
            full_number: phoneNumber,
            maxdate:     activatedAt,
            country: cc,
        }) => ({
            callingCode: `+${cc}`,
            phoneNumber,
            activatedAt: formatRFC3339(new Date(activatedAt)),
        }))
    }
}

@Injectable()
export class FreeMessagesService {
    constructor(
        private readonly freePhoneNumbersService: FreePhoneNumbersService,
    ) {}

    async getMessages(phoneNumber: string) {
        const params: GetMessagesRequestParams = await (
            async () => {
                const { callingCode: cc } =
                    await this.freePhoneNumbersService.getPhoneNumbers().then(
                        phoneNumbers => phoneNumbers.find(
                            obj => obj.phoneNumber === phoneNumber
                        )!
                    )

                return {
                    country: parseInt(cc),
                    phone: phoneNumber.replace(cc, '')
                }
            }
        )()

        const url = new URL('https://onlinesim.ru/api/getFreeMessageList?lang=en')

        for (const key in params) {
            const value = params[key as keyof typeof params]!.toString()
            url.searchParams.set(key, value)
        }

        const response = await fetch(url)
        const data = await response.json() as GetMessagesResponseData

        return data.messages.data.map(({
            text:           message,
            in_number: receivedFrom,
            created_at:  receivedAt,
        }) => ({
            message: message.replace(/received from onlinesim.ru/i, "").trim(),
            receivedFrom,
            receivedAt: formatRFC3339(new Date(receivedAt))
        }))
    }
}
