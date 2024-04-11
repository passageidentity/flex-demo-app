import { ReactElement } from "react";
import { Card } from "@nextui-org/react";
import { AddPasskey } from "../components/AddPasskey/AddPasskey";

export function AddPasskeyView(): ReactElement {
    return (
        <Card className="min-w-80 max-w-2xl">
            <AddPasskey/>
        </Card>
    )
}