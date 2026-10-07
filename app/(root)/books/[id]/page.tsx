
import { db } from '@/database/drizzle';
import { books } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import React from 'react'

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {

    const id = (await params).id;

    // Fetch book based on id
    const [bookDetails] = await db
        .select()
        .from(books)
        .where(eq(books.id, id))
        .limit(1);


    if (!bookDetails) redirect('/404');

    console.log(bookDetails);

    return (
        <div>Page</div>
    )
}

export default Page