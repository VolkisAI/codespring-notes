"use server";

import {
  createCategory,
  deleteCategory,
  getCategoriesByUserId,
  getCategoryById,
  updateCategory,
  getCategoriesForUserAndBase,
} from "@/db/queries/categories-queries";
import type { InsertCategory, SelectCategory } from "@/db/schema/categories-schema";
import type { ActionResult } from "@/types"; 
import { revalidatePath } from "next/cache";

/**
 * Server actions for managing categories.
 * These actions interact with the database queries and handle cache revalidation.
 * Location: /actions/categories-actions.ts
 */

export async function createCategoryAction(
  data: InsertCategory
): Promise<ActionResult<SelectCategory>> {
  try {
    const newCategory = await createCategory(data);
    revalidatePath("/notes"); // Revalidate path where categories are displayed
    return {
      isSuccess: true,
      message: "Category created successfully",
      data: newCategory,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error creating category";
    console.error("createCategoryAction Error: ", errorMessage);
    return { isSuccess: false, message: errorMessage };
  }
}

export async function getCategoryByIdAction(
  id: string
): Promise<ActionResult<SelectCategory>> {
  try {
    const category = await getCategoryById(id);
    if (!category) {
      return { isSuccess: false, message: "Category not found" };
    }
    return {
      isSuccess: true,
      message: "Category retrieved successfully",
      data: category,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error retrieving category";
    console.error("getCategoryByIdAction Error: ", errorMessage);
    return { isSuccess: false, message: errorMessage };
  }
}

export async function getCategoriesByUserIdAction(
  userId: string
): Promise<ActionResult<SelectCategory[]>> {
  try {
    const categories = await getCategoriesByUserId(userId);
    return {
      isSuccess: true,
      message: "Categories retrieved successfully",
      data: categories,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error retrieving categories";
    console.error("getCategoriesByUserIdAction Error: ", errorMessage);
    return { isSuccess: false, message: errorMessage };
  }
}

export async function getCategoriesForUserAndBaseAction(
  userId: string
): Promise<ActionResult<SelectCategory[]>> {
  try {
    const categories = await getCategoriesForUserAndBase(userId);
    return {
      isSuccess: true,
      message: "User and base categories retrieved successfully",
      data: categories,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error retrieving user and base categories";
    console.error("getCategoriesForUserAndBaseAction Error: ", errorMessage);
    return { isSuccess: false, message: errorMessage };
  }
}

export async function updateCategoryAction(
  id: string,
  data: Partial<InsertCategory>
): Promise<ActionResult<SelectCategory>> {
  try {
    const updatedCategory = await updateCategory(id, data);
    revalidatePath("/notes"); // Revalidate relevant paths
    // Potentially revalidate a specific note page if category is displayed there /notes/[note-id]
    return {
      isSuccess: true,
      message: "Category updated successfully",
      data: updatedCategory,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error updating category";
    console.error("updateCategoryAction Error: ", errorMessage);
    return { isSuccess: false, message: errorMessage };
  }
}

export async function deleteCategoryAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const deletedCategoryInfo = await deleteCategory(id);
    revalidatePath("/notes"); // Revalidate relevant paths
    return {
      isSuccess: true,
      message: "Category deleted successfully",
      data: deletedCategoryInfo,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error deleting category";
    console.error("deleteCategoryAction Error: ", errorMessage);
    return { isSuccess: false, message: errorMessage };
  }
} 