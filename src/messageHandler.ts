import { Response } from "./types/Response";
import { User } from "./types/User";
import { Type } from "./types/enums/Type";

let userIndex: number = 1;
const users: User[] = [];
let roomId: number = 1;
let gameId: number = 1;

export const handleMessage = (response: Response) => {
    const { data, id } = { data: JSON.parse(response.data), id: response.id };

    switch(response.type){
        case(Type.Registration) : 
            const { name, password } = data;

            let errorText = '';
            if (!name || !password) {
                errorText = 'Empty registration data';
              } else if (users.some(u => u.name === name)) {
                errorText = 'User name already exists';
              } else {
                const newUser: User = { name: name, password: password, id: response.id  }
                users.push(newUser);
              }

            return {
                type: Type.Registration,
                data: JSON.stringify({
                  name,
                  index: 0,
                  error: !!errorText,
                  errorText,
                }),
                id,
              }

        default:
            console.log('Unknown command:', data.type);
            break;
    }

}