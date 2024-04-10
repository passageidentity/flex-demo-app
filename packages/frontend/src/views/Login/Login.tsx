import { FormEvent, ReactElement, useRef } from "react";
import { serverURL } from "../../utils/serverURL";

export function Login(): ReactElement {
    const username = useRef<HTMLInputElement>(null);
    const password = useRef<HTMLInputElement>(null);
    const login = async (event: FormEvent) => {
        event.preventDefault();
        await fetch(`${serverURL}/auth/login/password`, { 
            method: 'POST', 
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({username: username.current?.value, password: password.current?.value})
        });
    }
    return (
        <form method="post" onSubmit={login} style={{display: 'flex', flexDirection: 'column'}}>
            <label>Username: <input name="username" placeholder="username" type="text" ref={username}/></label>
            <label>Password: <input name="username" placeholder="username" type="password" ref={password}/></label>
            <button type="submit">Login</button>
        </form>
    )
}