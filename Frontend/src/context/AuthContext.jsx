import React,{ createContext, useContext,useState, useEffect } from "react";

const AuthContext=createContext();

export const AuthProvider=({children})=>{

    const [user,setUser]=useState(null);
    const [loading,setLoading]=useState(true);
    useEffect(()=>{
        const token=localStorage.getItem('token');
        if(token){
            setUser({loggedIn:true,token:token});
        }
        setLoading(false);
    },[]);
    const login=(userData,token)=>{
        localStorage.setItem('token',token);
        setUser(userData);
    }
    const logout=()=>{
        localStorage.removeItem('token');
        setUser(null);
    }
    return(
        <AuthContext.Provider value={{user,login,logout,loading}}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
export const useAuth=()=>useContext(AuthContext);