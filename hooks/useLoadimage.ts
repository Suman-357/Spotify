import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Song } from '@/types'


const useLoadimage = (song: Song) => {
    const supabaseClient = useSupabaseClient();

    if(!song){
        return null;
    }

    const { data: imagedata } = supabaseClient
    .storage
    .from('images')
    .getPublicUrl(song.image_path);

    return imagedata.publicUrl;

};

export default useLoadimage
