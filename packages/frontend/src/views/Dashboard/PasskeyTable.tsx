import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue} from "@nextui-org/react";
import { WebAuthnDevice } from "./types";
import { Key, ReactElement } from "react";
import dayjs from 'dayjs';

interface IPasskeyTableProps {
    passkeys: WebAuthnDevice[];
    revoke: (passkey: WebAuthnDevice) => Promise<void>;
}

const columns = [
    {
      key: "friendlyName",
      label: "Passkey",
    },
    {
      key: "createdAt",
      label: "Added",
    },
    {
      key: "lastLoginAt",
      label: "Last login",
    },
    {
        key: "revoke",
        label: "",
      },
  ];

function PasskeyName(props: {passkey: WebAuthnDevice}): ReactElement {
    const icon = props.passkey.icons.light ?? '/passkey.svg';
    return (
        <div className="flex items-center">
            {icon && <img src={icon} alt="passkey" className="w-6 h-6 mr-2"/>}
            <span>{props.passkey.friendlyName}</span>
        </div>
    );
}

function TimeRenderer(props: {date: Date}): ReactElement {
    return <span>{dayjs(props.date).format('MMMM D, YYYY')}</span>
}

function RevokePasskey(props: {passkey: WebAuthnDevice, revoke: (passkey: WebAuthnDevice)=>Promise<void>}): ReactElement {
    return <button onClick={() => props.revoke(props.passkey)}><img src="/close.svg" alt="revoke passkey" className="min-w-3 min-h-3"/></button>
}

export function PasskeyTable(props: IPasskeyTableProps): ReactElement {
    const renderCell = (item: WebAuthnDevice, columnKey: Key): ReactElement => {
        switch (columnKey) {
            case "friendlyName":
                return <PasskeyName passkey={item}/>
            case "createdAt":
                return <TimeRenderer date={item.createdAt}/>
            case "lastLoginAt":
                return <TimeRenderer date={item.lastLoginAt}/>
            case "revoke":
                return <RevokePasskey passkey={item} revoke={props.revoke}/>
            default:
                return <span>{getKeyValue(item, columnKey)}</span>
        }
    }

    return (
        <Table className="mt-4">
            <TableHeader>
                {columns.map((column) => (
                    <TableColumn key={column.key}>{column.label}</TableColumn>
                ))}
            </TableHeader>
            <TableBody items={props.passkeys} emptyContent={"No passkeys registered."}>
            {(item) => (
                <TableRow key={item.id}>
                    {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                </TableRow>
            )}
            </TableBody>
        </Table>
    );
}