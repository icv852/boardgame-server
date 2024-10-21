import createKoaApp from "./app"
import DatabaseService from "./services/database-service/DatabaseService"

async function main() {
    const db = DatabaseService.init()
    const koaApp = createKoaApp(db)

    koaApp.listen(4000, () => console.log("Server is listening on port 4000."))
}

try {
    main()
} catch (err) {
    console.error("Failed to start. Error: ", err)
}
