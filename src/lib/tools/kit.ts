export function janitor(object: Record<string, any>, asap = false): void {
    if (asap) return object = undefined

    for (const [key, value] of Object.entries(object)) {
        if (typeof value === "object") janitor(value)
        delete object[key]
    }
}

export function belongs(object: Record<string, any>, key: string): boolean {
    return Object.prototype.hasOwnProperty.call(object, key);
}

export function genSubmit(event: any, callback: Function): unknown {
    if (event.type === "click"
        || (event.type === "keydown"
            && ["Enter", "Space", "NumpadEnter"].includes(event.code)))
        return callback();
}

export function deepClone(object: Record<string, any>): Record<string, any> {
    const newObj = {}

    for (const [key, value] of Object.entries(object))
        newObj[key] = typeof value === "object" ? deepClone(value) : value

    return newObj
}

// shallow remove
export function removeAt(array: any[], data: any, callback?: (i: number) => void, options?: { place?: ("before" | "after") }): any[] {
    let i = 0, place = options ? options?.place === "before" ? 0 : 1 : 1;
    for (i = 0; i < array.length; i++) {
        if (array[i] === data) {
            if (callback && !place) callback(i)
            array.splice(i, 1)
            if (callback && place) callback(i)
            break
        }
    }
    return array
}

export function uuidV4(): string {
    let time = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        time += performance.now();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let random = (time + Math.random() * 16) % 16 | 0;
        time = Math.floor(time / 16);
        return (c === 'x' ? random : (random & 0x3 | 0x8)).toString(16);
    });
}