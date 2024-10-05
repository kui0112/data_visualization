const local = 'localhost:9999'
const remote = '103.40.13.76:52797'

const host: string = remote

export const apiAddress = (url: string) => `http://${host}${url}`
export const wsAddress = (url: string) => `ws://${host}${url}`

export const objectNames = async () => {
    return await fetch(apiAddress("/object_names")).then(async (res) => await res.json())
}

export const updateDisplay = async (object_name: string) => {
    return await fetch(apiAddress(`/update_display?object_name=${object_name}`)).then(async (res) => await res.json())
}

export const currentObjectName = async () => {
    return await fetch(apiAddress(`/current_object_name`)).then(async (res) => await res.json())
}

export const vectors = async (object_name: string) => {
    return await fetch(apiAddress(`/vectors?object_name=${object_name}`)).then(async (res) => await res.json())
}

export const knowledgeGraph = async (object_name: string) => {
    return await fetch(apiAddress(`/knowledge_graph?object_name=${object_name}`)).then(async (res) => await res.json())
}

export const pictures = async (object_name: string) => {
    return await fetch(apiAddress(`/pictures?object_name=${object_name}`)).then(async (res) => await res.json())
}

export const ws_connect = async (): Promise<WebSocket | null> => {
    return new Promise(resolve => {
        let count = 0
        const timerId = setInterval(() => {
            if (count > 3) {
                console.log("ws reconnect failed.")
                resolve(null)
                clearInterval(timerId)
            }
            try {
                const ws = new WebSocket(wsAddress("/ws"))
                clearInterval(timerId)
                resolve(ws)
            } catch (e) {
                console.log("ws connect failed, reconnecting...")
            }
            count++
        }, 1000)
    })
}
