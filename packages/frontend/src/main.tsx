import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
import './index.scss'
import {NextUIProvider} from '@nextui-org/react'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <NextUIProvider className='w-full flex justify-center'>
            <App />
        </NextUIProvider>
    </React.StrictMode>,
)
