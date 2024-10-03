import mitt from 'mitt'

export const eventbus = mitt()

export function randomChoice<T>(choices: Array<T>): T {
    return choices[Math.floor(Math.random() * choices.length)];
}

export async function delay(timeout: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, timeout * 1000))
}
