"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategory = exports.createCategory = void 0;
const database_1 = __importDefault(require("../config/database"));
const createCategory = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res
            .status(401)
            .json({ message: "Unauthorized: User not authenticated" });
    }
    console.log(req.body, "at category");
    // const { categoryName } = req.body;
    const { name } = req.body;
    try {
        const categoryResponse = await database_1.default.category.create({
            // data: {
            //   categoryName
            // },
            data: {
                categoryName: name,
            },
        });
        res.status(201).json(categoryResponse);
    }
    catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            success: false,
            message: "Failed create category ",
            error: process.env.NODE_ENV === "dewwwvelopment" ? error : undefined,
        });
    }
};
exports.createCategory = createCategory;
const getCategory = async (req, res) => {
    try {
        const categoryResponse = await database_1.default.category.findMany();
        res.status(200).json(categoryResponse);
    }
    catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch category",
            error: process.env.NODE_ENV === "dewwwvelopment" ? error : undefined,
        });
    }
};
exports.getCategory = getCategory;
// export const createCategory = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   try {
//   } catch (error) {
//     console.error(error);
//   }
// };
