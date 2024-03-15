"use client";


import { useEffect, useState } from 'react'

import Modal from '@/components/Modal';
import AuthModal from '@/components/AuthModal';

const ModalProvider = () => {
    const [ismounted, setismounted] = useState(false);

    useEffect(()=>{
        setismounted(true);
    },[])

    if(!ismounted){
        return null;
    }

  return (
    <div>
        <AuthModal/>
    </div>
  )
}

export default ModalProvider
