import { ReactElement, useEffect, useState } from "react";
import { serverURL } from "../../utils/serverURL";
import { PassageFlex } from "@passageidentity/passage-flex-js";
import { Input, Button, Card, CardHeader, CardBody, CardFooter, Skeleton } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { WebAuthnDevice } from "./types";
import { PasskeyTable } from "./PasskeyTable";

interface IUser {
    username: string;
    passkeys: WebAuthnDevice[];
}

const passage = new PassageFlex(import.meta.env.PASSAGE_APP_ID);

export function Dashboard(): ReactElement {
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<IUser | undefined>(undefined);
    const [canRegisterPasskey, setCanRegisterPasskey] = useState<boolean>(false);

    const loadUser = async () =>{
        fetch(`${serverURL}/auth/user`).then(async (response) => {
            if (response.ok) {
                setUser(await response.json());
            }
        }).catch(() => {
            setUser(undefined);
        }).finally(()=>{
            setLoading(false);
        });
    }

    const revokePasskey = async (passkey: WebAuthnDevice) => {
        await fetch(`${serverURL}/auth/user/revokePasskey`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({id: passkey.id}),
        });
        await loadUser();
    }

    useEffect(() => {
        loadUser();
        passage.passkey.canRegisterPasskey().then(setCanRegisterPasskey);
    }, []);

    const addPasskey = async () => {
        const res = await fetch(`${serverURL}/auth/passkey/add`, {
            method: 'POST',
        });
        const resBody = await res.json();
        const transactionID = resBody.transactionId;
        try {
            await passage.passkey.register(transactionID);
            await loadUser();
        }
        catch(error) {
            console.log(error);
        }
    }

    const Loading = (
        <>
            <CardBody>
                <Skeleton className="h-8 w-3/5 rounded-lg"/>
                <Skeleton className="mt-10 h-8 w-5/5 rounded-lg"/>
                <Skeleton className="mt-4 h-48 w-5/5 rounded-lg"/>
            </CardBody>
        </>
    );

    const Unauthenticated = (
        <>
            <CardBody>
                <p> You are not currently logged in. Please go to login.</p>
                <CardFooter className="justify-center">
                    <Button size="lg" color="primary" onClick={()=>navigate('/login')}>Login</Button>
                </CardFooter>
            </CardBody>
        </>
    );

    const Authenticated = (
        <>
            <CardBody>
                <Input
                    isReadOnly
                    type="username"
                    label="Username"
                    labelPlacement="outside-left"
                    variant="bordered"
                    defaultValue={user?.username}
                />
                {
                    canRegisterPasskey && 
                    (
                        <div className="flex justify-end mt-8">
                            <Button size="sm" radius="md" color="primary" onClick={addPasskey}>Add Passkey</Button>
                        </div>
                    )
                }
                <PasskeyTable passkeys={user?.passkeys ?? []} revoke={revokePasskey}/>
            </CardBody>
        </>
    )
    return (
        <Card className="min-w-80 w-3/5 max-w-xl p-4">
            <CardHeader><h2> User Profile</h2></CardHeader>
            {loading && Loading}
            {!loading && !user && Unauthenticated}
            {!loading && user && Authenticated}
        </Card>
    )
}