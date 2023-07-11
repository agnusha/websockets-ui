import { Response } from "./types/Response";
import { User } from "./types/User";
import { Type } from "./types/enums/Type";

let userIndex: number = 1;
const users: User[] = [];
let roomId: number = 1;
let gameId: number = 1;

export const handleMessage = (response: Response) => {
    const data = response.data;

    switch(data.type){
        case(Type.Registration) : 
            const newUser: User = { name: data.name, password: data.password, id: response.id  }
            users.push(newUser);
            break;

        default:
            console.log('Unknown command:', data.type);
            break;
    }

}