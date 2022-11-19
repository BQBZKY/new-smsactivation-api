import { Injectable } from '@nestjs/common'
import { formatRFC3339 } from 'date-fns'
import { range } from 'lodash'
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
    page?: number
}

type GetMessagesResponseData = {
    messages: {
        data: {
            text: string
            in_number: string
            created_at: string
        }[]
        from: number
        // to: number
        total: number
        per_page: number
        // current_page: number
        // last_page: number
    }
}

type GetMessagesPaginationOptions = {
    cursor?: number
    limit: number
}

export class PhoneNumberNotFoundError extends Error {}

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

    async getMessages(
        phoneNumber: string,
        paginationOptions: GetMessagesPaginationOptions,
    ) {
        const params: GetMessagesRequestParams = await (
            async () => {
                const { callingCode: cc } =
                    await this.freePhoneNumbersService.getPhoneNumbers().then(
                        phoneNumbers => phoneNumbers.find(
                            obj => obj.phoneNumber === phoneNumber
                        )!
                    ).then(
                        result => {
                            if (!result) {
                                throw new PhoneNumberNotFoundError()
                            }
                            return result
                        }
                    )

                return {
                    country: parseInt(cc),
                    phone: phoneNumber.replace(cc, '')
                }
            }
        )()

        const { cursor, limit = 50 } = paginationOptions
        const { total, perPage } = FreeMessagesService.parsePaginationInfo(
            await FreeMessagesService.request(params)
        )

        let start = 0
        let end = limit

        if (cursor) {
            start = total - cursor
            end = start + limit

            if (end > total) {
                end = total
            }
        }

        const pages = range(
            Math.ceil((start + 1) / perPage),
            Math.ceil((end + 1) / perPage),
        )

        return await Promise.all(
            pages.map(
              page => FreeMessagesService.request({ ...params, page })
            )
        ).then(
            data => data.map(
                FreeMessagesService.parseMessages
            ).flat()
        )
    }

    static async request(params: GetMessagesRequestParams) {
        const url = new URL('https://onlinesim.ru/api/getFreeMessageList?lang=en')

        for (const key in params) {
            const value = params[key as keyof typeof params]!.toString()
            url.searchParams.set(key, value)
        }

        const response = await fetch(url)
        const data = await response.json() as GetMessagesResponseData

        return data
    }

    static parsePaginationInfo(data: GetMessagesResponseData) {
        return {
            total: data.messages.total,
            offset: data.messages.from - 1,
            perPage: data.messages.per_page,
        }
    }

    static parseMessages(data: GetMessagesResponseData) {
        const { total, offset } = FreeMessagesService.parsePaginationInfo(data)

        let id = total - offset

        return data.messages.data.map(({
            text:           message,
            in_number: receivedFrom,
            created_at:  receivedAt,
        }) => ({
            id: id--,
            message: message.replace(/received from onlinesim.ru/i, "").trim(),
            receivedFrom,
            receivedAt: formatRFC3339(new Date(receivedAt))
        }))
    }
}
