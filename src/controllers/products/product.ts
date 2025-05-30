import { Request, Response } from "express";
import prisma from "../../config/database";

import {
  CreateNewProductRequest,
  VariantOptionRequest,
  VariantRequest,
  GetProductsQuery,
  ImageRequest,
} from "../../types/productTypes";

const createNewProduct = async (
  req: Request<{}, {}, CreateNewProductRequest>,
  res: Response
): Promise<any> => {
  //

  const { title, description, variants, images } = req.body;
  console.log(req.body);

  if (!req.user || !req.user.id) {
    return res
      .status(401)
      .json({ error: "Unauthorized: User not authenticated." });
  }
  const userId = req.user.id;
  console.log(userId);

  if (
    !title ||
    !description ||
    !Array.isArray(variants) ||
    variants.length === 0
  ) {
    res.status(400).json({
      error: "Title, userId, and at least one variant are required.",
    });
  }

  try {
    const createNewProductResponse = await prisma.product.create({
      data: {
        title,
        description,
        User: {
          connect: { id: userId },
        },
        variants: {
          create: variants.map((variant: VariantRequest): any => ({
            sku: variant.sku,
            price: variant.price,
            stock: variant.stock,
            variantOptions: {
              create: variant.variantOptions
                ? variant.variantOptions.map(
                    (variantOption: VariantOptionRequest): any => ({
                      attributeName: variantOption.attributeName,
                      attributeValue: variantOption.attributeValue,
                    })
                  )
                : [],
            },
          })),
        },
        images: {
          create: images
            ? images.map((image: ImageRequest): any => ({
                url: image.url,
                altText: image.altText,
                isPrimary: image.isPrimary,
              }))
            : [],
        },
      },
      include: {
        variants: {
          include: {
            variantOptions: true,
          },
        },
        images: true,
      },
    });

    // console.log(brand, "check return");
    res.status(201).json(createNewProductResponse);
  } catch (error) {
    console.log(error);
  }
};

const getProducts = async (req: Request, res: Response) => {
  // const {
  //   page = "1",
  //   limit = "10",
  //   search,
  //   category,
  //   minPrice,
  //   maxPrice,
  //   sortBy = "createdAt",
  //   sortOrder = "desc",
  // } = req.query;

  try {
    // const totalCount = await prisma.product.count({ where: {} });
    // const brand = await prisma.brand.findMany({ where: {} });

    const products = await prisma.product.findMany({
      where: {},
      include: {
        variants: {
          include: {
            variantOptions: true,
          },
        },
        images: true,
      },
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ error: "Get Product Error" });
  }
};

export { createNewProduct, getProducts };

// import { Request, Response } from "express";
// import prisma from "../../config/database";

// import {
//   CreateNewProductRequest,
//   VariantOptionRequest,
//   VariantRequest,
//   GetProductsQuery,
// } from "../../types/productTypes";

// const createNewProduct = async (
//   req: Request<{}, {}, CreateNewProductRequest>,
//   res: Response
// ): Promise<any> => {
//   const { title, description, variants, images } = req.body;

//   console.log(req.body);

//   if (!req.user || !req.user.id) {
//     return res
//       .status(401)
//       .json({ error: "Unauthorized: User not authenticated." });
//   }
//   const userId = req.user.id;
//   console.log(userId);

//   if (
//     !title ||
//     !description ||
//     !Array.isArray(variants) ||
//     variants.length === 0
//   ) {
//     res.status(400).json({
//       error: "Title, userId, and at least one variant are required.",
//     });
//   }
//   try {
//     const createNewProductResponse = await prisma.product.create({
//       data: {
//         title,
//         description,
//         variants: {
//           create: variants.map((variant: VariantRequest): any => ({
//             sku: variant.sku,
//             price: variant.price.toString(),
//             // price: parseInt(variant.price.toString()),
//             stock: parseInt(variant.stock.toString(), 10),
//             variantOptions: {
//               create: variant.variantOptions
//                 ? variant.variantOptions.map(
//                     (variantOption: VariantOptionRequest) => ({
//                       attributeName: variantOption.attributeName,
//                       attributeValue: variantOption.attributeValue,
//                     })
//                   )
//                 : [],
//             },
//           })),
//         },
//         images: {
//           create: images
//             ? images.map((image) => ({
//                 url: image.url,
//                 altText: image.altText,
//                 isPrimary: image.isPrimary || false,
//               }))
//             : [],
//         },
//       },
//       include: {
//         variants: {
//           include: {
//             variantOptions: true,
//           },
//         },
//         images: true,
//       },
//     });

//     // if (!brandName) {
//     //   return res.status(400).json({ error: "brandName is required." });
//     // }
//     // const brand = await prisma.brand.create({
//     //   data: {
//     //     brandName,
//     //   },
//     // });

//     // console.log(brand, "check return");
//     res.status(201).json(createNewProductResponse);
//   } catch (error) {
//     console.log(error);
//   }
// };

// const getProducts = async (
//   req: Request<{}, {}, GetProductsQuery>,
//   res: Response
// ) => {
//   // const {
//   //   page = "1",
//   //   limit = "10",
//   //   search,
//   //   category,
//   //   minPrice,
//   //   maxPrice,
//   //   sortBy = "createdAt",
//   //   sortOrder = "desc",
//   // } = req.query;

//   try {
//     const totalCount = await prisma.product.count({ where: {} });
//     const brand = await prisma.brand.findMany({ where: {} });

//     const products = await prisma.product.findMany({
//       where: {},
//       include: {
//         variants: {
//           include: {
//             variantOptions: true,
//           },
//         },
//         images: true,
//       },
//     });
//     res.status(200).json({ brand, totalCount, products });
//   } catch (error) {
//     res.status(400).json({ error: "Get Product Error" });
//   }
// };

// export { createNewProduct, getProducts };
