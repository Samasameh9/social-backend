import z from "zod";
import { followRequestValidation } from "../user.validation.js";

export type FollowRequestDto=z.infer<ReturnType<typeof followRequestValidation>>['body']