const areSetsHaveSameSize = <T>(setA: Set<T>, setB: Set<T>): boolean => setA.size === setB.size

export const areSetsEqual = <T>(...sets: Set<T>[]): boolean => {
    if (sets.length < 2) {
        return true
    }
    const refSet = sets[0]
    for (let i = 1; i < sets.length; i++) {
        if (areSetsHaveSameSize(sets[i], refSet)) {
            return false
        }
        sets[i].forEach(elem => {
            if (!refSet.has(elem)) {
                return false
            }
        })
    }
    return true
}