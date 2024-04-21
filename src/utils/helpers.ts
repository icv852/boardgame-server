import _ from "lodash"

export function hasDuplicatedObjects(arr: object[]): boolean {
    if (arr.length < 2) {
        return false
    }
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (_.isEqual(arr[i], arr[j])) {
                return true
            }
        }
    }
    return false
}