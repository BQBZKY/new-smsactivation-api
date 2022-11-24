import { Resolver, Query, Args } from '@nestjs/graphql'

import {
    GetAvailableItems_Payload,
    GetAvailableCountries_Payload,
    GetAvailableCountryItems_Payload,
    GetAvailableItemCountries_Payload,

    GetAvailableItemCountries_Args,
    GetAvailableCountryItems_Args,
} from './_schema/type-defs'

import fetch from 'node-fetch'

import findCountryCode from '_utils/findCountryCode'

@Resolver()
export default class ItemsStateModule_Resolver {
    constructor() {}

    /* * * * * ITEM FIRST APPROACH * * * * */

    @Query(() => GetAvailableItems_Payload)
    async availableItems(): Promise<GetAvailableItems_Payload> {
        try {
            type ResponseData = {
                data: {
                    name: string
                    shortName: string
                }[]
            }

            const response = await fetch('https://sms-activate.org/stubs/apiMobile.php', {
                method: 'POST',
                headers: {
                    'Cookie': 'lang=en;'
                },
                body: new URLSearchParams({
                    action: 'getAllServicesDesktop',
                    render: 'true',
                })
            })

            const { data } = await response.json() as ResponseData

            return new GetAvailableItems_Payload({
                data: data.map(({
                    name,
                    shortName: id
                }) => ({
                    name,
                    id,
                }))
            })
        } catch {
            return { data: [] }
        }
    }

    @Query(() => GetAvailableItemCountries_Payload)
    async availableItemCountries(
        @Args() { itemId }: GetAvailableItemCountries_Args,
    ): Promise<GetAvailableItemCountries_Payload> {
        try {
            type ResponseData = {
                data: {
                    name: string
                }[]
            }

            const response = await fetch('https://sms-activate.org/stubs/apiMobile.php', {
                method: 'POST',
                headers: {
                    'Cookie': 'lang=en;'
                },
                body: new URLSearchParams({
                    action: 'countriesStackRender',
                    service: itemId,
                })
            })

            const { data } = await response.json() as ResponseData

            return new GetAvailableItemCountries_Payload({
                data: data.map(({
                    name: country,
                }) => ({
                    country,
                    countryCode: findCountryCode(country)!,
                })).filter(({ countryCode }) => !!countryCode)
            })
        } catch {
            return { data: [] }
        }
    }

    /* * * * * COUNTRY FIRST APPROACH * * * * */

    @Query(() => GetAvailableCountries_Payload)
    async availableCountries(): Promise<GetAvailableCountries_Payload> {
        return { data: [] }
    }

    @Query(() => GetAvailableCountryItems_Payload)
    async availableCountryItems(
        @Args() args: GetAvailableCountryItems_Args,
    ): Promise<GetAvailableCountryItems_Payload> {
        return { data: [] }
    }
}
