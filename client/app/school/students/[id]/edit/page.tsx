import { StudentForm } from '@/components/school/student-management'
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params; return <StudentForm id={id} />}
