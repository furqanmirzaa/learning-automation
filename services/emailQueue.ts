import { Queue } from "bullmq";
import { redisConfig } from "../config/redis";


export const emailQueue = new Queue("email-jobs", {
  connection: redisConfig
});
