import { FormEvent, ReactElement, useEffect, useRef, useState } from "react";
import { serverURL } from "../../utils/serverURL";
import { PassageFlex } from "@passageidentity/passage-flex-js";
import { useNavigate } from "react-router-dom";
import { Input, Button, Card, CardHeader, CardBody, CardFooter } from "@nextui-org/react";

const passage = new PassageFlex(import.meta.env.PASSAGE_APP_ID);

enum LoginState {
    Initial,
    Password,
    Passkey,
    AddPasskey,
}

export function Login(): ReactElement {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const navigate = useNavigate();
    const transactionID = useRef<string>('');

    const [loginState, setLoginState] = useState<LoginState>(LoginState.Initial);

    const verifyNonce = async (nonce: string) => {
        const res = await fetch(`${serverURL}/auth/passkey/verify`, { 
            method: 'POST', 
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include',
            body: JSON.stringify({nonce: nonce}),
        });
        if(res.ok){
            navigate('/dashboard')
        }
    }
    const loginWithPassword = async (event: FormEvent) => {
        event.preventDefault();
        const res = await fetch(`${serverURL}/auth/password/login`, { 
            method: 'POST', 
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include',
            body: JSON.stringify({username: username, password: password}),
        });
        if(res.ok){
            navigate('/dashboard')
        }
    }
    const loginWithPasskey = async () => {
        //@ts-ignore
        const nonce = await passage.passkey.authenticate({transactionId: transactionID.current});
        await verifyNonce(nonce);
    }

    const checkPasskey = async () =>{
        if(!await passage.passkey.canAuthenticateWithPasskey()){
            setLoginState(LoginState.Password);
            return;
        }
        const res = await fetch(`${serverURL}/auth/passkey/login`, { 
            method: 'POST', 
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({username: username}),
        });
        if(res.ok){
            transactionID.current = (await res.json()).transaction_id;
            setLoginState(LoginState.Passkey);
        } else {
            setLoginState(LoginState.Password);
        }
    }

    useEffect(()=>{
        // @ts-ignore
       passage.passkey.authenticate({isConditionalMediation: true}).then((nonce)=>{
            verifyNonce(nonce);
       })
    }, [])

    const initialState = (
        <>
            <CardHeader className="justify-center"><h2>Login</h2></CardHeader>
            <CardBody className="gap-y-4">
                    <Input size="sm" label="Username" name="username" autoComplete="username webauthn" type="text" value={username} onValueChange={setUsername}/>
            </CardBody>
            <CardFooter className="justify-center">
                <Button color="primary" size="lg" type="submit" onClick={checkPasskey}>Continue</Button>
            </CardFooter>
        </>
    );

    const passkeyState = (
        <>
            <CardHeader className="justify-center"><h2>Login with Passkey</h2></CardHeader>
            <CardBody>
            <p className="max-w-72">
                Passkeys are a simple and more secure alternative to
                passwords.
                <br />
                <br />
                Log in with the method you already use to unlock your device. <a href="https://blog.1password.com/what-is-webauthn/" target="_blank" rel="noopener noreferrer"><u>Learn more →</u></a>
            </p>
            </CardBody>
            <CardFooter className="justify-center">
                <Button color="primary" size="lg" type="submit" onClick={loginWithPasskey}>Login</Button>
            </CardFooter>
        </>
    );

    const passwordState = (
        <>
            <CardHeader className="justify-center"><h2>Login with Password</h2></CardHeader>
            <CardBody className="gap-y-4">
                    <Input size="sm" label="Password" name="password" value={password} onValueChange={setPassword}/>
            </CardBody>
            <CardFooter className="justify-center">
                <Button color="primary" size="lg" type="submit" onClick={loginWithPassword}>Login</Button>
            </CardFooter>
        </>
    );

    return (
        <Card className="min-w-80 max-w-2xl">
            {loginState === LoginState.Initial && initialState}
            {loginState === LoginState.Passkey && passkeyState}
            {loginState === LoginState.Password && passwordState}
        </Card>
    )
}