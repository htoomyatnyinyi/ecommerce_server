"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrandById = exports.getBrands = exports.createBrand = void 0;
const database_1 = __importDefault(require("../config/database"));
const createBrand = async (req, res) => {
    // const useId = req.user?.id;
    const { brandName } = req.body;
    try {
        const categoryResponse = await database_1.default.brand.create({
            data: {
                brandName,
            },
        });
        res.status(201).json(categoryResponse);
    }
    catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            success: false,
            message: "Failed create category ",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
};
exports.createBrand = createBrand;
const getBrands = async (req, res) => {
    try {
        const brandResponse = await database_1.default.brand.findMany();
        res.status(200).json(brandResponse);
    }
    catch (error) {
        console.error("Error fetching brands:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch brand",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
};
exports.getBrands = getBrands;
const getBrandById = async (req, res) => {
    const brandId = req.params.id;
    try {
        const categoryResponse = await database_1.default.category.findUnique({
            where: { id: brandId },
        });
        res.status(200).json(categoryResponse);
    }
    catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch category",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
};
exports.getBrandById = getBrandById;
