import { RoleEnum } from "../../common/enum";

export const endPoint = {
    SensiveAuth : [RoleEnum.ADMIN , RoleEnum.SUPERVISER],
    generalAuth : [RoleEnum.ADMIN , RoleEnum.SUPERVISER , RoleEnum.USER]
}