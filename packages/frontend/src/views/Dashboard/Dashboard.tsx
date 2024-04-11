import { ReactElement, useEffect, useState } from "react";
import { serverURL } from "../../utils/serverURL";
import { PassageFlex } from "@passageidentity/passage-flex-js";
import { Input, Button, Card, CardHeader, CardBody } from "@nextui-org/react";

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
            <CardHeader><h2> User Profile</h2></CardHeader>
            <CardBody>
                <Input
                    isReadOnly
                    type="username"
                    label="Username"
                    labelPlacement="outside-left"
                    variant="bordered"
                    defaultValue={user?.username}
                />
                <div className="flex justify-end mt-8">
                    <Button size="sm" radius="md" color="primary" onClick={addPasskey}>Add Passkey</Button>
                </div>
            </CardBody>
        </>
    )
    return (
        <Card className="min-w-80 w-3/5 max-w-xl">
            {user ? Authenticated : <p>Not logged in</p>}
        </Card>
    )
}