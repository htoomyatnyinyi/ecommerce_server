import express from "express";
import {
  createUser,
  createPost,
  createComment,
  allPost,
  updateComment,
} from "../controllers/post";

const router = express.Router();

router.post("/user", createUser);
router.post("/post", createPost);
router.post("/comment", createComment);
router.put("/comment/:id", updateComment);
router.get("/", allPost);

export default router;
