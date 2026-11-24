import z from "zod";
import { createPost, update } from "../post.validation.js";


export type CreatePostDto=z.infer<ReturnType<typeof createPost>>
export type UpdatePostDto=z.infer<ReturnType<typeof update>>
