import ImageKit from 'imagekit';
import dummyBooks from '../dummyBooks.json';
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { books } from './schema';



config({path: ".env"});

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({client: sql});


const imageKit = new ImageKit(
    {
        publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
        urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    }
)


const uploadToImageKit = async (url: string, fileName: string, folder: string) => {

    try {
        const response = await imageKit.upload(
            {
                file: url,
                fileName,
                folder
            }
        )

        return response.filePath;
    } catch (error) {
        console.log(`Error uploading to image kit ${error}`);
    }
    
}

const seed = async () =>{
    console.log('Seeding Database...');


    try {

        for (const book of dummyBooks){
            const coverUrl = await uploadToImageKit(
                book.coverUrl,
                `${book.title}.jpg`,
                "/books/covers"
            ) as string;


             const videoUrl = await uploadToImageKit(
                book.videoUrl,
                `${book.title}.mp4`,
                "/books/videos"
            ) as string;



            await db.insert(books).values({
                ...book,
                coverUrl,
                videoUrl
            });
        }

        console.log("Database seeded successfully");
    } catch (error) {
        console.log(error);

        return {
            success: false,
            message: "Error seeding database"
        };
    }
}



seed();


