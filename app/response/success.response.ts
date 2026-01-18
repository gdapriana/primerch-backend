import type { SuccessResponseType } from "../type/response.type";

export class SuccessReponse {
  static REGISTER: SuccessResponseType = {
    message: "register successfully",
    status: 200,
    success: true,
  };
  static LOGIN: SuccessResponseType = {
    message: "login successfully",
    status: 200,
    success: true,
  };
  static LOGOUT: SuccessResponseType = {
    message: "logout successfully",
    status: 200,
    success: true,
  };
  static QUERY_ITEM: SuccessResponseType = {
    message: "query item successfully",
    status: 200,
    success: true,
  };
  static GET_ITEM: SuccessResponseType = {
    message: "get item successfully",
    status: 200,
    success: true,
  };
  static POST_ITEM: SuccessResponseType = {
    message: "create item successfully",
    status: 200,
    success: true,
  };
  static PATCH_ITEM: SuccessResponseType = {
    message: "update item successfully",
    status: 200,
    success: true,
  };
  static DELETE_ITEM: SuccessResponseType = {
    message: "delete item successfully",
    status: 200,
    success: true,
  };
}
