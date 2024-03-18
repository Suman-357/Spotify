"use client";

import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import toast from "react-hot-toast";

import useAuthModal from "@/hooks/useAuthModal";
import { useUser } from "@/hooks/useUser";


interface LikeButtonProps{
    songid: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({
    songid
}) => {

    const router = useRouter();
    const { supabaseClient } = useSessionContext();

    const authModal = useAuthModal();
    const { user } = useUser();
    const [isliked, setisliked] = useState(false);

    useEffect(()=>{
        if(!user?.id){
            return;
        }
        const fetchdata = async () =>{
            const { data, error } = await supabaseClient
            .from('liked_songs')
            .select('*')
            .eq('user_id', user.id)
            .eq('song_id', songid)
            .single();

            if(!error && data){
                setisliked(true);
            }
        }
        fetchdata();
    }, [songid, supabaseClient, user?.id]);


    const Icon = isliked ? AiFillHeart : AiOutlineHeart;

    const handleLike = async () =>{
        if(!user){
            return authModal.onOpen();
        }
        if(isliked){
            const { error } = await supabaseClient
            .from('liked_songs')
            .delete()
            .eq('user_id', user.id)
            .eq('song_id', songid);
            
            if(error){
                toast.error(error.message);
            }else {
                setisliked(false);
            }
        }else {
            const { error } = await supabaseClient
            .from('liked_songs')
            .insert({
                song_id: songid,
                user_id: user.id
            });
            if(error){
                toast.error(error.message);
            }else {
                setisliked(true);
                toast.success("Liked");
            }
        }

        router.refresh();
    }

  return (
    <button className="hover:opacity-75 transition " onClick={handleLike}>
        <Icon color={isliked ? '#22c55e' : 'white'} size={25}/>
    </button>
  )
}

export default LikeButton
