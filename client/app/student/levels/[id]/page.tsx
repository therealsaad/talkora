import { LevelDetail } from '@/components/student/learning-flow'
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <LevelDetail id={id}/>}
