# New Table Instructions

Follow these instructions to create a new table in the database.

## Guidelines

- User ids should be like this `userId: text("user_id").notNull()` because we user Clerk

## Step 1: Create the Schema

This is an example of how to create a new table in the database.

This file should be named like `profiles-schema.ts`.

This file should go in the `db/schema` folder.

Make sure to export the `profiles-schema.ts` file in the `db/schema/index.ts` file.

Make sure to add the table to the `schema` object in the `db/db.ts` file.

```typescript
import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const membershipEnum = pgEnum("membership", ["free", "pro"]);

export const profilesTable = pgTable("profiles", {
  userId: text("user_id").primaryKey().notNull(),
  membership: membershipEnum("membership").default("free").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});

export type InsertProfile = typeof profilesTable.$inferInsert;
export type SelectProfile = typeof profilesTable.$inferSelect;
```

## Step 2: Create the Queries

This is an example of how to create the queries for the table.

This file should be named like `profiles-queries.ts`.

This file should go in the `db/queries` folder.

```typescript
import { eq } from "drizzle-orm";
import { db } from "../db";
import { InsertProfile, profilesTable, SelectProfile } from "../schema/profiles-schema";

export const createProfile = async (data: InsertProfile) => {
  try {
    const [newProfile] = await db.insert(profilesTable).values(data).returning();
    return newProfile;
  } catch (error) {
    console.error("Error creating profile: ", error);
    throw new Error("Failed to create profile");
  }
};

export const getProfileByUserId = async (userId: string) => {
  try {
    const profile = await db.query.profiles.findFirst({
      where: eq(profilesTable.userId, userId)
    });

    return profile;
  } catch (error) {
    console.error("Error getting profile by user ID:", error);
    throw new Error("Failed to get profile");
  }
};

export const getAllProfiles = async (): Promise<SelectProfile[]> => {
  return db.query.profiles.findMany();
};

export const updateProfile = async (userId: string, data: Partial<InsertProfile>) => {
  try {
    const [updatedProfile] = await db.update(profilesTable).set(data).where(eq(profilesTable.userId, userId)).returning();
    return updatedProfile;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw new Error("Failed to update profile");
  }
};

export const updateProfileByStripeCustomerId = async (stripeCustomerId: string, data: Partial<InsertProfile>) => {
  try {
    const [updatedProfile] = await db.update(profilesTable).set(data).where(eq(profilesTable.stripeCustomerId, stripeCustomerId)).returning();
    return updatedProfile;
  } catch (error) {
    console.error("Error updating profile by stripe customer ID:", error);
    throw new Error("Failed to update profile");
  }
};

export const deleteProfile = async (userId: string) => {
  try {
    await db.delete(profilesTable).where(eq(profilesTable.userId, userId));
  } catch (error) {
    console.error("Error deleting profile:", error);
    throw new Error("Failed to delete profile");
  }
};
```

## Step 3: Create the Actions

This is an example of how to create the actions for the table.

This file should be named like `profiles-actions.ts`.

```typescript
"use server";

import { createProfile, deleteProfile, getAllProfiles, getProfileByUserId, updateProfile } from "@/db/queries/profiles-queries";
import { InsertProfile } from "@/db/schema/profiles-schema";
import { ActionState } from "@/types";
import console from "console";
import { revalidatePath } from "next/cache";

export async function createProfileAction(data: InsertProfile): Promise<ActionState> {
  try {
    const newProfile = await createProfile(data);
    console.log("New profile created", newProfile);
    revalidatePath("/");
    return { status: "success", message: "Profile created successfully", data: newProfile };
  } catch (error) {
    return { status: "error", message: "Error creating profile" };
  }
}

export async function getProfileByUserIdAction(userId: string): Promise<ActionState> {
  try {
    const profile = await getProfileByUserId(userId);
    if (!profile) {
      return { status: "error", message: "Profile not found" };
    }
    return { status: "success", message: "Profile retrieved successfully", data: profile };
  } catch (error) {
    return { status: "error", message: "Failed to get profile" };
  }
}

export async function getAllProfilesAction(): Promise<ActionState> {
  try {
    const profiles = await getAllProfiles();
    return { status: "success", message: "Profiles retrieved successfully", data: profiles };
  } catch (error) {
    return { status: "error", message: "Failed to get profiles" };
  }
}

export async function updateProfileAction(userId: string, data: Partial<InsertProfile>): Promise<ActionState> {
  try {
    const updatedProfile = await updateProfile(userId, data);
    revalidatePath("/profile");
    return { status: "success", message: "Profile updated successfully", data: updatedProfile };
  } catch (error) {
    return { status: "error", message: "Failed to update profile" };
  }
}

export async function deleteProfileAction(userId: string): Promise<ActionState> {
  try {
    await deleteProfile(userId);
    revalidatePath("/profile");
    return { status: "success", message: "Profile deleted successfully" };
  } catch (error) {
    return { status: "error", message: "Failed to delete profile" };
  }
}
```

## Step 4: Generate the SQL file and Migrate the DB

```bash
npm run db:generate
npm run db:migrate
```

## Step 5: Secure the Table with Row Level Security (RLS)

After creating your table and migrating the database, it's crucial to set up Row Level Security (RLS) to control access to the data. This ensures that users can only interact with data they are permitted to.

For most tables that store user-specific data, you'll want to ensure that authenticated users can only perform CRUD (Create, Read, Update, Delete) operations on their own records. The `user_id` column, which links to the authenticated user via Clerk (`auth.uid()`), is essential for these policies.

**Important:** Execute these SQL commands in your Supabase SQL editor.

1.  **Enable RLS on your table:**
    Replace `your_table_name` with the actual name of your table.

    ```sql
    ALTER TABLE your_table_name ENABLE ROW LEVEL SECURITY;
    ```

2.  **Policy for SELECT operations:**
    Allows authenticated users to select only their own records. Replace `your_table_name` and `user_id_column` with your specific table and user identifier column name (e.g., `userId` as per the schema example).

    ```sql
    CREATE POLICY "Allow individual select access" 
    ON your_table_name 
    FOR SELECT
    USING (auth.uid() = user_id_column);
    ```

3.  **Policy for INSERT operations:**
    Allows authenticated users to insert new records, automatically associating the record with their `user_id`. Replace `your_table_name` and `user_id_column`.

    ```sql
    CREATE POLICY "Allow individual insert access" 
    ON your_table_name 
    FOR INSERT
    WITH CHECK (auth.uid() = user_id_column);
    ```

4.  **Policy for UPDATE operations:**
    Allows authenticated users to update only their own existing records. Replace `your_table_name` and `user_id_column`.

    ```sql
    CREATE POLICY "Allow individual update access" 
    ON your_table_name 
    FOR UPDATE
    USING (auth.uid() = user_id_column) 
    WITH CHECK (auth.uid() = user_id_column);
    ```

5.  **Policy for DELETE operations:**
    Allows authenticated users to delete only their own records. Replace `your_table_name` and `user_id_column`.

    ```sql
    CREATE POLICY "Allow individual delete access" 
    ON your_table_name 
    FOR DELETE
    USING (auth.uid() = user_id_column);
    ```

**Notes on RLS:**

*   **`auth.uid()`**: This Supabase function returns the ID of the currently authenticated user.
*   **`auth.role()`**: This can be used to check roles, e.g., `auth.role() = 'authenticated'` or `auth.role() = 'anon'`.
*   **Specificity is Key**: The policies above are common for user-owned data. Adjust them based on your application's specific requirements. For example:
    *   Some tables might allow all authenticated users to read all data (`USING (auth.role() = 'authenticated')`).
    *   Some public data tables might allow anonymous read access (`FOR SELECT USING (auth.role() = 'anon' OR auth.role() = 'authenticated')`).
    *   The `webinar_analytics` table, for instance, has a policy to allow anonymous inserts: `CREATE POLICY "Allow public insert access for webinar analytics" ON webinar_analytics FOR INSERT WITH CHECK (true);`
*   **Default Deny**: Once RLS is enabled, access is denied unless a policy explicitly grants it. Ensure you have policies for all intended operations.
*   **Test Thoroughly**: After implementing RLS policies, test them rigorously to ensure they behave as expected and don't inadvertently block legitimate access or allow unauthorized access.