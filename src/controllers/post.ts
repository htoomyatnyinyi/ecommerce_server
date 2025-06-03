import { Request, Response } from "express";
import prisma from "../config/database";

interface UserRequest {
  username: string;
  email: string;
  password: string;
  bio: string;
  post?: PostRequest[]; // Made optional as it might not always be provided
}
interface PostRequest {
  content: string;
}
interface CommentRequest {
  comment: string;
}

export const createUser = async (
  req: Request<{}, {}, UserRequest>,
  res: Response
): Promise<any> => {
  const { username, email, password, bio, post } = req.body;
  console.log(req.body);
  try {
    const userResponse = await prisma.user.create({
      data: {
        username,
        email,
        password,
        bio,
        post: {
          create: post?.map((p) => ({
            content: p.content,
          })),
        },
      },
    });
    return res.status(201).json(userResponse);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create user" });
  }
};

export const createPost = async (
  req: Request<{}, {}, PostRequest & { userId: string }>,
  res: Response
): Promise<any> => {
  try {
    const { content, userId } = req.body;
    const postResponse = await prisma.post.create({
      data: {
        content,
        userId,
      },
    });
    return res.status(201).json(postResponse);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create post" });
  }
};

export const createComment = async (
  req: Request<{}, {}, CommentRequest & { postId: string }>,
  res: Response
): Promise<any> => {
  const { comment, postId } = req.body;
  console.log(comment, postId, req.body);
  try {
    const commentResponse = await prisma.comment.create({
      data: {
        comment,
        postId,
      },
    });
    return res.status(201).json(commentResponse);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create comment" });
  }
};

export const updateComment = async (req: Request, res: Response) => {
  const { commentId, comment } = req.body;
  const postId = req.params;
  console.log(req.body, req.params);
  try {
    const updateResponse = await prisma.comment.update({
      where: { id: commentId },
      data: { comment },
    });
    res.json(updateResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update comment" });
  }
};

// export const updateComment = async (req: Request, res: Response) => {
//   const { commentId, comment } = req.body;
//   const { id } = req.params; // Assuming the route is /posts/:id
//   console.log(req.body, req.params);
//   try {
//     const updateResponse = await prisma.post.update({
//       where: { id },
//       data: {
//         // Add fields to update here if needed
//       },
//     });
//     res.json(updateResponse);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to update post" });
//   }
// };

export const allPost = async (req: Request, res: Response): Promise<any> => {
  try {
    const response = await prisma.post.findMany({
      include: {
        user: true,
        comments: true,
      },
    });
    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch posts" });
  }
};

// import { Request, Response } from "express";
// import prisma from "../config/database";

// interface UserRequest {
//   username: string;
//   email: string;
//   password: string;
//   bio: string;
//   post: PostRequest[];
// }
// interface PostRequest {
//   content: string;
// }
// interface CommentRequest {
//   comment: string;
// }

// export const createUser = async (
//   req: Request<{}, {}, UserRequest>,
//   res: Response
// ): Promise<any> => {
//   const { username, email, password, bio } = req.body;
//   const userResponse = await prisma.user.create({
//     data: {
//       username,
//       email,
//       password,
//       bio,
//       post: {
//         create:
//       }
//     },
//   });
//   res.json(userResponse);
//   try {
//   } catch (error: any) {
//     console.error(error);
//   }
// };

// // export const createPost = async (
// //   req: Request<{}, PostRequest>,
// //   res: Response
// // ): Promise<any> => {
// //   const { content } = req.body;
// //   const postResponse = await prisma.user.create({
// //     data: {
// //       content
// //     },
// //   });
// //   res.json(postResponse);

// //   try {
// //   } catch (error: any) {
// //     console.error(error);
// //   }
// // };
// export const createComment = async (
//   req: Request<{}, CommentRequest>,
//   res: Response
// ): Promise<any> => {
//   const { comment } = req.body;
//   res.json(req.body);

//   try {
//   } catch (error: any) {
//     console.error(error);
//   }
// };

// export const allPost = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const response = await prisma.post.findMany();
//     res.json(response);
//   } catch (error) {
//     console.log(error);
//   }
// };
