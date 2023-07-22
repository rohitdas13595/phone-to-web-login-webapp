'use client'
import { useEffect, useState } from "react";
import axios from "axios";
// import apis from "../apis/auth"
import QRCode from "react-qr-code";
import { useCookies } from "react-cookie";
import Router from "next/router";

// THIS IS LOGIN PAGE


import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:4000';
const dataServer =  'http://localhost:4000'

export const socket = io(URL);



export default function Home() {
  const [qr_data, setQrData] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [isConnected,setIsConnected] = useState(false);
  const [count , setCount] = useState(0)

  const getQRCode = async () => {
    try {
      let res = await axios.get(dataServer+'/qr');
      setQrData(res.data.data);
      return res.data.data;
    } catch (e) {
      alert("Cannot fetch QR Data");
    }
    return null;
  };

  const handleLogin = async (data) => {
    const token = data.token;
    const user_id = data.user_id;
    try {
      let res = await axios.post(apis({}).VERIFY_TOKEN.url, { token, user_id });
      await Router.replace("/profile");
      return res.data.data;
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const showQrCode = () => {
    getQRCode().then((res) => {
      setLoading(false);
      if (res) {
        console.log('res', res);
        socket.emit('join', {code: res?.channel});
      }
    });
  };

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onFooEvent(value) {
      setFooEvents(previous => [...previous, value]);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('foo', onFooEvent);
    socket.on('login',(data)=>{
        console.log('data',data);
    })



    setTimeout(()=>{
        setCount(count>1000? 0:count+1);
    },20000)

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('foo', onFooEvent);
    };
  }, [count]);

  useEffect(() => {
    setLoading(true);
    showQrCode();
    setInterval(() => {
      showQrCode();
    }, 60000);
  }, []);
  if (isLoading)
    return (
      <div>
        <h2>Loading...</h2>
      </div>
    );
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <div>
          <div className="title">Please Scan Login Authenticate</div>
          <div style={{ marginTop: 50, background: "white", padding: "16px" }}>
            {qr_data ? <QRCode value={qr_data.channel} size={320} /> : null}
          </div>
        </div>
      </div>
    </main>
  );
}
