import { z } from "zod";

//////  Items Validators //////

export const zUserId = z.string().length(4, { message: "User Id must contain 4 characters" });
export const zItemId = z.string().min(1, { message: "Item Id is required" });
const zProduct_Name  = z.string().min(1, { message: "Product name is required" });
const zUnit_Price  = z.number();
const zQuantity  = z.number();
const zCategory = z.enum(['Electronics','Clothing','Household','Others'], {message: "Category must be either Electronics,Clothing,Household or Others"});

export const zItemPostBody = z.object({
  product_name: zProduct_Name,
  unit_price: zUnit_Price,
  quantity: zQuantity,
  category: zCategory
});

export const zItemPutBody = z.object({
  product_name: zProduct_Name.optional(),
  unit_price: zUnit_Price.optional(),
  quantity: zQuantity.optional(),
  category: zCategory.optional()
});

export const zItemDeleteBody = z.object({
  itemId: zItemId,
});
