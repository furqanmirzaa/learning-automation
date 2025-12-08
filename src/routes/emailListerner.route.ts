

import axios from "axios";
import { Router } from "express";
import { simpleParser } from "mailparser";
import Imap from "node-imap";
import { emailListenerController } from "../controllers/emailListener.controller";

const router = Router()



router.post("/start-listener", (req, res) => {
    emailListenerController.startListener(req, res)
})

router.post("/stop-listener", (req, res) => {
    emailListenerController.stopListener(req, res)
})


export default router
