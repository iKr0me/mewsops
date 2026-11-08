import { createContext, useContext, useState, type ReactNode } from 'react';
const DemoContext = createContext({entered:false,enter:()=>{}});
/** UI onboarding state only. This is not authentication or an authorization boundary. */
export function DemoAccessProvider({children}:{children:ReactNode}) {const [entered,setEntered]=useState(false);return <DemoContext.Provider value={{entered,enter:()=>setEntered(true)}}>{children}</DemoContext.Provider>;}
export const useDemoAccess=()=>useContext(DemoContext);
