import 'dotenv/config'
import createKoaApp from "./app"
import DatabaseService from "./services/database-service/DatabaseService"
import AuthService from "./services/auth-service/AuthService"

async function main() {
    const db = DatabaseService.init()
    const authService = AuthService.init(db)
    const koaApp = createKoaApp(authService)

    koaApp.listen(process.env.PORT, () => console.log(`Server is listening on port ${process.env.PORT}.`))
}

try {
    main()
} catch (err) {
    console.error("Failed to start. Error: ", err)
}
