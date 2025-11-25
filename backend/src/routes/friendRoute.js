import express from "express";
import {
  acceptFriend,
  sendFriendRequest,
  cancelFriendRequest,
  getAllFriends,
  getFriendRequest,
  cancelFriend,
} from "../controllers/friendController.js";

const router = express.Router();

router.post("/requests", sendFriendRequest);
router.post("/requests/:requestId/accept", acceptFriend);
router.post("/requests/:requestId/cancel", cancelFriendRequest);
router.post("/requests/cancel", cancelFriend);

router.get("/", getAllFriends);
router.get("/requests", getFriendRequest);

export default router;