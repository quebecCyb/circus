import { IRequest } from "src/interfaces/IRequest";

export function getIP(req: IRequest){
    return req.headers['x-forwarded-for'] || req.ip
}
