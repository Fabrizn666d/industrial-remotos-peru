import "server-only";
import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {getPostgresPool} from '@/lib/backend/postgres-client';
export class AdminConflict extends Error{constructor(){super('Otro usuario modificó este registro. Recarga antes de guardar.')}}
type Entry<T>={version:number;value:T};let queue:Promise<unknown>=Promise.resolve();
const file=()=>path.resolve(process.env.IRP_ADMIN_DATA_PATH||path.join(process.cwd(),'.data','irp-admin.json'));
const postgres=()=>process.env.IRP_REPOSITORY_DRIVER?.trim().toLowerCase()==='postgres';
function assertDriver(){if(!postgres()&&process.env.NODE_ENV==='production')throw Error('El almacenamiento administrativo requiere PostgreSQL en producción.')}
async function read():Promise<Record<string,Entry<unknown>>>{try{return JSON.parse(await readFile(file(),'utf8'))}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return {};throw e}}
export async function getAdminRecord<T>(key:string,initial:T):Promise<Entry<T>>{assertDriver();if(postgres()){const r=await getPostgresPool().query('SELECT version,payload FROM irp_admin_workspaces WHERE key=$1',[key]);return r.rows[0]?{version:r.rows[0].version,value:r.rows[0].payload as T}:{version:0,value:initial}}return ((await read())[key] as Entry<T>)??{version:0,value:initial}}
export async function mutateAdminRecord<T>(key:string,initial:T,mutate:(v:T)=>T|Promise<T>,expected?:number):Promise<Entry<T>>{assertDriver();if(postgres()){const c=await getPostgresPool().connect();try{await c.query('BEGIN');await c.query('SELECT pg_advisory_xact_lock(hashtext($1))',[key]);const r=await c.query('SELECT version,payload FROM irp_admin_workspaces WHERE key=$1 FOR UPDATE',[key]);const old=r.rows[0]?{version:r.rows[0].version,value:r.rows[0].payload as T}:{version:0,value:initial};if(expected!==undefined&&expected!==old.version)throw new AdminConflict();const next={version:old.version+1,value:await mutate(old.value)};await c.query('INSERT INTO irp_admin_workspaces(key,version,payload) VALUES($1,$2,$3::jsonb) ON CONFLICT(key) DO UPDATE SET version=EXCLUDED.version,payload=EXCLUDED.payload,updated_at=now()',[key,next.version,JSON.stringify(next.value)]);await c.query('COMMIT');return next}catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}}
const work=queue.then(async()=>{const state=await read();const old=(state[key] as Entry<T>)??{version:0,value:initial};if(expected!==undefined&&expected!==old.version)throw new AdminConflict();const next={version:old.version+1,value:await mutate(old.value)};state[key]=next;await mkdir(path.dirname(file()),{recursive:true});const tmp=`${file()}.${randomUUID()}.tmp`;await writeFile(tmp,JSON.stringify(state),{mode:0o600});await rename(tmp,file());return next});queue=work.catch(()=>{});return work}
export type AdminEvent={id:string;actor:string;section:string;action:string;createdAt:string};
export async function logAdminEvent(actor:string,section:string,action:string){await mutateAdminRecord<AdminEvent[]>('activity',[],v=>[{id:randomUUID(),actor,section,action,createdAt:new Date().toISOString()},...v].slice(0,3000))}
