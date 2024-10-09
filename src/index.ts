import DatabaseService from "./services/database-service/DatabaseService"
import createKoaApp from "./app"

async function main() {
    // const db = DatabaseService.init()
    const koaApp = createKoaApp()
}

try {
    main()
} catch (err) {
    console.error("Failed to start. Error: ", err)
}
