import { Resolver, Query, Args } from '@nestjs/graphql'

import {
    GetAvailableItems_Payload,
    GetAvailableCountries_Payload,
    GetAvailableCountryItems_Payload,
    GetAvailableItemCountries_Payload,

    GetAvailableItemCountries_Args,
    GetAvailableCountryItems_Args,
} from './_schema/type-defs'

@Resolver()
export default class ItemsStateModule_Resolver {
    constructor() {}

    /* * * * * ITEM FIRST APPROACH * * * * */

    @Query(() => GetAvailableItems_Payload)
    async availableItems(): Promise<GetAvailableItems_Payload> {
        return { data: [] }
    }

    @Query(() => GetAvailableItemCountries_Payload)
    async availableItemCountries(
        @Args() args: GetAvailableItemCountries_Args,
    ): Promise<GetAvailableItemCountries_Payload> {
        return { data: [] }
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
