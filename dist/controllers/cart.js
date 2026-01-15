"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartTotal = exports.updateCart = exports.removeCart = exports.getCart = exports.addToCart = void 0;
const database_1 = __importDefault(require("../config/database"));
const addToCart = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res
            .status(401)
            .json({ error: "Unauthorized: User not authenticated." });
    }
    // const data = req.body;
    const { productId, variantId, quantity } = req.body;
    console.log(productId, variantId, quantity, "at addToCart");
    try {
        // Check if product exists and has enough stock
        const product = await database_1.default.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            return res.status(404).json({ msg: "Product Not Found" });
        }
        // Check if item already in cart
        const existingItem = await database_1.default.cartItem.findFirst({
            where: { cart: { userId }, productId: productId, variantId: variantId },
        });
        // console.log(existingItem, "eistingItem");
        let cartItem;
        if (existingItem) {
            // update quantity
            // console.log(existingItem, "alredy existing cart");
            res.json(existingItem);
            // cartItem = await prisma.cartItem.update({
            //   where: { id: existingItem.id }, // only for add to cart but variantId haven't apply
            //   data: { quantity: existingItem.quantity + quantity },
            //   include: { product: true },
            // });
            cartItem = await database_1.default.cartItem.update({
                where: { id: existingItem.id }, // Ensure variantId is included in the update
                data: { quantity: existingItem.quantity + quantity },
                include: {
                    product: true,
                    variant: true, // Include variant details if needed
                },
            });
        }
        else {
            // Find the user's cart by userId
            let userCart = await database_1.default.cart.findFirst({
                where: { userId },
            });
            // If the cart doesn't exist, create one
            if (!userCart) {
                userCart = await database_1.default.cart.create({
                    data: { userId },
                });
            }
            // add new item to cartItem table
            cartItem = await database_1.default.cartItem.create({
                data: {
                    cart: { connect: { id: userCart.id } },
                    product: { connect: { id: productId } },
                    variant: { connect: { id: variantId } }, // Assuming variantId is provided
                    quantity,
                },
                include: {
                    product: true,
                    variant: true, // Include variant details if needed
                },
            });
            // #
            // add new item into cart table
            // const cartItem = await prisma.cart.create({
            //   data: {
            //     userId,
            //     items: {
            //       create: {
            //         productId,
            //         variantId,
            //         quantity,
            //       },
            //     },
            //   },
            //   include: {
            //     items: {
            //       select: {
            //         id: true,
            //         cartId: true,
            //         quantity: true,
            //       },
            //     },
            //   },
            // });
            const addToOrderItem = await database_1.default.orderItem.create({
                data: {
                    // productId,
                    // variantId,
                    product: { connect: { id: productId } },
                    variant: { connect: { id: variantId } },
                    quantity,
                    price: 1000 * quantity, // Replace 1000 with actual price if available
                    order: {
                        create: {
                            userId,
                            totalPrice: 1000 * quantity, // Replace 1000 with actual price if available
                            // shippingAddressId: "some-shipping-address-id", // Add shipping address ID if available
                        },
                    },
                },
            });
            console.log(addToOrderItem, "addToOrderItem");
            res.status(200).json(cartItem);
        }
    }
    catch (error) {
        res.status(500).json({ msg: "error" });
    }
};
exports.addToCart = addToCart;
// Get the user's cart
const getCart = async (req, res) => {
    const userId = req.user?.id; // Assuming user ID is stored in req.user
    if (!userId) {
        return res
            .status(401)
            .json({ error: "Unauthorized: User not authenticated." });
    }
    // console.log("User ID:", userId);
    try {
        const getCart = await database_1.default.cartItem.findMany({
            // include: {
            // items: {
            //   include: {
            //     // product: {
            //     //   select: { title: true, description: true },
            //     // },
            //     product: true,
            //     // variant: {
            //     //   select: { sku: true, stock: true, price: true },
            //     // },
            //     variant: true,
            //   },
            // },
            // },
            include: {
                product: {
                    include: {
                        images: true,
                    },
                },
                variant: true, // Include variant details if needed
            },
            where: { cart: { userId } },
            // orderBy: { createdAt: "desc" }, // Optional: Order by creation date
        });
        // console.log(getCart, "getCart");
        let totalPrice = 0;
        let totalQuantity = 0;
        getCart.forEach((item) => {
            console.log(item, "for each");
            const price = Number(item.variant?.price) || 0;
            const quantity = Number(item.quantity) || 0;
            totalPrice += price * quantity;
            totalQuantity += quantity;
        });
        // console.log(totalPrice, "totalPrice");
        // // console.log(getCart, "getCart");
        // if (!getCart || getCart.length === 0) {
        //   return res.status(404).json({ message: "Cart is empty" });
        // }
        // // If you want to return the cart items with product and variant details
        // // res.json(getCart);
        // // If you want to return the cart items without product and variant details
        // // res.json(getCart.map(cart => cart.items));
        // // If you want to return the items only
        // const a = getCart.map((cart) => cart.items);
        // console.log({ ...a[0] }, "getCart items");
        // // console.log({ ...getCart });
        res.status(200).json({ getCart, totalPrice, totalQuantity });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch cart" });
    }
    // before make a return data change.
    // try {
    //   const getCart = await prisma.cart.findMany({
    //     include: {
    //       items: {
    //         include: {
    //           // product: {
    //           //   select: { title: true, description: true },
    //           // },
    //           product: true,
    //           // variant: {
    //           //   select: { sku: true, stock: true, price: true },
    //           // },
    //           variant: true,
    //         },
    //       },
    //     },
    //   });
    //   // console.log(getCart, "getCart");
    //   if (!getCart || getCart.length === 0) {
    //     return res.status(404).json({ message: "Cart is empty" });
    //   }
    //   // If you want to return the cart items with product and variant details
    //   // res.json(getCart);
    //   // If you want to return the cart items without product and variant details
    //   // res.json(getCart.map(cart => cart.items));
    //   // If you want to return the items only
    //   const a = getCart.map((cart) => cart.items);
    //   console.log({ ...a[0] }, "getCart items");
    //   // console.log({ ...getCart });
    //   res.status(200).json(getCart);
    // } catch (error) {
    //   console.error(error);
    // }
};
exports.getCart = getCart;
// Remove an item from the cart
const removeCart = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res
            .status(401)
            .json({ error: "Unauthorized: User not authenticated." });
    }
    const { removeCartItemId } = req.body;
    console.log(removeCartItemId, "removeCartItemId", req.body);
    // const removeCartItemId = req.params.id;
    // console.log(removeCartItemId, "removeCartItemId", req.body);
    try {
        const removedCartItem = await database_1.default.cartItem.delete({
            where: { id: removeCartItemId, cart: { userId } },
        });
        res
            .status(200)
            .json({ success: true, msg: "remove cart already.", removedCartItem });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to remove item from cart" });
    }
};
exports.removeCart = removeCart;
// Update the quantity of an item in the cart
const updateCart = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res
            .status(401)
            .json({ error: "Unauthorized: User not authenticated." });
    }
    // console.log(req.body, "updateCart body");
    const { cartItemId, quantity } = req.body;
    if (!cartItemId || quantity === undefined) {
        return res
            .status(400)
            .json({ error: "Cart item ID and quantity are required." });
    }
    try {
        const updatedCartItem = await database_1.default.cartItem.update({
            where: { id: cartItemId, cart: { userId } },
            data: { quantity },
        });
        res.status(200).json({ success: true, updatedCartItem });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update cart item quantity" });
    }
};
exports.updateCart = updateCart;
// total price of items in a cart based on the cart ID.
const cartTotal = async (req, res) => {
    const { cartId } = req.body;
    // console.log(cartId, req.body);
    if (!cartId)
        return res.status(400).json({ error: "Cart ID is required." });
    try {
        const cartItems = await database_1.default.cart.findMany({
            where: { id: cartId },
            include: {
                items: {
                    include: { variant: true },
                },
            },
        });
        // console.log(cartItems, cartItems[0]?.items, "cartItems");
        let totalPrice = 0;
        cartItems[0]?.items.forEach((item) => {
            const price = Number(item.variant?.price) || 0;
            const quantity = Number(item.quantity) || 0;
            totalPrice += price * quantity;
        });
        console.log(totalPrice, "totalPrice");
        res.status(201).json({ totalPrice, cartItems: cartItems[0]?.items });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to calculate cart total" });
    }
};
exports.cartTotal = cartTotal;
