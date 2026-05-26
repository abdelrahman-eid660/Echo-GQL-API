import z from "zod";
import { createStoryGQL, deleteStoryGQL, getStoriesGQL, watchStoryGQL, getUserStoriesGQL, getViewerAndReactsStoriesGQL, updateStoryGQL } from "./story.validation";

export type createStoryDTO = z.infer<typeof createStoryGQL>
export type updateStoryDTO = z.infer<typeof updateStoryGQL>
export type watchStoryDTO = z.infer<typeof watchStoryGQL>
export type getStoriesDTO = z.infer<typeof getStoriesGQL>
export type getUserStoriesDTO = z.infer<typeof getUserStoriesGQL>
export type getViewerAndReactsStoriesDTO = z.infer<typeof getViewerAndReactsStoriesGQL>
export type deleteStoryDTO = z.infer<typeof deleteStoryGQL>