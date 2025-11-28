import axios from 'axios';
// all of google api will be here

// variables
const GOOGLE_TRANSLATE_ENDPOINT="https://translate.googleapis.com/translate_a/single";


//func
export async function googleTranslate (msg:string, targetLANG:string): Promise<any>{
    const magic=encodeURIComponent(msg);
    const url=`${GOOGLE_TRANSLATE_ENDPOINT}?client=gtx&sl=auto&tl=${targetLANG}&dt=t&q=${magic}`;
    const {data}=await axios.get(url);
    return data;
}