const EXCHANGE = 'send'
export default async (instance: any, { message, routingKey }: any) => {
    try {
        await instance.createEx({
            name: EXCHANGE,
            type: 'direct'
        })
        await instance.publish({ ex: EXCHANGE, routingKey }, message)
        return Promise.resolve()
    } catch (error) {
        return Promise.reject(error)
    }
}