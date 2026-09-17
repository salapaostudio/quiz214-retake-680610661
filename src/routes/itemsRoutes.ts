import { Router, type Request, type Response } from "express";
// import Zod validators
import {
  zUserId,
  zItemId,
  zItemPostBody,
  zItemPutBody,
  zItemDeleteBody,
} from "../libs/zodValidators.js";
// import types
import type { Item } from "../libs/types.js";
// import database
import { items } from "../db/db.js";
//import uuid
import { v4 as uuidv4 } from 'uuid';
import authenticateToken from "../middlewares/authenMiddleware.js";
import checkRoleMiddleware from "../middlewares/checkRoleMiddleware.js";

const router = Router();

router.use(authenticateToken);

// GET /api/vXXX/cart/:userId
router.get("/:userId", checkRoleMiddleware, (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const parsedUserId = zUserId.parse(userId);

      // Filter items by userId
      const userItems: Item[] = items.filter(item => item.userId === parsedUserId);

      if (userItems.length === 0) {
        return res.status(404).json({
          success: false,
          message: `items for user ID ${parsedUserId} not found`,
        });
      }

      return res.status(200).json({
        success: true,
        data: userItems,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }
});

router.put("/:userId/:itemId", checkRoleMiddleware, (req: Request, res: Response) => {
  try {
    const userId = zUserId.parse(req.params.userId);
    const itemId = zItemId.parse(req.params.itemId);
    const updates = zItemPutBody.parse(req.body);
    const item = items.find(
      (entry) => entry.userId === userId && entry.itemId === itemId,
    );

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    Object.assign(item, updates);
    return res.status(200).json({ success: true, data: item });
  } catch {
    return res.status(400).json({
      success: false,
      message: "Invalid request data",
    });
  }
});

// POST /api/vXXX/cart/:userId, body = {new item data}
// add a new Item for userId
router.post("/:userId", checkRoleMiddleware, (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const parsedUserId = zUserId.parse(userId);
    const newItemData = zItemPostBody.parse(req.body);

    const newItem: Item = {
      userId: parsedUserId,
      itemId: uuidv4(),
      product_name: newItemData.product_name,
      unit_price: newItemData.unit_price,
      quantity: newItemData.quantity,
      category: newItemData.category,
    };

    items.push(newItem);

    return res.status(201).json({
      success: true,
      message: "New Item has been added successfully",
      data: newItem,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid request data",
    });
  }
});

const deleteItem = (req: Request, res: Response, itemIdInput: unknown) => {
  try {
    const userId = zUserId.parse(req.params.userId);
    const itemId = zItemId.parse(itemIdInput);
    const itemIndex = items.findIndex(
      (entry) => entry.userId === userId && entry.itemId === itemId,
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    const [deletedItem] = items.splice(itemIndex, 1);
    return res.status(200).json({ success: true, data: deletedItem });
  } catch {
    return res.status(400).json({
      success: false,
      message: "Invalid request data",
    });
  }
};

router.delete("/:userId/:itemId", checkRoleMiddleware, (req: Request, res: Response) =>
  deleteItem(req, res, req.params.itemId),
);

router.delete("/:userId", checkRoleMiddleware, (req: Request, res: Response) => {
  try {
    const { itemId } = zItemDeleteBody.parse(req.body);
    return deleteItem(req, res, itemId);
  } catch {
    return res.status(400).json({
      success: false,
      message: "Invalid request data",
    });
  }
});


export default router;
