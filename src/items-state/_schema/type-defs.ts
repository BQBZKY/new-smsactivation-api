import {
    ObjectType,
    ArgsType,
    Field,
    ID,
} from '@nestjs/graphql'

import {
    CountryCodeResolver as CountryCode,
} from 'graphql-scalars'

@ObjectType()
export class Item {
    @Field()
    name!: string

    @Field(() => ID)
    id!: string
}

@ObjectType()
export class Country {
    @Field()
    country!: string

    @Field(() => CountryCode)
    countryCode!: string
}

/* * * * * ARGS TYPES * * * * */

@ArgsType()
export class GetAvailableItemCountries_Args {
    @Field(() => ID)
    itemId!: string
}

@ArgsType()
export class GetAvailableCountryItems_Args {
    @Field(() => CountryCode)
    countryCode!: string
}

/* * * * * PAYLOAD TYPES * * * * */

@ObjectType()
export class GetAvailableItems_Payload {
    @Field(() => [Item])
    data!: Item[]

    constructor(
        { data }: GetAvailableItems_Payload
    ) {
        this.data = data
    }
}

@ObjectType()
export class GetAvailableCountries_Payload {
    @Field(() => [Country])
    data!: Country[]
}

@ObjectType()
export class GetAvailableItemCountries_Payload {
    @Field(() => [Country])
    data!: Country[]

    constructor(
        { data }: GetAvailableItemCountries_Payload
    ) {
        this.data = data
    }
}

@ObjectType()
export class GetAvailableCountryItems_Payload {
    @Field(() => [Item])
    data!: Item[]
}
