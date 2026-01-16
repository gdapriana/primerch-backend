import { ZodType } from "zod";

class Validation {
  static validate<T>(schema: ZodType, data: T): T {
    return schema.parse(data) as T;
  }
}

export default Validation;