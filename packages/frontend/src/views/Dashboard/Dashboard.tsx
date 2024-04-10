import { ReactElement, useEffect, useState } from "react";
import { serverURL } from "../../utils/serverURL";

interface IUser {
    username: string;
}

export function Dashboard(): ReactElement {
    const [user, setUser] = useState<IUser | undefined>(undefined);
    useEffect(() => {
        fetch(`${serverURL}/user`).then(async (response) => {
            if (response.ok) {
                setUser(await response.json());
            }
        }).catch(() => {
            setUser(undefined);
        });
    }, []);
    return (
        <div>
            {user ? <p>Welcome {user.username}</p> : <p>Not logged in</p>}
        </div>
    )
}