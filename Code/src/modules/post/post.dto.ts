import z from "zod";
import { creatPost, deletePost, getPostsGQL, updatePost } from "./post.validation";

export type createPostDTO = z.infer<typeof creatPost>
export type updatePostDTO = z.infer<typeof updatePost>
export type getPostDTO = z.infer<typeof deletePost>
export type getPostsDTO = z.infer<typeof getPostsGQL>