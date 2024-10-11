import createKoaApp from "./app"
import { PrismaClient } from "@prisma/client"

async function main() {
    const prisma = new PrismaClient()
    const koaApp = createKoaApp()
}

try {
    main()
} catch (err) {
    console.error("Failed to start. Error: ", err)
}
