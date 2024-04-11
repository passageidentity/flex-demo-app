import { ReactElement, useEffect, useState } from "react";
import { serverURL } from "../../utils/serverURL";
import { PassageFlex } from "@passageidentity/passage-flex-js";

interface IUser {
    username: string;
}

const passage = new PassageFlex(import.meta.env.PASSAGE_APP_ID);

export function Dashboard(): ReactElement {
    const [user, setUser] = useState<IUser | undefined>(undefined);
    useEffect(() => {
        fetch(`${serverURL}/auth/user`).then(async (response) => {
            if (response.ok) {
                setUser(await response.json());
            }
        }).catch(() => {
            setUser(undefined);
        });
    }, []);

    const addPasskey = async () => {
        const res = await fetch(`${serverURL}/auth/passkey/add`, {
            method: 'POST',
        });
        const resBody = await res.json();
        const transactionID = resBody.transaction_id;
        await passage.passkey.register(transactionID);
    }

    const Authenticated = (
        <>
            <p>Welcome {user?.username}</p>
            <button onClick={addPasskey}>Add Passkey</button>
        </>
    )
    return (
        <div>
            {user ? Authenticated : <p>Not logged in</p>}
        </div>
    )
}