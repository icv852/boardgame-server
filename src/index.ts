import app from "./app"
import DatabaseService from "./services/DatabaseService"
import { Effect } from "effect"

const PORT = 3000

async function main() {
    const db = await DatabaseService.init()
    // const res = await db.createUser("tester1", "dummy_password")
    // const test = Effect.match(res, {
    //     onFailure: (err) => console.log(err),
    //     onSuccess: () => console.log("success")
    // })

    // Effect.runPromise(test)
    // const res2 = await db.getUser(1)
    // const test2 = Effect.match(res2, {
    //     onFailure: (err) => console.log(err),
    //     onSuccess: (value) => console.log(value)
    // })
    // Effect.runPromise(test2)
    // // if (Effect.isSuccess(res)) {
    // //     console.log("success")
    // // } else {
    // //     console.log(`failed: ${res}`)
    // // }
    // // await db.getUser("")
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}.`))
}

try {
    main()
} catch (err) {
    console.error("Failed to start. Error: ", err)
}
