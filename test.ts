import z from 'zod';

const url = String("https://jsonplaceholder.typicode.com/todos/1")

const dataJSON = z.object({
    userId: z.number(),
    id: z.number(),
    title: z.string(),
    completed: z.boolean()
})

async function get_data(): Promise<string> {
    const res = await fetch(url)
    const json = await res.json()
    const data = dataJSON.parse(json)

    if (!data){
        return 'error';
    }
    return JSON.stringify(data,null, 2)
    
}

const callfunc = await get_data()
console.log (callfunc)