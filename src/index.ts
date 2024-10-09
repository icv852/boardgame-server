import DatabaseManager from "./services/database-service/DatabaseManager"

async function main() {
    const db = DatabaseManager.init()
}

try {
    main()
} catch (err) {
    console.error("Failed to start. Error: ", err)
}
