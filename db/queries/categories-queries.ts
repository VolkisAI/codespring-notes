import { eq, asc, isNull } from "drizzle-orm";
import { db } from "../db";
import {
  categoriesTable,
  InsertCategory,
  SelectCategory,
} from "../schema/categories-schema";

/**
 * Queries for the "categories" table.
 * Provides functions to create, read, update, and delete categories.
 * Location: /db/queries/categories-queries.ts
 */

export const createCategory = async (
  data: InsertCategory
): Promise<SelectCategory> => {
  try {
    const [newCategory] = await db
      .insert(categoriesTable)
      .values(data)
      .returning();
    return newCategory;
  } catch (error) {
    console.error("Error creating category: ", error);
    throw new Error("Failed to create category. Please try again.");
  }
};

export const getCategoryById = async (
  id: string
): Promise<SelectCategory | undefined> => {
  try {
    const category = await db.query.categoriesTable.findFirst({
      where: eq(categoriesTable.id, id),
    });
    return category;
  } catch (error) {
    console.error("Error getting category by ID: ", error);
    throw new Error("Failed to retrieve category. Please try again.");
  }
};

export const getCategoriesByUserId = async (
  userId: string
): Promise<SelectCategory[]> => {
  try {
    const categories = await db.query.categoriesTable.findMany({
      where: eq(categoriesTable.userId, userId),
      orderBy: (table, { asc: sortAsc }) => [sortAsc(table.createdAt)],
    });
    return categories;
  } catch (error) {
    console.error("Error getting categories by user ID: ", error);
    throw new Error("Failed to retrieve categories. Please try again.");
  }
};

export const getCategoriesForUserAndBase = async (
  userId: string
): Promise<SelectCategory[]> => {
  try {
    const userCategories = await db.query.categoriesTable.findMany({
      where: eq(categoriesTable.userId, userId),
      orderBy: (table, { asc: sortAsc }) => [sortAsc(table.createdAt)],
    });
    const baseCategories = await db.query.categoriesTable.findMany({
      where: isNull(categoriesTable.userId),
      orderBy: (table, { asc: sortAsc }) => [sortAsc(table.name)],
    });

    const allCategories = [...baseCategories, ...userCategories];
    
    return allCategories;
  } catch (error) {
    console.error("Error getting categories for user and base: ", error);
    throw new Error("Failed to retrieve user and base categories. Please try again.");
  }
};

export const updateCategory = async (
  id: string,
  data: Partial<InsertCategory>
): Promise<SelectCategory> => {
  try {
    const [updatedCategory] = await db
      .update(categoriesTable)
      .set(data)
      .where(eq(categoriesTable.id, id))
      .returning();
    return updatedCategory;
  } catch (error) {
    console.error("Error updating category: ", error);
    throw new Error("Failed to update category. Please try again.");
  }
};

export const deleteCategory = async (
  id: string
): Promise<{ id: string }> => {
  try {
    const [deletedCategory] = await db
      .delete(categoriesTable)
      .where(eq(categoriesTable.id, id))
      .returning({ id: categoriesTable.id });
    return deletedCategory;
  } catch (error) {
    console.error("Error deleting category: ", error);
    throw new Error("Failed to delete category. Please try again.");
  }
}; 