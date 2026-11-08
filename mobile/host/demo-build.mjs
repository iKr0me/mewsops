import {readFile,writeFile,mkdir} from 'node:fs/promises';
const root=new URL('../web/',import.meta.url);
const read=(name)=>readFile(new URL(name,root),'utf8');
export async function buildDemo(){
 const css=await read('style.css');
 let app=await read('app.js');
 const mime={'calico1.jpg':'image/jpeg','calico2.jpg':'image/jpeg','map.webp':'image/webp'};
 const media={};
 for(const [name,type] of Object.entries(mime))media[name]='data:'+type+';base64,'+(await readFile(new URL(name,root))).toString('base64');
 for(const name of Object.keys(media))app=app.replaceAll('src="'+name+'"','src="\'+demoAsset("'+name+'")+\'"');
 app=app.replaceAll('esc(r.photo)','esc(demoAsset(r.photo))').replaceAll("src=\"'+activeEvidence+'","src=\"'+demoAsset(activeEvidence)+'");
 const payload='const embeddedMedia='+JSON.stringify(media)+';function demoAsset(v){return embeddedMedia[v]||v};\n'+app;
 let station=(await read('index.html')).replace('<link rel="stylesheet" href="style.css">',()=>'<style>'+css+'</style>').replace('<script defer src="app.js"></script>','').replace('</body>',()=>'<script>'+payload.replaceAll('</script','<\\/script')+'</script></body>');
 const login=await readFile(new URL('./demo-login.html',import.meta.url),'utf8');
 const result=login.replace('/* EMBED_STYLE */',()=>css).replace('EMBED_STATION',()=>Buffer.from(station).toString('base64'));
 const output = new URL('../dist/', import.meta.url);
 await mkdir(output, {recursive:true});
 await writeFile(new URL('login.html',output),result);
}
