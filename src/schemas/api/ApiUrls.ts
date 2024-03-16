export enum ApiUrl {
    AUTH = '/api/Auth',
    VEHICLES = '/api/Vehicles',
    VEHICLE_RECORDS = '/api/Vehicles/<VIN>/Records',
    RECORDS = '/api/Record',
    SIMILAR = '/api/Record/Similar/<ID>',
}

export enum ApiMethods {
    GET = 'get',
    PUT = 'put',
    DELETE = 'delete',
    POST = 'post'
}
