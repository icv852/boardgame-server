import createKoaApp from "./app"
import DatabaseService from "./services/database-service/DatabaseService"

async function main() {
    const db = DatabaseService.init()
    const koaApp = createKoaApp(db)
}

try {
    main()
} catch (err) {
    console.error("Failed to start. Error: ", err)
}
