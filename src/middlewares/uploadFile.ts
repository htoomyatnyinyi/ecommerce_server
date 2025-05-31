// const express = require("express");
// const multer = require("multer");
// const { PrismaClient } = require("@prisma/client");
// const path = require("path");

// const prisma = new PrismaClient();
// const app = express();

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/"); // Folder to store images
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(
//       null,
//       file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
//     );
//   },
// });

// const upload = multer({ storage: storage });

// app.post("/api/upload", upload.single("image"), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).send("No file uploaded.");
//   }
//   const imageUrl = `${req.protocol}://${req.get("host")}/${req.file.path}`; // Construct the full URL
//   // Save the URL to the database using Prisma
//   try {
//     const newImage = await prisma.image.create({
//       data: {
//         url: imageUrl,
//       },
//     });
//     res.json({ imageUrl: newImage.url });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to save image URL" });
//   }
// });

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// app.listen(3000, () => console.log("Server listening on port 3000"));
