import uniqid from "uniqid";
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import toast from 'react-hot-toast';
import useUploadModal from '@/hooks/useUploadModal';
import Modal from './Modal'
import Input from './Input';
import Button from './Button';
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";

const UploadModal = () => {

    const [isLoading, setisLoading] = useState(false);
    const uploadmodal = useUploadModal();
    const { user } = useUser();
    const supabaseClient = useSupabaseClient();
    const router = useRouter();
    const { register, handleSubmit, reset} = useForm<FieldValues>({
        defaultValues: {
            author: '',
            title: "",
            song: null,
            image: null,
        }
    });

    const onChange = (open: boolean) => {
        if(!open) {
            reset();
            uploadmodal.onClose();
        }
    }


const onSubmit: SubmitHandler<FieldValues> = async (values) => {
        try {
            setisLoading(true);
            const imagefile = values.image?.[0]
            const songfile = values.song?.[0]

            if(!imagefile || !songfile || !user){
                toast.error("Missing field")
                return;
            }

            const uniqueid = uniqid();
            const {
                data: songdata,
                error: songerror
            } = await supabaseClient
            .storage
            .from('songs')
            .upload(`song-${values.title}-${uniqueid}`,songfile,{
                cacheControl: '3600',
                upsert: false
            })

            if(songerror){
                setisLoading(false)
                return toast.error("Failed to upload song")
            }

            const {
                data: imagedata,
                error: imageerror
            } = await supabaseClient
            .storage
            .from('images')
            .upload(`image-${values.title}-${uniqueid}`,imagefile,{
                cacheControl: '3600',
                upsert: false
            })

            if(imageerror){
                setisLoading(false)
                return toast.error("Failed to upload image")
            }

            const {
                error: supabaseClienterror
            } = await supabaseClient
            .from('songs')
            .insert({
                user_id: user.id,
                title: values.title,
                author: values.author,
                image_path: imagedata.path,
                song_path: songdata.path,
            })

            if(supabaseClienterror){
                setisLoading(false)
                return toast.error(supabaseClienterror.message);
            }

            router.refresh();
            setisLoading(false);
            toast.success("song created!")
            reset();
            uploadmodal.onClose();
        } catch (error) {
            toast.error("Something went wrong")
        }
}



  return (
    <Modal title='Add a Song' description='upload an mp3 file' isOpen={uploadmodal.isOpen} onChange={onChange}>
         <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-y-4'>
            <Input id='title' disabled={isLoading} {...register('title', { required: true })} placeholder='song title'  />
            <Input id='author' disabled={isLoading} {...register('author', { required: true })} placeholder='song author'  />
            <div className="">
                <div className="pb-1">
                    Select a song file
                </div>
                <Input id='song' type='file' accept='.mp3' disabled={isLoading} {...register('song', { required: true })} />
            </div>
            <div className="">
                <div className="pb-1">
                    Select an image
                </div>
                <Input id='image' type='file' accept='image/*' disabled={isLoading} {...register('image', { required: true })} />
            </div>
            <Button disabled={isLoading} type='submit'>
                Create
            </Button>
         </form>
    </Modal>
  )
}

export default UploadModal;
