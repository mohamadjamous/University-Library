'use server'

import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { Book } from "lucide-react"



export const createBook = async (params: BookParams) => {

    try {
        const newBook = await db
        .insert(books)
        .values({
            ...params,
            availableCopies: params.totalCopies,
        })
        .returning();

        return{
            success: true,
            message: JSON.parse(JSON.stringify([0])),
        };
    } catch (error) {
        console.log(error);

        return{
            success: false,
            message: "An error occured while creating the book"
        }
    }
}