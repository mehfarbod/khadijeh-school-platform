import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { requireRole } from "@/lib/auth/authorization";

const allowed = new Map([["image/jpeg","jpg"],["image/png","png"],["image/webp","webp"]]);

export async function POST(request:NextRequest){
  try{
    await requireRole(["SUPER_ADMIN","SCHOOL_ADMIN","CONTENT_MANAGER"]);
    const formData=await request.formData();
    const file=formData.get("file");
    const folder=String(formData.get("folder")||"gallery").replace(/[^a-z0-9_-]/gi,"");
    if(!(file instanceof File)) return NextResponse.json({error:"فایل تصویر ارسال نشده است."},{status:400});
    const ext=allowed.get(file.type);
    if(!ext) return NextResponse.json({error:"فرمت مجاز: JPG، PNG یا WEBP."},{status:400});
    if(file.size>5*1024*1024) return NextResponse.json({error:"حداکثر حجم تصویر ۵ مگابایت است."},{status:400});
    const dir=path.join(process.cwd(),"public","uploads",folder);
    await mkdir(dir,{recursive:true});
    const name=Date.now()+"-"+crypto.randomUUID()+"."+ext;
    await writeFile(path.join(dir,name),Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({url:"/uploads/"+folder+"/"+name},{status:201});
  }catch(e){const status=e instanceof Error&&e.message==="UNAUTHORIZED"?401:e instanceof Error&&e.message==="FORBIDDEN"?403:500;return NextResponse.json({error:status===403?"مجوز بارگذاری تصویر را ندارید.":"خطا در بارگذاری تصویر"},{status})}
}
