import { FormEvent, ReactElement, useRef } from "react";
import { serverURL } from "../../utils/serverURL";
import { PassageFlex } from "@passageidentity/passage-flex-js";

const passage = new PassageFlex(import.meta.env.PASSAGE_APP_ID);

export function Login(): ReactElement {
    const username = useRef<HTMLInputElement>(null);
    const password = useRef<HTMLInputElement>(null);
    const login = async (event: FormEvent) => {
        event.preventDefault();
        await fetch(`${serverURL}/auth/password/login`, { 
            method: 'POST', 
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include',
            body: JSON.stringify({username: username.current?.value, password: password.current?.value}),
        });
    }
    const loginWithPasskey = async () => {
        const res = await fetch(`${serverURL}/auth/passkey/login`, { 
            method: 'POST', 
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({username: username.current?.value}),
        });
        const resBody = await res.json();
        const transactionID = resBody.transaction_id;
        const nonce = await passage.passkey.authenticate({transactionId: transactionID});
        await fetch(`${serverURL}/auth/passkey/verify`, { 
            method: 'POST', 
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include',
            body: JSON.stringify({username: username.current?.value, nonce: nonce}),
        });
    }
    return (
        <>
        <form method="post" onSubmit={login} style={{display: 'flex', flexDirection: 'column'}}>
            <label>Username: <input name="username" placeholder="username" type="text" ref={username}/></label>
            <label>Password: <input name="username" placeholder="username" type="password" ref={password}/></label>
            <button type="submit">Login</button>
        </form>
        <button onClick={loginWithPasskey}>Login with Passkey</button>
        </>
    )
}